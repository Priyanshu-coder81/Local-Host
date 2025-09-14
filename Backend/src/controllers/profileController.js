import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Return role-specific fields
    if (user.role === 'doctor') {
      res.json({
        email: user.email,
        role: user.role,
        registrationNumber: user.registrationNumber,
        specialization: user.specialization,
        name: user.name,
        experience: user.experience,
        currentHospital: user.currentHospital,
        phone: user.phone,
        qualifications: user.qualifications,
        languages: user.languages,
        createdAt: user.createdAt
      });
    } else if (user.role === 'patient') {
      res.json({
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        address: user.address,
        history: user.history,
        medicalRecords: user.medicalRecords,
        createdAt: user.createdAt
      });
    } else {
      res.json({
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      });
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { registrationNumber, specialization, name, phone, age, gender, address, history, experience, currentHospital, qualifications, languages } = req.body;

    const updateData = {};
    if (registrationNumber) updateData.registrationNumber = registrationNumber;
    if (specialization) updateData.specialization = specialization;
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (age) updateData.age = age;
    if (gender) updateData.gender = gender;
    if (address) updateData.address = address;
    if (history) updateData.history = history;
    if (experience) updateData.experience = experience;
    if (currentHospital) updateData.currentHospital = currentHospital;
    if (qualifications) updateData.qualifications = qualifications;
    if (languages) updateData.languages = languages;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return role-specific fields
    if (user.role === 'doctor') {
      res.json({
        email: user.email,
        role: user.role,
        registrationNumber: user.registrationNumber,
        specialization: user.specialization,
        name: user.name,
        experience: user.experience,
        currentHospital: user.currentHospital,
        phone: user.phone,
        qualifications: user.qualifications,
        languages: user.languages,
        createdAt: user.createdAt
      });
    } else if (user.role === 'patient') {
      res.json({
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        address: user.address,
        history: user.history,
        medicalRecords: user.medicalRecords,
        createdAt: user.createdAt
      });
    } else {
      res.json({
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
