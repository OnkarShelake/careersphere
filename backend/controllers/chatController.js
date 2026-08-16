import Message from '../models/Message.js';
import User from '../models/User.js';
import Session from '../models/Session.js';

// Get list of all conversation partners for the current user
export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Find all distinct partners from message history
        const userMessages = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        }).sort({ createdAt: -1 });

        const partnersMap = new Map();

        for (const msg of userMessages) {
            const partnerId = msg.senderId.toString() === userId
                ? (msg.receiverId ? msg.receiverId.toString() : null)
                : msg.senderId.toString();

            if (!partnerId || partnerId === userId) continue;

            if (!partnersMap.has(partnerId)) {
                partnersMap.set(partnerId, {
                    lastMessage: msg.message,
                    lastMessageTime: msg.createdAt,
                    lastMessageSenderId: msg.senderId.toString(),
                    lastMessageStatus: msg.status,
                    roomId: msg.roomId,
                    unreadCount: 0
                });
            }

            // Count unread messages sent to current user
            if (msg.senderId.toString() !== userId && msg.status !== 'seen') {
                const partnerData = partnersMap.get(partnerId);
                partnerData.unreadCount += 1;
            }
        }

        // 2. Also find any confirmed/pending session partners even if no messages yet
        const sessions = await Session.find({
            $or: [{ studentId: userId }, { mentorId: userId }]
        }).sort({ date: -1 });

        for (const sess of sessions) {
            const partnerId = sess.studentId.toString() === userId
                ? sess.mentorId.toString()
                : sess.studentId.toString();

            if (!partnersMap.has(partnerId)) {
                const calculatedRoomId = [userId, partnerId].sort().join("_");
                partnersMap.set(partnerId, {
                    lastMessage: `Session booked: ${sess.topic}`,
                    lastMessageTime: sess.createdAt,
                    lastMessageSenderId: '',
                    lastMessageStatus: 'sent',
                    roomId: calculatedRoomId,
                    unreadCount: 0
                });
            }
        }

        // 3. Fetch user details for all partners
        const partnerIds = Array.from(partnersMap.keys());
        const users = await User.find({ _id: { $in: partnerIds } })
            .select('name email avatar role title company educationLevel averageRating');

        const conversations = users.map((u) => {
            const partnerData = partnersMap.get(u._id.toString());
            return {
                partner: u,
                ...partnerData
            };
        }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

        return res.status(200).json({
            success: true,
            conversations
        });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get message history for a specific room
export const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        const messages = await Message.find({ roomId })
            .sort({ createdAt: 1 })
            .lean();

        // Mark incoming messages as seen
        await Message.updateMany(
            { roomId, senderId: { $ne: userId }, status: { $ne: 'seen' } },
            { status: 'seen', seenAt: new Date() }
        );

        return res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: error.message });
    }
};

// Mark all messages in room as read
export const markMessagesAsRead = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        await Message.updateMany(
            { roomId, senderId: { $ne: userId }, status: { $ne: 'seen' } },
            { status: 'seen', seenAt: new Date() }
        );

        return res.status(200).json({ success: true, message: "Messages marked as read" });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ message: error.message });
    }
};
