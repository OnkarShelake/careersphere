import User from '../models/User.js';
import Availability from '../models/Availability.js';
import Review from '../models/Review.js';

// Get list of mentors with search and filtering
export const getMentors = async (req, res) => {
    try {
        const { search, expertise, minRating, sort } = req.query;

        const query = { role: 'mentor' };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { bio: { $regex: search, $options: 'i' } }
            ];
        }

        if (expertise) {
            const expertiseList = expertise.split(',').map(e => e.trim());
            query.expertise = { $in: expertiseList.map(e => new RegExp(e, 'i')) };
        }

        if (minRating) {
            query.averageRating = { $gte: Number(minRating) };
        }

        let sortOption = { averageRating: -1, totalReviews: -1, experienceYears: -1 };
        if (sort === 'experience') {
            sortOption = { experienceYears: -1, averageRating: -1 };
        } else if (sort === 'rate_asc') {
            sortOption = { hourlyRate: 1 };
        } else if (sort === 'newest') {
            sortOption = { createdAt: -1 };
        }

        const mentors = await User.find(query)
            .select('-password')
            .sort(sortOption);

        return res.status(200).json({
            success: true,
            count: mentors.length,
            mentors
        });
    } catch (error) {
        console.error("Error fetching mentors:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get single mentor public profile, reviews, and available slots
export const getMentorById = async (req, res) => {
    try {
        const { id } = req.params;

        const mentor = await User.findOne({ _id: id, role: 'mentor' }).select('-password');
        if (!mentor) {
            return res.status(404).json({ message: "Mentor not found" });
        }

        const today = new Date().toISOString().split('T')[0];

        // Fetch available unbooked slots from today onwards
        const availableSlots = await Availability.find({
            mentorId: id,
            isBooked: false,
            date: { $gte: today }
        }).sort({ date: 1, startTime: 1 });

        // Fetch mentor reviews
        const reviews = await Review.find({ mentorId: id })
            .populate('studentId', 'name avatar educationLevel')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            mentor,
            availableSlots,
            reviews
        });
    } catch (error) {
        console.error("Error fetching mentor details:", error);
        res.status(500).json({ message: error.message });
    }
};

// Mentor: Add availability slots
export const addAvailability = async (req, res) => {
    try {
        if (req.user.role !== 'mentor') {
            return res.status(403).json({ message: "Only mentors can set availability" });
        }

        const mentorId = req.user.id;
        const { slots } = req.body; // array of { date, startTime, endTime } or single slot in req.body

        const slotsToAdd = Array.isArray(slots) ? slots : [req.body];

        if (!slotsToAdd || slotsToAdd.length === 0) {
            return res.status(400).json({ message: "Slot information is required" });
        }

        const createdSlots = [];
        for (const slot of slotsToAdd) {
            const { date, startTime, endTime } = slot;
            if (!date || !startTime || !endTime) continue;

            // Check if slot already exists
            const existing = await Availability.findOne({
                mentorId,
                date,
                startTime,
                endTime
            });

            if (!existing) {
                const newSlot = await Availability.create({
                    mentorId,
                    date,
                    startTime,
                    endTime,
                    isBooked: false
                });
                createdSlots.push(newSlot);
            }
        }

        return res.status(201).json({
            message: "Availability slots added successfully",
            slots: createdSlots
        });
    } catch (error) {
        console.error("Error adding availability:", error);
        res.status(500).json({ message: error.message });
    }
};

// Mentor: Get own availability slots
export const getMyAvailability = async (req, res) => {
    try {
        if (req.user.role !== 'mentor') {
            return res.status(403).json({ message: "Access denied" });
        }

        const slots = await Availability.find({ mentorId: req.user.id })
            .sort({ date: 1, startTime: 1 });

        return res.status(200).json({
            success: true,
            slots
        });
    } catch (error) {
        console.error("Error fetching availability:", error);
        res.status(500).json({ message: error.message });
    }
};

// Mentor: Delete an unbooked availability slot
export const deleteAvailability = async (req, res) => {
    try {
        if (req.user.role !== 'mentor') {
            return res.status(403).json({ message: "Access denied" });
        }

        const { id } = req.params;
        const slot = await Availability.findOne({ _id: id, mentorId: req.user.id });

        if (!slot) {
            return res.status(404).json({ message: "Slot not found" });
        }

        if (slot.isBooked) {
            return res.status(400).json({ message: "Cannot delete a slot that has already been booked" });
        }

        await Availability.findByIdAndDelete(id);

        return res.status(200).json({ message: "Availability slot removed successfully" });
    } catch (error) {
        console.error("Error deleting availability slot:", error);
        res.status(500).json({ message: error.message });
    }
};
