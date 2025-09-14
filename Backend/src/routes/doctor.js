import express from 'express';
import { getSpecializations, getDoctorsBySpecialization } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/specializations', getSpecializations);
router.get('/specialization/:specialization', getDoctorsBySpecialization);

export default router;
