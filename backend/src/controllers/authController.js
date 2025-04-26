const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Missing required fields: email, password, name'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if email already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'Email already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      role: role || 'user',
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
    console.error('Registration error:', err);
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: email, password'
      });
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
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
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    next(err);
  }
};

module.exports = {
  register,
  login
};