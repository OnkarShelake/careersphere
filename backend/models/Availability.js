import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: String, // format: "YYYY-MM-DD"
        required: true
    },
    startTime: {
        type: String, // format: "HH:mm" e.g. "10:00", "14:30"
        required: true
    },
    endTime: {
        type: String, // format: "HH:mm" e.g. "11:00", "15:30"
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        default: null
    }
},
{ timestamps: true }
);

export default mongoose.model('Availability', availabilitySchema);
