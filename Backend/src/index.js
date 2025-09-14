import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import chatRouter from "./routes/chat.js";
import medicineStoreRouter from "./routes/medicineStore.js";
import authRouter from "./routes/auth.js";
import medicineRouter from "./routes/medicine.js";

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 8000;
const mongoURI = process.env.MONGO_URI || "mongodb+srv://argha15000_db_user:R3AiPJTlBpq84hVm@cluster0.1w01wyp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const app = express();

const server = http.createServer(app);

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use(express.static("public"));
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

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
