import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true,
        unique: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: ''
    }
},
{ timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
