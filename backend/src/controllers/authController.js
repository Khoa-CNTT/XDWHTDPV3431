const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { sendResetPasswordEmail, generateVerificationToken, sendVerificationEmail, sendVerificationSuccessEmail } = require('../services/emailService');
const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const { Op } = require('sequelize');

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo token xác thực
    const verificationToken = generateVerificationToken();

    // Tạo user mới với trạng thái chưa xác thực
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      isVerified: false,
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 giờ
    });

    // Gửi email xác thực
    const emailSent = await sendVerificationEmail(email, verificationToken);
    if (!emailSent) {
      // Nếu gửi email thất bại, xóa user
      await user.destroy();
      return res.status(500).json({ message: 'Không thể gửi email xác thực' });
    }

    res.status(201).json({
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Lỗi server' });
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

    if (user.isLocked) {
      return res.status(403).json({ error: 'Tài khoản đã bị khóa. Vui lòng liên hệ admin.' });
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

// Đổi mật khẩu cho user đã đăng nhập
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Thiếu mật khẩu hiện tại hoặc mật khẩu mới' });
    }
    // Lấy user đầy đủ (bao gồm password)
    const user = await userRepository.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
    }
    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    // Tìm user với token xác thực
    const user = await User.findOne({
      where: {
        verificationToken: token,
        verificationTokenExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // Cập nhật trạng thái xác thực
    await user.update({
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null
    });

    // Gửi email thông báo xác thực thành công
    await sendVerificationSuccessEmail(user.email);

    res.json({ message: 'Xác thực email thành công' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail
};