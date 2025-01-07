"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Validation schemas
const createMessageSchema = zod_1.z.object({
    content: zod_1.z.string().min(1),
    channelId: zod_1.z.string(),
    parentId: zod_1.z.string().optional()
});
const createDirectMessageSchema = zod_1.z.object({
    content: zod_1.z.string().min(1),
    receiverId: zod_1.z.string()
});
// Send message to channel
router.post('/channel', auth_1.authenticateToken, async (req, res) => {
    try {
        const { content, channelId, parentId } = createMessageSchema.parse(req.body);
        const userId = req.user.id;
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get channel messages
router.get('/channel/:channelId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.user.id;
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Send direct message
router.post('/direct', auth_1.authenticateToken, async (req, res) => {
    try {
        const { content, receiverId } = createDirectMessageSchema.parse(req.body);
        const senderId = req.user.id;
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get direct messages between two users
router.get('/direct/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { userId: otherUserId } = req.params;
        const currentUserId = req.user.id;
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
