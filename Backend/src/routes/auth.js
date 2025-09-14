import express from 'express';
import { login, signup, refresh } from '../controllers/authController.js';

const router = express.Router();

console.log('Auth router created');

router.post('/login', login);
router.post('/signup', signup);
router.post('/refresh', refresh);

export default router;
