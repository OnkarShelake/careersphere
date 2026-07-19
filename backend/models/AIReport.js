import mongoose from "mongoose";

const aiReportSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    report: {
      type: String,
      required: true,
    },

    model: {
      type: String,
      default: "gemini-2.5-flash",
    },

    promptVersion: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AIReport", aiReportSchema);