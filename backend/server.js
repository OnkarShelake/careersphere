import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import connectDB from './config/db.js';
import questionnaireRoutes from './routes/questionnaireRoutes.js';
import authRoutes from './routes/authRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

import User from './models/User.js';
import Message from './models/Message.js';

const app = express();
const server = createServer(app);

const allowedOrigins = [
    "https://career-guidance-two-psi.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000"
];

if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

const isOriginAllowed = (origin) => {
    if (!origin) return true;
    if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
    ) {
        return true;
    }
    return true; // Fallback permit
};

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (isOriginAllowed(origin)) return callback(null, true);
            return callback(null, true);
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true
    }
});

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: (origin, callback) => {
        if (isOriginAllowed(origin)) return callback(null, true);
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'CareerSphere Guidance & Realtime Chat backend is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionnaireRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', recommendationRoutes);
app.use('/api', userRoutes);
app.use('/api/ai', aiRoutes);

// Socket.io User Authentication & Tracking
// Track online users: userId -> Set of socket IDs
const onlineUsers = new Map();

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("No token provided"));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return next(new Error("User not found"));

        socket.user = {
            id: user._id.toString(),
            name: user.name,
            role: user.role
        };

        next();
    } catch (error) {
        console.error("Socket auth error:", error.message);
        next(new Error("Authentication failed"));
    }
});

io.on('connection', (socket) => {
    const userId = socket.user.id;

    // Track user socket
    if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join user's personal room for direct notification delivery
    socket.join(`user_${userId}`);

    // Broadcast online status to all connected clients
    io.emit("online_users_list", Array.from(onlineUsers.keys()));
    socket.broadcast.emit("user_status_change", { userId, status: "online" });

    // Client requests current online list
    socket.on("get_online_users", () => {
        socket.emit("online_users_list", Array.from(onlineUsers.keys()));
    });

    // 1. Join Chat / Video Room & Load History
    socket.on("join_room", async (roomId) => {
        try {
            socket.join(roomId);

            // Notify other participants in the room that a peer joined for automatic WebRTC handshake
            socket.to(roomId).emit("peer_joined", { userId: socket.user.id, userName: socket.user.name });

            // Fetch past messages
            const oldMessages = await Message.find({ roomId }).sort({ createdAt: 1 });
            socket.emit("load_messages", oldMessages);

            // Mark unread messages sent by others in this room as seen
            const updateResult = await Message.updateMany(
                { roomId, senderId: { $ne: userId }, status: { $ne: "seen" } },
                { status: "seen", seenAt: new Date() }
            );

            if (updateResult.modifiedCount > 0) {
                // Notify sender that their messages were read
                io.to(roomId).emit("messages_read", { roomId, readerId: userId });
            }
        } catch (error) {
            console.error("Error joining room:", error.message);
        }
    });

    // 2. Typing Indicator
    socket.on("typing", ({ roomId }) => {
        if (!roomId) return;
        socket.to(roomId).emit("user_typing", {
            roomId,
            userId: socket.user.id,
            userName: socket.user.name
        });
    });

    socket.on("stop_typing", ({ roomId }) => {
        if (!roomId) return;
        socket.to(roomId).emit("user_stop_typing", {
            roomId,
            userId: socket.user.id
        });
    });

    // 3. Mark Messages as Read
    socket.on("mark_read", async ({ roomId }) => {
        try {
            if (!roomId) return;
            await Message.updateMany(
                { roomId, senderId: { $ne: userId }, status: { $ne: "seen" } },
                { status: "seen", seenAt: new Date() }
            );
            io.to(roomId).emit("messages_read", { roomId, readerId: userId });
        } catch (error) {
            console.error("Error marking messages read:", error.message);
        }
    });

    // 4. Send Message with Delivery & Read Status
    socket.on("send_message", async (data) => {
        try {
            const { roomId, message, receiverId: explicitReceiverId } = data;
            if (!roomId || !message || !message.trim()) return;

            // Determine receiverId
            let receiverId = explicitReceiverId;
            if (!receiverId && roomId.includes("_")) {
                const parts = roomId.split("_");
                receiverId = parts.find(id => id !== userId && id.length === 24);
            }

            const isReceiverOnline = receiverId && onlineUsers.has(receiverId);

            const newMessage = await Message.create({
                roomId,
                message: message.trim(),
                senderId: socket.user.id,
                receiverId: receiverId || null,
                senderName: socket.user.name,
                status: isReceiverOnline ? "delivered" : "sent"
            });

            // Emit to room participants
            io.to(roomId).emit("receive_message", newMessage);

            // Also notify receiver personal channel if they are not in room
            if (receiverId) {
                io.to(`user_${receiverId}`).emit("new_message_notification", {
                    roomId,
                    message: newMessage
                });
            }
        } catch (error) {
            console.error("Error sending message:", error.message);
        }
    });

    // 5. WebRTC Signaling Events
    socket.on("end-call", async (roomId) => {
        try {
            socket.leave(roomId);
            socket.to(roomId).emit("end-call");
        } catch (error) {
            console.error("Error ending call:", error.message);
        }
    });

    socket.on("offer", async ({ roomId, offer }) => {
        try {
            socket.to(roomId).emit("offer", offer);
        } catch (error) {
            console.error("Error relaying offer:", error.message);
        }
    });

    socket.on("answer", async ({ roomId, answer }) => {
        try {
            socket.to(roomId).emit("answer", answer);
        } catch (error) {
            console.error("Error relaying answer:", error.message);
        }
    });

    socket.on("ice-candidate", async ({ roomId, candidate }) => {
        try {
            socket.to(roomId).emit("ice-candidate", candidate);
        } catch (error) {
            console.error("Error passing ICE candidate:", error.message);
        }
    });

    // 6. Handle Disconnection
    socket.on('disconnect', () => {
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
            userSockets.delete(socket.id);
            if (userSockets.size === 0) {
                onlineUsers.delete(userId);
                io.emit("online_users_list", Array.from(onlineUsers.keys()));
                socket.broadcast.emit("user_status_change", { userId, status: "offline" });
            }
        }
    });
});

connectDB();

server.listen(PORT, () => {
    console.log(`CareerSphere backend running on port ${PORT}`);
});