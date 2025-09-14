import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      index: true,
    },

    consultationType: {
      type: String,
      enum: ["video", "in_person"],
      required: true,
    },

    notes: {
      type: String,
      maxlength: 500,
      trim: true,
    },

    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },

    payment: {
      amount: { type: Number, min: 0, default: 0 },
      status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
      transactionId: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
appointmentSchema.index({ doctorId: 1, scheduledAt: 1 }); // find all appointments for a doctor by date
appointmentSchema.index({ userId: 1, scheduledAt: 1 });   // patient history by date

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
