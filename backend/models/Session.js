import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Availability',
        default: null
    },
    date: {
        type: String, // "YYYY-MM-DD"
        required: true
    },
    startTime: {
        type: String, // "HH:mm"
        required: true
    },
    endTime: {
        type: String, // "HH:mm"
        required: true
    },
    topic: {
        type: String,
        default: 'General Guidance & Career Mentorship'
    },
    notes: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    meetingRoomId: {
        type: String,
        required: true,
        index: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    review: {
        type: String,
        default: ''
    },
    reviewedAt: {
        type: Date,
        default: null
    }
},
{ timestamps: true }
);

export default mongoose.model('Session', sessionSchema);
