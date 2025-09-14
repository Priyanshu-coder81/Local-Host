import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { getMedicinesByStore, addMedicine, updateMedicine, deleteMedicine, searchMedicines } from '../controllers/medicineController.js';

const router = express.Router();

// Get medicines for a specific store
router.get('/store/:storeId', authenticateToken, getMedicinesByStore);

// Add new medicine to a store
router.post('/store/:storeId', authenticateToken, addMedicine);

// Update medicine
router.put('/:id', authenticateToken, updateMedicine);

// Delete medicine
router.delete('/:id', authenticateToken, deleteMedicine);

// Search medicines in a store
router.get('/search/:storeId', authenticateToken, searchMedicines);

export default router;
