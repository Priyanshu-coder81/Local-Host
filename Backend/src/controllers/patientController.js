import User from '../models/User.js';

export const getPatientProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.user.id;

    // Check if requester is a doctor
    const requester = await User.findById(requesterId);
    if (!requester || requester.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Only doctors can view patient profiles.' });
    }

    // Fetch patient
    const patient = await User.findById(id);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Return patient profile data
    res.json({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      address: patient.address,
      history: patient.history,
      medicalRecords: patient.medicalRecords
    });
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


