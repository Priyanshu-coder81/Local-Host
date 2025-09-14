import express from 'express';
import { getPatientProfile } from '../controllers/patientController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:id', authenticateToken, getPatientProfile);

export default router;
