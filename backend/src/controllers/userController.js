const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
  CharityNeed, 
  TransparencyReport, 
  Contribution, 
  Feedback 
} = require('../models');

// Authentication functions
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      const err = new Error('Missing required fields');
      err.status = 400;
      throw err;
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const err = new Error('Email already exists');
      err.status = 400;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      role: 'user'
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// CRUD functions
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userRepository.getAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userRepository.getById(req.params.id);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      const err = new Error('Missing required fields');
      err.status = 400;
      throw err;
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const err = new Error('Email already exists');
      err.status = 400;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      role: role || 'user'
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { email, name, role } = req.body;
    const userId = req.params.id;

    const user = await userRepository.getById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    const updateData = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role;

    const updatedUser = await userRepository.update(userId, updateData);
    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      }
    });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await userRepository.getById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    await userRepository.delete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// User specific operations
const getTransparencyReport = async (req, res, next) => {
  try {
    const reports = await TransparencyReport.findAll({
      where: { user_id: req.user.id }
    });
    res.json(reports);
  } catch (err) {
    next(err);
  }
};

const getCharityNeeds = async (req, res, next) => {
  try {
    const needs = await CharityNeed.findAll({
      where: { user_id: req.user.id }
    });
    res.json(needs);
  } catch (err) {
    next(err);
  }
};

const contribute = async (req, res, next) => {
  try {
    const { need_id, amount } = req.body;
    if (!need_id || !amount) {
      const err = new Error('Missing required fields');
      err.status = 400;
      throw err;
    }

    const contribution = await Contribution.create({
      user_id: req.user.id,
      need_id,
      amount,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Contribution created successfully',
      contribution
    });
  } catch (err) {
    next(err);
  }
};

const trackContribution = async (req, res, next) => {
  try {
    const contributions = await Contribution.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: CharityNeed,
        as: 'need'
      }]
    });
    res.json(contributions);
  } catch (err) {
    next(err);
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) {
      const err = new Error('Feedback content is required');
      err.status = 400;
      throw err;
    }

    const feedback = await Feedback.create({
      user_id: req.user.id,
      content
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  register,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getTransparencyReport,
  getCharityNeeds,
  contribute,
  trackContribution,
  submitFeedback
};