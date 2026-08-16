import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getMentors,
    getMentorById,
    addAvailability,
    getMyAvailability,
    deleteAvailability
} from '../controllers/mentorController.js';

const router = express.Router();

// Public routes
router.get('/', getMentors);
router.get('/:id', getMentorById);

// Mentor-only routes (protected)
router.post('/availability', authMiddleware, addAvailability);
router.get('/availability/me', authMiddleware, getMyAvailability);
router.delete('/availability/:id', authMiddleware, deleteAvailability);

export default router;
