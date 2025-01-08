import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth';
import channelRoutes from './routes/channels';
import messageRoutes from './routes/messages';
import threadRoutes from './routes/threads';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

// Updated CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:8000'
];

const io = new Server(httpServer, {
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
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join a channel room
  socket.on('join-channel', async (channelId: string) => {
    console.log(`Socket ${socket.id} joining channel ${channelId}`);
    socket.join(`channel:${channelId}`);

    // Send existing messages to the client
    try {
      const messages = await prisma.message.findMany({
        where: {
          channelId,
          parentId: null // Only get top-level messages
        },
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
        },
        take: 50 // Limit to last 50 messages
      });
      
      socket.emit('channel-messages', messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
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
              email: true
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
      const [reply] = await prisma.$transaction(async (tx) => {
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

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
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
