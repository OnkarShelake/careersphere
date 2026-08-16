import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'mentor'],
        default: 'student'
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },

    // Mentor Specific Fields
    title: {
        type: String,
        default: '' // e.g. "Senior Software Engineer", "Product Lead"
    },
    company: {
        type: String,
        default: '' // e.g. "Google", "Microsoft", "Freelance"
    },
    experienceYears: {
        type: Number,
        default: 0
    },
    expertise: {
        type: [String],
        default: [] // e.g. ["Full Stack", "AI/ML", "Career Transition", "Interview Prep"]
    },
    hourlyRate: {
        type: Number,
        default: 0 // 0 means free mentorship
    },
    linkedin: {
        type: String,
        default: ''
    },
    github: {
        type: String,
        default: ''
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },

    // Student Specific Fields
    educationLevel: {
        type: String,
        default: '' // e.g. "High School", "Undergraduate", "Postgraduate", "Working Professional"
    },
    college: {
        type: String,
        default: ''
    },
    skills: {
        type: [String],
        default: [] // e.g. ["JavaScript", "Python", "Problem Solving"]
    },
    interests: {
        type: [String],
        default: []
    },
    resumeUrl: {
        type: String,
        default: '' // Google Drive link, portfolio link, or PDF link
    },
    resumeName: {
        type: String,
        default: ''
    },
    targetCareer: {
        type: String,
        default: ''
    }
},
{ timestamps: true }
);

export default mongoose.model('User', userSchema);