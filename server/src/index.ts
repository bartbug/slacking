import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Validate required env vars
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment');
}

import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { PrismaClient, Prisma } from '@prisma/client';
import rateLimit from 'express-rate-limit';
import { ServerToClientEvents, ClientToServerEvents } from './types/socket';
import jwt from 'jsonwebtoken';

// Import routes
import authRoutes from './routes/auth';
import channelRoutes from './routes/channels';
import messageRoutes from './routes/messages';
import threadRoutes from './routes/threads';

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

// Track connected users and their socket IDs
interface ConnectedUser {
  userId: string;
  socketId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
}

const connectedUsers = new Map<string, ConnectedUser>();

// Helper functions for presence
const updateUserPresence = async (userId: string, status: 'online' | 'away' | 'offline') => {
  const user = connectedUsers.get(userId);
  if (user) {
    user.status = status;
    user.lastSeen = new Date();
    connectedUsers.set(userId, user);
    
    // Broadcast presence update to all connected clients
    io.emit('presence:update', {
      userId,
      status,
      lastSeen: user.lastSeen
    });
  }
};

const removeUserPresence = (socketId: string) => {
  for (const [userId, user] of connectedUsers.entries()) {
    if (user.socketId === socketId) {
      user.status = 'offline';
      user.lastSeen = new Date();
      connectedUsers.set(userId, user);
      
      // Broadcast offline status
      io.emit('presence:update', {
        userId,
        status: 'offline',
        lastSeen: user.lastSeen
      });
      break;
    }
  }
};

// Updated CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:8000'
];

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/auth', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/threads', threadRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Socket.IO connection handling
io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
  console.log('Client connected:', socket.id);

  // Handle authentication and set up presence
  const token = socket.handshake.auth.token;
  if (!token) {
    socket.emit('error', { message: 'Authentication required' });
    socket.disconnect();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    // Add user to connected users
    connectedUsers.set(userId, {
      userId,
      socketId: socket.id,
      status: 'online',
      lastSeen: new Date()
    });

    // Broadcast user's online status
    updateUserPresence(userId, 'online');

    // Send current presence list to the newly connected user
    socket.emit('presence:list', Array.from(connectedUsers.values()));

    // Handle status updates
    socket.on('presence:status', async (status) => {
      await updateUserPresence(userId, status);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      removeUserPresence(socket.id);
    });

  } catch (error) {
    console.error('Authentication error:', error);
    socket.emit('error', { message: 'Authentication failed' });
    socket.disconnect();
    return;
  }

  // Join a channel room
  socket.on('join-channel', async ({ channelId, cursor, limit = 50 }: { channelId: string; cursor?: string; limit?: number }) => {
    console.log(`Socket ${socket.id} joining channel ${channelId}, cursor: ${cursor}, limit: ${limit}`);
    socket.join(`channel:${channelId}`);

    // Send existing messages to the client
    try {
      const messages = await prisma.message.findMany({
        where: {
          channelId,
          parentId: null,
          ...(cursor && {
            createdAt: {
              lt: new Date(cursor)
            }
          })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              lastSeen: true
            }
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  status: true,
                  lastSeen: true
                }
              }
            }
          },
          _count: {
            select: { replies: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit + 1
      });
      
      const hasMore = messages.length > limit;
      const paginatedMessages = hasMore ? messages.slice(0, limit) : messages;
      const nextCursor = hasMore ? messages[limit - 1].createdAt.toISOString() : null;

      socket.emit('channel-messages', {
        messages: paginatedMessages.reverse(), // Reverse to show oldest first
        nextCursor,
        hasMore
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      socket.emit('error', { message: 'Failed to fetch messages' });
    }
  });

  // Leave a channel room
  socket.on('leave-channel', (channelId: string) => {
    console.log(`Socket ${socket.id} leaving channel ${channelId}`);
    socket.leave(`channel:${channelId}`);
  });

  // Join a direct message room
  socket.on('join-dm', (userId: string) => {
    console.log(`Socket ${socket.id} joining DM room ${userId}`);
    socket.join(`dm:${userId}`);
  });

  // Handle new channel message
  socket.on('channel-message', async (message: { content: string; channelId: string; userId: string }) => {
    try {
      const savedMessage = await prisma.message.create({
        data: {
          content: message.content,
          channelId: message.channelId,
          userId: message.userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              lastSeen: true
            }
          }
        }
      });

      console.log('New channel message saved:', savedMessage);
      io.to(`channel:${message.channelId}`).emit('new-channel-message', savedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Failed to save message' });
    }
  });

  // Handle new direct message
  socket.on('direct-message', async (message: { content: string; senderId: string; receiverId: string }) => {
    try {
      const savedMessage = await prisma.directMessage.create({
        data: {
          content: message.content,
          senderId: message.senderId,
          receiverId: message.receiverId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      console.log('New direct message saved:', savedMessage);
      io.to(`dm:${message.senderId}`).to(`dm:${message.receiverId}`).emit('new-direct-message', savedMessage);
    } catch (error) {
      console.error('Error saving direct message:', error);
      socket.emit('error', { message: 'Failed to save direct message' });
    }
  });

  // Join a thread room
  socket.on('thread:join', async (threadId: string) => {
    console.log(`Socket ${socket.id} joining thread ${threadId}`);
    socket.join(`thread:${threadId}`);

    try {
      const thread = await prisma.message.findUnique({
        where: { id: threadId },
        include: {
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });

      if (thread) {
        socket.emit('thread:messages', thread.replies);
      }
    } catch (error) {
      console.error('Error fetching thread messages:', error);
      socket.emit('error', { message: 'Failed to fetch thread messages' });
    }
  });

  // Leave a thread room
  socket.on('thread:leave', (threadId: string) => {
    console.log(`Socket ${socket.id} leaving thread ${threadId}`);
    socket.leave(`thread:${threadId}`);
  });

  // Handle reactions
  socket.on('add-reaction', async ({ messageId, emoji, userId }: { messageId: string; emoji: string; userId: string }) => {
    try {
      // Get the message and check for any existing reactions from this user
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        select: { 
          channelId: true,
          reactions: {
            where: {
              userId: userId  // Check for any reaction from this user
            }
          }
        }
      });

      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // If user has any existing reaction, remove it first
      if (message.reactions.length > 0) {
        await prisma.messageReaction.deleteMany({
          where: {
            messageId,
            userId
          }
        });
        console.log(`Removed existing reaction from user ${userId} on message ${messageId}`);
      }

      // Add the new reaction
      await prisma.messageReaction.create({
        data: {
          emoji,
          messageId,
          userId
        }
      });
      console.log(`Added new reaction ${emoji} by user ${userId} to message ${messageId}`);

      // Get updated message with reactions
      const updatedMessage = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      if (!updatedMessage) {
        socket.emit('error', { message: 'Failed to fetch updated message' });
        return;
      }

      // Emit to channel
      io.to(`channel:${message.channelId}`).emit('reaction-updated', updatedMessage);
    } catch (error) {
      console.error('Error handling reaction:', error);
      socket.emit('error', { message: 'Failed to handle reaction' });
    }
  });

  socket.on('remove-reaction', async ({ messageId, emoji, userId }: { messageId: string; emoji: string; userId: string }) => {
    try {
      // Get the message to verify it exists and get channelId
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        select: { channelId: true }
      });

      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Remove reaction
      await prisma.messageReaction.deleteMany({
        where: {
          messageId,
          emoji,
          userId
        }
      });
      console.log(`Reaction removed: ${emoji} by user ${userId} from message ${messageId}`);

      // Get updated message with reactions
      const updatedMessage = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      // Emit to channel
      if (updatedMessage) {
        io.to(`channel:${message.channelId}`).emit('reaction-updated', updatedMessage);
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
      socket.emit('error', { message: 'Failed to remove reaction' });
    }
  });

  // Handle new thread message
  socket.on('thread:message', async (message: { 
    content: string; 
    channelId: string; 
    parentMessageId: string;
    userId: string;
  }) => {
    try {
      console.log('Received thread message:', message);

      // Verify parent message exists
      const parentMessage = await prisma.message.findUnique({
        where: { id: message.parentMessageId },
        select: { id: true, channelId: true }
      });

      if (!parentMessage) {
        console.error('Parent message not found:', message.parentMessageId);
        socket.emit('error', { message: 'Parent message not found' });
        return;
      }

      if (parentMessage.channelId !== message.channelId) {
        console.error('Channel ID mismatch:', {
          messageChannelId: message.channelId,
          parentChannelId: parentMessage.channelId
        });
        socket.emit('error', { message: 'Invalid channel ID' });
        return;
      }

      // Create the reply and update parent in a transaction
      const [reply] = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        console.log('Creating reply message...');
        // Create the reply
        const newReply = await tx.message.create({
          data: {
            content: message.content,
            channelId: message.channelId,
            userId: message.userId,
            parentId: message.parentMessageId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });
        console.log('Reply created:', newReply);

        console.log('Updating parent message...');
        // Update parent message with raw SQL
        await tx.$executeRawUnsafe(`
          UPDATE "Message"
          SET "lastReplyAt" = NOW(),
              "replyCount" = COALESCE("replyCount", 0) + 1,
              "updatedAt" = NOW()
          WHERE id = '${message.parentMessageId}'
        `);
        console.log('Parent message updated');

        return [newReply];
      });

      console.log('Thread reply saved:', reply);
      
      // Emit to thread room
      console.log('Emitting to thread room:', `thread:${message.parentMessageId}`);
      io.to(`thread:${message.parentMessageId}`).emit('thread:message', reply);
      
      // Also emit an update to the channel for the thread preview
      console.log('Emitting thread update to channel:', `channel:${message.channelId}`);
      io.to(`channel:${message.channelId}`).emit('thread:updated', {
        threadId: message.parentMessageId,
        messageId: reply.id,
        content: reply.content,
        user: reply.user
      });
    } catch (error) {
      console.error('Error saving thread message:', {
        error,
        message,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        socketId: socket.id,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
      socket.emit('error', { 
        message: 'Failed to save thread message',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorCode: error instanceof Error && 'code' in error ? (error as any).code : undefined
      });
    }
  });

  // Load more messages
  socket.on('load-more-messages', async ({ channelId, cursor, limit = 50 }: { channelId: string; cursor: string; limit?: number }) => {
    console.log(`Socket ${socket.id} loading more messages for channel ${channelId}, cursor: ${cursor}, limit: ${limit}`);

    try {
      const messages = await prisma.message.findMany({
        where: {
          channelId,
          parentId: null,
          createdAt: {
            lt: new Date(cursor)
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: { replies: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit + 1
      });

      const hasMore = messages.length > limit;
      const paginatedMessages = hasMore ? messages.slice(0, limit) : messages;
      const nextCursor = hasMore ? messages[limit - 1].createdAt.toISOString() : null;

      socket.emit('more-messages', {
        messages: paginatedMessages.reverse(),
        nextCursor,
        hasMore
      });
    } catch (error) {
      console.error('Error loading more messages:', error);
      socket.emit('error', { message: 'Failed to load more messages' });
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
