import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role = 'student',
            title,
            company,
            experienceYears,
            expertise,
            hourlyRate,
            educationLevel,
            college,
            skills,
            interests,
            resumeUrl,
            bio
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existUser = await User.findOne({ email: normalizedEmail });

        if (existUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: role === 'mentor' ? 'mentor' : 'student',
            bio: bio || '',
        };

        if (role === 'mentor') {
            if (title) userData.title = title;
            if (company) userData.company = company;
            if (experienceYears) userData.experienceYears = Number(experienceYears) || 0;
            if (expertise) {
                userData.expertise = Array.isArray(expertise)
                    ? expertise
                    : String(expertise).split(',').map(s => s.trim()).filter(Boolean);
            }
            if (hourlyRate !== undefined) userData.hourlyRate = Number(hourlyRate) || 0;
        } else {
            if (educationLevel) userData.educationLevel = educationLevel;
            if (college) userData.college = college;
            if (skills) {
                userData.skills = Array.isArray(skills)
                    ? skills
                    : String(skills).split(',').map(s => s.trim()).filter(Boolean);
            }
            if (interests) {
                userData.interests = Array.isArray(interests)
                    ? interests
                    : String(interests).split(',').map(s => s.trim()).filter(Boolean);
            }
            if (resumeUrl) userData.resumeUrl = resumeUrl;
        }

        const newUser = await User.create(userData);

        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const userResponse = newUser.toObject();
        delete userResponse.password;

        return res.status(201).json({
            message: "Registration successful",
            token,
            user: { ...userResponse, id: newUser._id }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({
            message: "Login successful",
            token,
            user: { ...userResponse, id: user._id }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: error.message });
    }
};