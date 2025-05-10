const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { sendResetPasswordEmail } = require('../services/emailService');

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

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    console.log('Processing forgot password request for email:', email);

    const user = await userRepository.findByEmail(email);
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({
        error: 'Email không tồn tại trong hệ thống'
      });
    }

    console.log('Found user:', user.id);

    // Tạo token reset password
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Generated reset token');

    // Lưu token vào database
    await userRepository.updateResetToken(user.id, resetToken);

    console.log('Updated reset token in database');

    // Gửi email với link reset password
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendResetPasswordEmail(email, resetLink);

    res.json({
      message: 'Vui lòng kiểm tra email của bạn để đặt lại mật khẩu'
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ'
      });
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Email đã tồn tại'
      });
    }
    res.status(500).json({
      error: 'Có lỗi xảy ra, vui lòng thử lại sau'
    });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token and new password are required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userRepository.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await userRepository.updatePassword(user.id, hashedPassword);
    await userRepository.clearResetToken(user.id);

    res.json({
      message: 'Mật khẩu đã được đặt lại thành công'
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({
        error: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }
    console.error('Reset password error:', err);
    next(err);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
};