import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth';
import channelRoutes from './routes/channels';
import messageRoutes from './routes/messages';

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

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
          createdAt: 'desc'
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
