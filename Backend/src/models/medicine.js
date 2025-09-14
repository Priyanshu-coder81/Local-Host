import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    default: ''
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineStore',
    required: true
  }
}, {
  timestamps: true
});

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
