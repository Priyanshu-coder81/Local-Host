import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^[6-9]\d{9}$/, "Invalid phone number"],
      index: true, // quick lookup
    },

    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
      index: true, // filter doctors by specialization
    },

    qualification: {
      type: String,
      trim: true,
      required: true,
    },

    experienceYears: {
      type: Number,
      min: 0,
      required: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    hospitalAffiliation: {
      type: String,
      trim: true,
    },

    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    availability: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
        slots: [
          {
            start: { type: String, required: true }, // e.g. "09:00"
            end: { type: String, required: true }, // e.g. "11:00"
          },
        ],
      },
    ],

    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, match: [/^\d{6}$/] },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          index: "2dsphere",
        },
      },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrpyt.hash(this.password, 10);
});

doctorSchema.methods.isPasswordCorrect = async function(password) {
    return bcrpyt.compate(this.password,password);
}

doctorSchema.methods.generateAccessToken = function () {
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
  doctorSchema.methods.generateRefreshToken = function () {
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

// Compound index for doctor search queries
doctorSchema.index({ specialization: 1, "address.district": 1 });

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
