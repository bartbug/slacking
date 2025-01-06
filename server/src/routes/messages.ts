import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { Request } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createMessageSchema = z.object({
  content: z.string().min(1),
  channelId: z.string(),
  parentId: z.string().optional()
});

const createDirectMessageSchema = z.object({
  content: z.string().min(1),
  receiverId: z.string()
});

// Send message to channel
router.post('/channel', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { content, channelId, parentId } = createMessageSchema.parse(req.body);
    const userId = req.user!.id;

    // Check if user has access to channel
    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
        OR: [
          { isPrivate: false },
          {
            members: {
              some: {
                userId
              }
            }
          }
        ]
      }
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found or access denied' });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        channelId,
        userId,
        parentId
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

    res.json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get channel messages
router.get('/channel/:channelId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user!.id;

    // Check if user has access to channel
    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
        OR: [
          { isPrivate: false },
          {
            members: {
              some: {
                userId
              }
            }
          }
        ]
      }
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found or access denied' });
    }

    // Get messages
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
        },
        replies: {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send direct message
router.post('/direct', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { content, receiverId } = createDirectMessageSchema.parse(req.body);
    const senderId = req.user!.id;

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Create direct message
    const message = await prisma.directMessage.create({
      data: {
        content,
        senderId,
        receiverId
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

    res.json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get direct messages between two users
router.get('/direct/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.user!.id;

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: otherUserId
          },
          {
            senderId: otherUserId,
            receiverId: currentUserId
          }
        ]
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 