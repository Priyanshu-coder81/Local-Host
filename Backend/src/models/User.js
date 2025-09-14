import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  specialization: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  // Doctor-specific fields
  experience: {
    type: Number, // years of experience
    required: function() { return this.role === 'doctor'; }
  },
  currentHospital: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  qualifications: {
    type: [String], // array of qualifications
    default: []
  },
  languages: {
    type: [String], // languages spoken
    default: []
  },
  // Patient-specific fields
  name: {
    type: String,
    required: function() { return this.role === 'patient' || this.role === 'doctor'; }
  },
  phone: {
    type: String,
    required: function() { return this.role === 'patient' || this.role === 'doctor'; }
  },
  age: {
    type: Number,
    required: function() { return this.role === 'patient'; }
  },
  gender: {
    type: String,
    required: function() { return this.role === 'patient'; }
  },
  address: {
    type: String,
    required: function() { return this.role === 'patient'; }
  },
  history: {
    type: [String],
    default: []
  },
  medicalRecords: {
    type: [{
      filename: { type: String, required: true },
      url: { type: String, required: true },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      uploadedAt: { type: Date, default: Date.now }
    }],
    default: []
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
