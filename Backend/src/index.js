import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { Server } from "socket.io";
import chatRouter from "./routes/chat.js";
import medicineStoreRouter from "./routes/medicineStore.js";
import authRouter from "./routes/auth.js";
import medicineRouter from "./routes/medicine.js";
import doctorRouter from "./routes/doctor.js";
import profileRouter from "./routes/profile.js";
import appointmentRouter from "./routes/appointment.js";
import patientsRouter from "./routes/patients.js";

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 8000;
const mongoURI = process.env.MONGO_URI || "mongodb+srv://argha15000_db_user:R3AiPJTlBpq84hVm@cluster0.1w01wyp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Export io to use in controllers
export { io };

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));
app.use('/uploads/medical-records', express.static('uploads/medical-records'));
app.use(cookieParser());

// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware to log requests
app.use('/api', (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', authRouter);
app.use('/api', chatRouter);
app.use('/api', medicineStoreRouter);
app.use('/api/medicines', medicineRouter);
app.use('/api/doctors', doctorRouter);
app.use('/api/profile', profileRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/patients', patientsRouter);

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
