const { User, Contribution, CharityNeed, TransparencyReport, Feedback, Op } = require('../models');
const db = require('../config/database');

class UserRepository {
  // Lấy tất cả user (hỗ trợ phân trang và lọc)
  async getAll({ role, username, page = 1, limit = 10 } = {}) {
    const where = {};
    if (role) where.role = role;
    if (username) where.username = { [Op.like]: `%${username}%` }; // Tìm kiếm gần đúng

    const offset = (page - 1) * limit;
    return await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password'] } // Exclude password from response
    });
  }

  // Lấy user theo ID
  async findById(userId) {
    if (!userId || isNaN(userId)) {
      const err = new Error('Invalid user ID');
      err.status = 400;
      throw err;
    }
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return user;
  }

  // Tìm user theo email
  async findByEmail(email) {
    if (!email) {
      const err = new Error('Email is required');
      err.status = 400;
      throw err;
    }
    return await User.findOne({ 
      where: { email }
    });
  }

  // Tạo user mới
  async create(userData) {
    if (!userData.email || !userData.password) {
      const err = new Error('Missing required fields: email, password');
      err.status = 400;
      throw err;
    }

    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      const err = new Error('Email already exists');
      err.status = 400;
      throw err;
    }

    const user = await User.create(userData);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  }

  // Cập nhật user
  async update(userId, updateData) {
    if (!userId || isNaN(userId)) {
      const err = new Error('Invalid user ID');
      err.status = 400;
      throw err;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    if (updateData.email) {
      const existingUser = await this.findByEmail(updateData.email);
      if (existingUser && existingUser.id !== userId) {
        const err = new Error('Email already exists');
        err.status = 400;
        throw err;
      }
    }

    await user.update(updateData);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  }

  // Xóa user
  async delete(userId) {
    if (!userId || isNaN(userId)) {
      const err = new Error('Invalid user ID');
      err.status = 400;
      throw err;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    await user.destroy();
    return true;
  }

  // User specific operations
  async getTransparencyReports() {
    return await TransparencyReport.findAll({
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        as: 'created_by',
        attributes: ['id', 'name', 'email']
      }]
    });
  }

  async getCharityNeeds() {
    return await CharityNeed.findAll({
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        as: 'created_by',
        attributes: ['id', 'name', 'email']
      }]
    });
  }

  async createContribution({ user_id, need_id, amount }) {
    const need = await CharityNeed.findByPk(need_id);
    if (!need) {
      const err = new Error('Charity need not found');
      err.status = 404;
      throw err;
    }

    return await Contribution.create({
      user_id,
      need_id,
      amount,
      status: 'pending'
    });
  }

  async getUserContributions(userId) {
    return await Contribution.findAll({
      where: { user_id: userId },
      include: [{
        model: CharityNeed,
        as: 'need',
        attributes: ['title', 'description']
      }],
      order: [['created_at', 'DESC']]
    });
  }

  async createFeedback({ user_id, content }) {
    return await Feedback.create({
      user_id,
      content
    });
  }

  // Reset password methods
  async updateResetToken(userId, resetToken) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    await user.update({
      reset_token: resetToken,
      reset_token_expires: new Date(Date.now() + 3600000) // 1 hour from now
    });
  }

  async clearResetToken(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    await user.update({
      reset_token: null,
      reset_token_expires: null
    });
  }

  async updatePassword(userId, hashedPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    await user.update({
      password: hashedPassword
    });
  }
}

module.exports = new UserRepository();