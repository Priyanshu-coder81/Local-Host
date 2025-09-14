import MedicineStore from '../models/medicineStore.js';

export const getAllStores = async (req, res) => {
  try {
    console.log('getAllStores called, req.user:', req.user);
    const user = req.user;
    let stores;
    if (user && user.role === 'medicine_store') {
      // Return only stores owned by this user (case insensitive)
      stores = await MedicineStore.find({ owner: new RegExp('^' + user.email + '$', 'i') });
      console.log('Stores for medicine_store user:', user.email, 'found stores:', stores.length, stores.map(s => ({ id: s._id, name: s.name, owner: s.owner })));
    } else {
      // Return all stores for other users (e.g., patients)
      stores = await MedicineStore.find({});
      console.log('Stores for non-medicine_store user:', user ? user.email : 'anonymous', 'found stores:', stores.length);
    }
    if (stores.length === 0) {
      console.log('No store found for user:', user ? user.email : 'anonymous');
    }
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createStore = async (req, res) => {
  try {
    const { name, address, contact, gstNo } = req.body;
    const owner = req.user ? req.user.email : null; // Get owner from authenticated user

    if (!owner) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    if (!name || !address || !contact || !gstNo) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if store already exists for this owner (case insensitive)
    const existingStore = await MedicineStore.findOne({ owner: new RegExp('^' + owner + '$', 'i') });
    if (existingStore) {
      return res.status(400).json({ message: 'Store already exists for this owner' });
    }

    const newStore = new MedicineStore({
      name,
      address,
      contact,
      gstNo,
      owner
    });

    await newStore.save();

    res.status(201).json(newStore);
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
