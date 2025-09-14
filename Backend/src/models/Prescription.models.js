import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true, // One prescription per appointment
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    diagnosis: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    medicines: [
      {
        name: { type: String, required: true, trim: true },
        dosage: { type: String, required: true, trim: true }, // e.g. "500mg"
        frequency: { type: String, required: true, trim: true }, // e.g. "2 times a day"
        duration: { type: String, required: true, trim: true },  // e.g. "5 days"
        instructions: { type: String, trim: true }, // e.g. "Take after meal"
      },
    ],

    followUpDate: {
      type: Date,
    },

    notes: {
      type: String,
      maxlength: 500,
      trim: true,
    },

    createdBy: {
      type: String,
      enum: ["doctor", "admin"],
      default: "doctor",
    },
  },
  { timestamps: true }
);

// Index to quickly get prescriptions by doctor or patient
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });
prescriptionSchema.index({ userId: 1, createdAt: -1 });

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
