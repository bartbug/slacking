"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const channels_1 = __importDefault(require("./routes/channels"));
const messages_1 = __importDefault(require("./routes/messages"));
const threads_1 = __importDefault(require("./routes/threads"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const prisma = new client_1.PrismaClient();
// Updated CORS configuration
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:8000'
];
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});
// Middleware
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express_1.default.json());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/auth', limiter);
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/channels', channels_1.default);
app.use('/api/messages', messages_1.default);
app.use('/api/threads', threads_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    // Join a channel room
    socket.on('join-channel', async ({ channelId, cursor, limit = 50 }) => {
        console.log(`Socket ${socket.id} joining channel ${channelId}, cursor: ${cursor}, limit: ${limit}`);
        socket.join(`channel:${channelId}`);
        // Send existing messages to the client
        try {
            const messages = await prisma.message.findMany({
                where: {
                    channelId,
                    parentId: null, // Only get top-level messages
                    ...(cursor && {
                        createdAt: {
                            lt: new Date(cursor) // Get messages created before the cursor
                        }
                    })
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
                    createdAt: 'desc' // Get newest first
                },
                take: limit + 1 // Get one extra to check if there are more
            });
            const hasMore = messages.length > limit;
            const paginatedMessages = hasMore ? messages.slice(0, limit) : messages;
            const nextCursor = hasMore ? messages[limit - 1].createdAt.toISOString() : null;
            socket.emit('channel-messages', {
                messages: paginatedMessages.reverse(), // Reverse to show oldest first
                nextCursor,
                hasMore
            });
        }
        catch (error) {
            console.error('Error fetching messages:', error);
            socket.emit('error', { message: 'Failed to fetch messages' });
        }
    });
    // Leave a channel room
    socket.on('leave-channel', (channelId) => {
        console.log(`Socket ${socket.id} leaving channel ${channelId}`);
        socket.leave(`channel:${channelId}`);
    });
    // Join a direct message room
    socket.on('join-dm', (userId) => {
        console.log(`Socket ${socket.id} joining DM room ${userId}`);
        socket.join(`dm:${userId}`);
    });
    // Handle new channel message
    socket.on('channel-message', async (message) => {
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
        }
        catch (error) {
            console.error('Error saving message:', error);
            socket.emit('error', { message: 'Failed to save message' });
        }
    });
    // Handle new direct message
    socket.on('direct-message', async (message) => {
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
        }
        catch (error) {
            console.error('Error saving direct message:', error);
            socket.emit('error', { message: 'Failed to save direct message' });
        }
    });
    // Join a thread room
    socket.on('thread:join', async (threadId) => {
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
        }
        catch (error) {
            console.error('Error fetching thread messages:', error);
            socket.emit('error', { message: 'Failed to fetch thread messages' });
        }
    });
    // Leave a thread room
    socket.on('thread:leave', (threadId) => {
        console.log(`Socket ${socket.id} leaving thread ${threadId}`);
        socket.leave(`thread:${threadId}`);
    });
    // Handle new thread message
    socket.on('thread:message', async (message) => {
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
        }
        catch (error) {
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
                errorCode: error instanceof Error && 'code' in error ? error.code : undefined
            });
        }
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
    // Load more messages
    socket.on('load-more-messages', async ({ channelId, cursor, limit = 50 }) => {
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
        }
        catch (error) {
            console.error('Error loading more messages:', error);
            socket.emit('error', { message: 'Failed to load more messages' });
        }
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});
// Start server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
