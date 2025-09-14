import express from 'express';
import { bookAppointment, getUpcomingAppointments, confirmAppointment, completeAppointment, getMyAppointments, uploadAppointmentMedicalRecord, upload } from '../controllers/appointmentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/book', authenticateToken, bookAppointment);
router.get('/upcoming', authenticateToken, getUpcomingAppointments);
router.put('/:id/confirm', authenticateToken, confirmAppointment);
router.put('/:id/complete', authenticateToken, completeAppointment);
router.get('/mine', authenticateToken, getMyAppointments);
router.post('/:id/medical-records', authenticateToken, upload.single('medicalRecord'), uploadAppointmentMedicalRecord);

export default router;
