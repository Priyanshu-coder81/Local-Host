import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { getAllStores, createStore } from '../controllers/medicineStoreController.js';

const router = express.Router();

router.get('/stores', authenticateToken, getAllStores);
router.post('/stores', authenticateToken, createStore);

export default router;
