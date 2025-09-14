import mongoose from 'mongoose';

const medicineStoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  gstNo: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const MedicineStore = mongoose.model('MedicineStore', medicineStoreSchema);

export default MedicineStore;
