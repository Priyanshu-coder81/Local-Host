import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!['doctor', 'patient', 'medicine_store'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role !== role) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const signup = async (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    const { email, password, role, registrationNumber, specialization, name, age, gender } = req.body;

    if (!role) {
      console.log('Role is missing');
      return res.status(400).json({ message: 'Role is required' });
    }

    if (role === 'doctor' && (!registrationNumber || !specialization)) {
      return res.status(400).json({ message: 'Registration number and specialization are required for doctors' });
    }

    if (role === 'patient' && (!name || !age || !gender || !req.body.address || !req.body.phone)) {
      return res.status(400).json({ message: 'Name, age, gender, address, and phone are required for patients' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    console.log('Existing user check:', existingUser);
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      ...(role === 'doctor' && { registrationNumber, specialization }),
      ...(role === 'patient' && { name, age, gender, address: req.body.address, phone: req.body.phone })
    });

    console.log('Saving new user:', newUser);
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });

    console.log('Signup successful, returning token');
    res.status(201).json({ token, user: { id: newUser._id, email: newUser.email, role: newUser.role } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const refresh = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: 'Token required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const newToken = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
