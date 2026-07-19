import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    
},
{ _id: false }
);

const aiChatSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    messages: [messageSchema],

},
{ timestamps: true, }
);

export default mongoose.model('AIChat', aiChatSchema);