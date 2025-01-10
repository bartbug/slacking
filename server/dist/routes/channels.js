"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Validation schemas
const createChannelSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    isPrivate: zod_1.z.boolean().default(false)
});
const addMemberSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    role: zod_1.z.enum(['admin', 'member']).default('member')
});
// Create channel
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        console.log('Creating channel with data:', req.body);
        const { name, description, isPrivate } = createChannelSchema.parse(req.body);
        const userId = req.user.id;
        console.log('Validated channel data:', { name, description, isPrivate, userId });
        const channel = await prisma.channel.create({
            data: {
                name,
                description,
                isPrivate: isPrivate || false,
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
        console.log('Channel created successfully:', channel);
        res.json(channel);
    }
    catch (error) {
        console.error('Error creating channel:', error);
        if (error instanceof zod_1.z.ZodError) {
            const errorMessages = error.errors.map(err => err.message).join(', ');
            return res.status(400).json({ error: errorMessages });
        }
        // Check for Prisma unique constraint violations
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
            return res.status(400).json({ error: 'A channel with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to create channel. Please try again.' });
    }
});
// Get all channels (that the user has access to)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get channel by ID
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Add member to channel
router.post('/:id/members', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = addMemberSchema.parse(req.body);
        const requestingUserId = req.user.id;
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Remove member from channel
router.delete('/:channelId/members/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { channelId, userId } = req.params;
        const requestingUserId = req.user.id;
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
