"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get thread messages
router.get('/:threadId/messages', auth_1.authenticateToken, async (req, res) => {
    try {
        const { threadId } = req.params;
        // Get parent message and its replies
        const thread = await prisma.message.findUnique({
            where: { id: threadId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }
        res.json(thread.replies);
    }
    catch (error) {
        console.error('Error fetching thread messages:', error);
        res.status(500).json({ error: 'Failed to fetch thread messages' });
    }
});
// Create thread reply
router.post('/:threadId/messages', auth_1.authenticateToken, async (req, res) => {
    try {
        const { threadId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        // Get the parent message to verify it exists and get channelId
        const parentMessage = await prisma.message.findUnique({
            where: { id: threadId },
            select: { channelId: true },
        });
        if (!parentMessage) {
            return res.status(404).json({ error: 'Parent message not found' });
        }
        // Create the reply in a transaction to update parent message metadata
        const [reply, updatedParent] = await prisma.$transaction(async (tx) => {
            // Create reply
            const newReply = await tx.message.create({
                data: {
                    content,
                    userId,
                    channelId: parentMessage.channelId,
                    parentId: threadId,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            // Update parent message metadata using raw query
            const [updatedParent] = await tx.$queryRaw `
        UPDATE "Message"
        SET "replyCount" = "replyCount" + 1,
            "lastReplyAt" = ${new Date()}
        WHERE id = ${threadId}
        RETURNING id, "replyCount", "lastReplyAt"
      `;
            return [newReply, updatedParent];
        });
        res.json(reply);
    }
    catch (error) {
        console.error('Error creating thread reply:', error);
        res.status(500).json({ error: 'Failed to create thread reply' });
    }
});
exports.default = router;
