const charityNeedRepository = require('../repositories/charityNeedRepository');
const userRepository = require('../repositories/userRepository');

const getAllCharityNeeds = async (req, res, next) => {
  try {
    const { created_by, page = 1, limit = 10 } = req.query;

    // Lọc theo created_by nếu có
    const filters = {};
    if (created_by) filters.created_by = created_by;

    // Tính toán phân trang
    const offset = (page - 1) * limit;
    const needs = await charityNeedRepository.getAll({ ...filters, limit, offset });

    // Đếm tổng số bản ghi để hỗ trợ phân trang
    const total = await charityNeedRepository.count(filters);

    res.json({
      data: needs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const createCharityNeed = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const created_by = req.user.id; // Lấy từ token (authMiddleware)

    // Kiểm tra dữ liệu đầu vào
    if (!title || !description) {
      const err = new Error('Missing required fields: title, description');
      err.status = 400;
      throw err;
    }

    // Kiểm tra người dùng có role 'charity'
    const user = await userRepository.findById(created_by);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    if (user.role !== 'charity') {
      const err = new Error('Unauthorized: Only charity users can create charity needs');
      err.status = 403;
      throw err;
    }

    // Tạo charity need
    const need = await charityNeedRepository.create({
      title,
      description,
      created_by,
    });

    res.status(201).json({
      message: 'Charity need created successfully',
      need_id: need.id,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCharityNeeds,
  createCharityNeed,
};