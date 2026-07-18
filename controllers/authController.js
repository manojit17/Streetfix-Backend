const User = require('../models/User');
const jwt  = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// ── REGISTER ──────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.statusCode = 400;
      throw new Error('Please provide name, email, and password');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.statusCode = 400;
      throw new Error('Email already registered — please login instead');
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id    : user._id,
        name  : user.name,
        email : user.email,
        avatar: user.avatar || null, // ✅ return avatar
        role  : user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── LOGIN ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.statusCode = 400;
      throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.statusCode = 401;
      throw new Error('Invalid credentials — email not found');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.statusCode = 401;
      throw new Error('Invalid credentials — wrong password');
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id    : user._id,
        name  : user.name,
        email : user.email,
        avatar: user.avatar || null, // ✅ return avatar
        role  : user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE PROFILE ─────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    
    if (name)  user.name  = name;
    if (email) user.email = email.toLowerCase();
    
    // ✅ Check if a new avatar file was uploaded
    if (req.file) {
      user.avatar = req.file.path; // Cloudinary URL
    }

    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated',
      user: { 
        id    : user._id, 
        name  : user.name, 
        email : user.email,
        avatar: user.avatar, // ✅ return updated avatar URL
        role  : user.role,
      }
    });
  } catch (error) { 
    next(error); 
  }
};

// ── CHANGE PASSWORD ────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.statusCode = 400;
      throw new Error('Please provide current and new password');
    }
    if (newPassword.length < 6) {
      res.statusCode = 400;
      throw new Error('New password must be at least 6 characters');
    }
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.statusCode = 401;
      throw new Error('Current password is incorrect');
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success:true, message:'Password changed successfully' });
  } catch (error) { 
    next(error); 
  }
};

module.exports = { register, login, updateProfile, changePassword };