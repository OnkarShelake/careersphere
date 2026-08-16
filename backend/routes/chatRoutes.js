import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getConversations,
    getMessages,
    markMessagesAsRead
} from '../controllers/chatController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/conversations', getConversations);
router.get('/messages/:roomId', getMessages);
router.patch('/read/:roomId', markMessagesAsRead);

export default router;
