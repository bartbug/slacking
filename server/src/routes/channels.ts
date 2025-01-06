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
const createChannelSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false)
});

const addMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(['admin', 'member']).default('member')
});

// Create channel
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, description, isPrivate } = createChannelSchema.parse(req.body);
    const userId = req.user!.id;

    const channel = await prisma.channel.create({
      data: {
        name,
        description,
        isPrivate,
        creatorId: userId,
        members: {
          create: {
            userId,
            role: 'admin'
          }
        }
      },
      include: {
        members: {
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

    res.json(channel);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all channels (that the user has access to)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const channels = await prisma.channel.findMany({
      where: {
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
      },
      include: {
        members: {
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

    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get channel by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const channel = await prisma.channel.findFirst({
      where: {
        id,
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
      },
      include: {
        members: {
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

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add member to channel
router.post('/:id/members', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = addMemberSchema.parse(req.body);
    const requestingUserId = req.user!.id;

    // Check if channel exists and user has admin rights
    const channel = await prisma.channel.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: requestingUserId,
            role: 'admin'
          }
        }
      }
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found or insufficient permissions' });
    }

    // Add member
    const member = await prisma.channelMember.create({
      data: {
        channelId: id,
        userId,
        role
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

    res.json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove member from channel
router.delete('/:channelId/members/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { channelId, userId } = req.params;
    const requestingUserId = req.user!.id;

    // Check if channel exists and user has admin rights
    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
        members: {
          some: {
            userId: requestingUserId,
            role: 'admin'
          }
        }
      }
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found or insufficient permissions' });
    }

    // Remove member
    await prisma.channelMember.delete({
      where: {
        userId_channelId: {
          userId,
          channelId
        }
      }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 