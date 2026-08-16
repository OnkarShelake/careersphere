import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null
    },
    senderName: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent"
    },
    seenAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);