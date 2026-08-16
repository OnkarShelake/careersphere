import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Get logged-in user profile
router.get("/users/profile", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User profile fetched successfully", user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: error.message });
    }
});

// Update logged-in user profile
router.put("/users/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const {
            name,
            email,
            password,
            address,
            phone,
            bio,
            avatar,
            // Mentor fields
            title,
            company,
            experienceYears,
            expertise,
            hourlyRate,
            linkedin,
            github,
            // Student fields
            educationLevel,
            college,
            skills,
            interests,
            resumeUrl,
            resumeName,
            targetCareer
        } = req.body;

        if (name) user.name = name.trim();
        if (email) user.email = email.toLowerCase().trim();
        if (address !== undefined) user.address = address;
        if (phone !== undefined) user.phone = phone;
        if (bio !== undefined) user.bio = bio;
        if (avatar !== undefined) user.avatar = avatar;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        // Update Mentor fields
        if (title !== undefined) user.title = title;
        if (company !== undefined) user.company = company;
        if (experienceYears !== undefined) user.experienceYears = Number(experienceYears) || 0;
        if (expertise !== undefined) {
            user.expertise = Array.isArray(expertise)
                ? expertise
                : String(expertise).split(',').map(s => s.trim()).filter(Boolean);
        }
        if (hourlyRate !== undefined) user.hourlyRate = Number(hourlyRate) || 0;
        if (linkedin !== undefined) user.linkedin = linkedin;
        if (github !== undefined) user.github = github;

        // Update Student fields
        if (educationLevel !== undefined) user.educationLevel = educationLevel;
        if (college !== undefined) user.college = college;
        if (skills !== undefined) {
            user.skills = Array.isArray(skills)
                ? skills
                : String(skills).split(',').map(s => s.trim()).filter(Boolean);
        }
        if (interests !== undefined) {
            user.interests = Array.isArray(interests)
                ? interests
                : String(interests).split(',').map(s => s.trim()).filter(Boolean);
        }
        if (resumeUrl !== undefined) user.resumeUrl = resumeUrl;
        if (resumeName !== undefined) user.resumeName = resumeName;
        if (targetCareer !== undefined) user.targetCareer = targetCareer;

        await user.save();
        const userData = await User.findById(req.user.id).select("-password");
        return res.status(200).json({ message: "Profile updated successfully", user: userData });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: error.message });
    }
});

// Get public profile of a user by ID
router.get("/users/:id", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: error.message });
    }
});

// Mentor: Get all students
router.get("/mentor/users", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "mentor") {
            return res.status(403).json({ message: "Access denied" });
        }
        const students = await User.find({ role: 'student' }).select("-password").sort({ createdAt: -1 });
        return res.status(200).json({ message: "Students fetched successfully", users: students });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;