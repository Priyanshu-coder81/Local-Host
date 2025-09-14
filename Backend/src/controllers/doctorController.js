import User from '../models/User.js';

export const getSpecializations = async (req, res) => {
  try {
    const specializations = await User.distinct('specialization', { role: 'doctor' });
    res.json(specializations);
  } catch (error) {
    console.error('Error fetching specializations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    const doctors = await User.find({ role: 'doctor', specialization }, 'email registrationNumber specialization');
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors by specialization:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
