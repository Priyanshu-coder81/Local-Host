import Appointment from "../models/Appointment.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { io } from "../index.js";

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/medical-records/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export { upload };

// Book an Appointment (Patient)
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const patientId = req.user.id; // Auth middleware sets req.user

    const appointment = new Appointment({
      doctor: doctorId,
      patient: patientId,
      date,
      time,
      status: "pending" // default when created
    });

    await appointment.save();

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Upcoming Appointments (Doctor)
export const getUpcomingAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const now = new Date();

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: now },
      status: { $ne: "cancelled" }
    })
      .populate("patient", "name email phone age gender address history medicalRecords")
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Confirm Appointment (Doctor Accepts)
export const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, doctor: doctorId, status: "pending" }, // only pending can be confirmed
      { status: "confirmed" },
      { new: true }
    ).populate("patient", "name email phone age gender address history medicalRecords");

    if (!appointment) {
      return res
        .status(404)
        .json({ message: "Appointment not found or already confirmed" });
    }

    // Emit event to notify doctors about appointment confirmation
    io.emit('appointmentConfirmed', { doctorId, appointment });

    res.json({ 
      message: "Appointment confirmed successfully", 
      appointment 
    });
  } catch (error) {
    console.error("Error confirming appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Complete Appointment (Doctor marks as completed)
export const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, doctor: doctorId, status: "confirmed" }, // only confirmed can be completed
      { status: "completed" },
      { new: true }
    ).populate("patient", "name email phone age gender address history medicalRecords");

    if (!appointment) {
      return res
        .status(404)
        .json({ message: "Appointment not found or not in confirmed status" });
    }

    // Emit event to notify doctors about appointment completion
    io.emit('appointmentCompleted', { doctorId, appointment });

    res.json({
      message: "Appointment marked as completed successfully",
      appointment
    });
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get My Appointments (Patient)
export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;

    const appointments = await Appointment.find({
      patient: patientId,
      status: { $ne: "cancelled" }
    })
      .populate("doctor", "name email registrationNumber specialization")
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching my appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Upload Medical Record for Appointment (Doctor)
export const uploadAppointmentMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params; // appointment id
    const doctorId = req.user.id;

    // Check if appointment exists and belongs to the doctor
    const appointment = await Appointment.findOne({ _id: id, doctor: doctorId });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create medical record entry
    const medicalRecord = {
      filename: req.file.originalname,
      url: `/uploads/medical-records/${req.file.filename}`,
      uploadedBy: doctorId,
      uploadedAt: new Date()
    };

    // Add to appointment's medical records
    appointment.medicalRecords.push(medicalRecord);
    await appointment.save();

    // Also add to patient's medicalRecords array
    const patient = await appointment.populate('patient');
    if (patient && patient.patient) {
      patient.patient.medicalRecords.push(medicalRecord);
      await patient.patient.save();
    }

    res.status(201).json({
      message: 'Medical record uploaded successfully',
      medicalRecord: medicalRecord
    });
  } catch (error) {
    console.error('Error uploading medical record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
