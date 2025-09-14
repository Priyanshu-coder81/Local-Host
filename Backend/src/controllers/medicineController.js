import Medicine from '../models/medicine.js';
import MedicineStore from '../models/medicineStore.js';

export const getMedicinesByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const medicines = await Medicine.find({ storeId });
    res.json(medicines);
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addMedicine = async (req, res) => {
  try {
    const { name, stock, price, description } = req.body;
    const storeId = req.params.storeId;
    console.log('Add medicine request:', { storeId, userEmail: req.user.email, name, stock, price });

    // Verify the store belongs to the user
    const store = await MedicineStore.findOne({ _id: storeId, owner: new RegExp('^' + req.user.email + '$', 'i') });
    if (!store) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const newMedicine = new Medicine({
      name,
      stock,
      price,
      description,
      storeId
    });

    await newMedicine.save();
    res.status(201).json(newMedicine);
  } catch (error) {
    console.error('Add medicine error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, stock, price, description } = req.body;

    const medicine = await Medicine.findById(id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Verify the store belongs to the user
    const store = await MedicineStore.findOne({ _id: medicine.storeId, owner: new RegExp('^' + req.user.email + '$', 'i') });
    if (!store) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    medicine.name = name || medicine.name;
    medicine.stock = stock !== undefined ? stock : medicine.stock;
    medicine.price = price !== undefined ? price : medicine.price;
    medicine.description = description !== undefined ? description : medicine.description;

    await medicine.save();
    res.json(medicine);
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const medicine = await Medicine.findById(id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Verify the store belongs to the user
    const store = await MedicineStore.findOne({ _id: medicine.storeId, owner: new RegExp('^' + req.user.email + '$', 'i') });
    if (!store) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Medicine.findByIdAndDelete(id);
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const searchMedicines = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { query } = req.query;

    console.log('searchMedicines called, storeId:', storeId, 'query:', query);

    if (!query || query.trim() === '') {
      console.log('Empty query, returning []');
      return res.json([]);
    }

    // Fix: Ensure storeId is ObjectId type for query
    const mongoose = await import('mongoose');
    let storeObjectId;
    try {
      storeObjectId = new mongoose.Types.ObjectId(storeId);
    } catch (err) {
      console.error('Invalid storeId:', storeId, err);
      return res.status(400).json({ message: 'Invalid storeId' });
    }

    const medicines = await Medicine.find({
      storeId: storeObjectId,
      name: new RegExp(query, 'i') // Case insensitive partial match
    });

    console.log('Found medicines:', medicines.length, medicines.map(m => ({ name: m.name, stock: m.stock })));

    // Add stock status to each medicine
    const medicinesWithStatus = medicines.map(medicine => {
      let stockStatus;
      if (medicine.stock === 0) {
        stockStatus = 'out of stock';
      } else if (medicine.stock <= 10) {
        stockStatus = 'low stock';
      } else {
        stockStatus = 'in stock';
      }
      return {
        ...medicine.toObject(),
        stockStatus
      };
    });

    return res.json(medicinesWithStatus);
  } catch (error) {
    console.error('Search medicines error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
