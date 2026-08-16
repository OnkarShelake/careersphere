import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    bookSession,
    getMySessions,
    updateSessionStatus,
    reviewSession
} from '../controllers/sessionController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/book', bookSession);
router.get('/my-sessions', getMySessions);
router.patch('/:id/status', updateSessionStatus);
router.post('/:id/review', reviewSession);

export default router;
