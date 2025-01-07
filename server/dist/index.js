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
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const channels_1 = __importDefault(require("./routes/channels"));
const messages_1 = __importDefault(require("./routes/messages"));
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
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/channels', channels_1.default);
app.use('/api/messages', messages_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    // Join a channel room
    socket.on('join-channel', async (channelId) => {
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
        }
        catch (error) {
            console.error('Error fetching messages:', error);
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
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
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
