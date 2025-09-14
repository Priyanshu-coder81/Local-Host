import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number"],
      index: true, // frequent lookup
    },

    email: {
      type: String,
      lowercase: true,
      sparse: true, // optional but unique
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      unique: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // never return password by default
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },

    dob: {
      type: Date,
    },

    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      village: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, match: [/^\d{6}$/, "Invalid pincode"] },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          index: "2dsphere", // enables geo queries
        },
      },
    },

    emergencyContact: {
      name: { type: String },
      phone: { type: String, match: [/^[6-9]\d{9}$/] },
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },

    role: {
      type: String,
      enum: ["user"], // future-proof: could extend to admin
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// --- Password Hashing Middleware ---
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// --- Password Validation Method ---
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};



// --- Index Optimization ---
userSchema.index({ phone: 1 }); // frequent lookups by phone

export const User = mongoose.model("User", userSchema);
