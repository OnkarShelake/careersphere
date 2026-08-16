import Session from '../models/Session.js';
import Availability from '../models/Availability.js';
import User from '../models/User.js';
import Review from '../models/Review.js';

// Student: Book a session with a mentor
export const bookSession = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { mentorId, slotId, date, startTime, endTime, topic, notes } = req.body;

        if (!mentorId || !date || !startTime || !endTime) {
            return res.status(400).json({ message: "Mentor, date, and time are required" });
        }

        const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
        if (!mentor) {
            return res.status(404).json({ message: "Mentor not found" });
        }

        if (studentId === mentorId) {
            return res.status(400).json({ message: "You cannot book a session with yourself" });
        }

        // Generate unique meeting room ID
        const meetingRoomId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

        const newSession = await Session.create({
            studentId,
            mentorId,
            slotId: slotId || null,
            date,
            startTime,
            endTime,
            topic: topic || 'Career & Guidance Mentorship',
            notes: notes || '',
            status: 'pending',
            meetingRoomId
        });

        // Mark slot as booked if slotId provided
        if (slotId) {
            await Availability.findByIdAndUpdate(slotId, {
                isBooked: true,
                bookingId: newSession._id
            });
        }

        const populatedSession = await Session.findById(newSession._id)
            .populate('mentorId', 'name email avatar title company')
            .populate('studentId', 'name email avatar educationLevel college skills resumeUrl');

        return res.status(201).json({
            message: "Session booking request sent successfully",
            session: populatedSession
        });
    } catch (error) {
        console.error("Error booking session:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get sessions for logged-in user (both student & mentor)
export const getMySessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        const query = role === 'mentor' ? { mentorId: userId } : { studentId: userId };

        const sessions = await Session.find(query)
            .populate('mentorId', 'name email avatar title company expertise averageRating')
            .populate('studentId', 'name email avatar educationLevel college skills resumeUrl targetCareer')
            .sort({ date: -1, startTime: -1 });

        return res.status(200).json({
            success: true,
            count: sessions.length,
            sessions
        });
    } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update session status (Mentor accepts/rejects/completes, Student cancels)
export const updateSessionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        if (!['confirmed', 'rejected', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        const isMentor = session.mentorId.toString() === userId;
        const isStudent = session.studentId.toString() === userId;

        if (!isMentor && !isStudent) {
            return res.status(403).json({ message: "Not authorized to modify this session" });
        }

        // Mentor can confirm, reject, or complete
        if (['confirmed', 'rejected'].includes(status) && !isMentor) {
            return res.status(403).json({ message: "Only the mentor can accept or reject this request" });
        }

        session.status = status;
        await session.save();

        // If rejected or cancelled, release availability slot
        if ((status === 'rejected' || status === 'cancelled') && session.slotId) {
            await Availability.findByIdAndUpdate(session.slotId, {
                isBooked: false,
                bookingId: null
            });
        }

        const updatedSession = await Session.findById(id)
            .populate('mentorId', 'name email avatar title company')
            .populate('studentId', 'name email avatar educationLevel college skills resumeUrl');

        return res.status(200).json({
            message: `Session has been ${status}`,
            session: updatedSession
        });
    } catch (error) {
        console.error("Error updating session status:", error);
        res.status(500).json({ message: error.message });
    }
};

// Student: Leave a rating & review for completed session
export const reviewSession = async (req, res) => {
    try {
        const { id } = req.params; // sessionId
        const { rating, comment } = req.body;
        const studentId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5 stars" });
        }

        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        if (session.studentId.toString() !== studentId) {
            return res.status(403).json({ message: "Only the student who attended the session can submit a review" });
        }

        // Update session
        session.rating = Number(rating);
        session.review = comment || '';
        session.reviewedAt = new Date();
        session.status = 'completed'; // auto-mark completed upon review
        await session.save();

        // Create or update review entry
        await Review.findOneAndUpdate(
            { sessionId: session._id },
            {
                studentId,
                mentorId: session.mentorId,
                sessionId: session._id,
                rating: Number(rating),
                comment: comment || ''
            },
            { upsert: true, new: true }
        );

        // Recalculate mentor's averageRating and totalReviews
        const mentorReviews = await Review.find({ mentorId: session.mentorId });
        const totalReviews = mentorReviews.length;
        const sumRatings = mentorReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 0;

        await User.findByIdAndUpdate(session.mentorId, {
            averageRating,
            totalReviews
        });

        return res.status(200).json({
            message: "Review submitted successfully! Thank you for your feedback.",
            session,
            mentorStats: { averageRating, totalReviews }
        });
    } catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).json({ message: error.message });
    }
};
