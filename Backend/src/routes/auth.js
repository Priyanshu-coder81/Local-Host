import express from 'express';
import { login, signup } from '../controllers/authController.js';

const router = express.Router();

console.log('Auth router created');

router.post('/login', login);
router.post('/signup', signup);

export default router;
