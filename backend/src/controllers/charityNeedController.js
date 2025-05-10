const charityNeedRepository = require('../repositories/charityNeedRepository');
const userRepository = require('../repositories/userRepository');
const blockchainService = require('../services/blockchainService');

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
    const { 
      title, 
      description,
      organization_name,
      location,
      target_group,
      items_needed,
      funding_goal,
      image,
      blockchain_link,
      project_link,
      fund_avatar
    } = req.body;
    const created_by = req.user.id;

    // Kiểm tra dữ liệu đầu vào
    if (!title || !description || !organization_name || !location || !target_group || !items_needed || !funding_goal) {
      const err = new Error('Missing required fields');
      err.status = 400;
      throw err;
    }

    // Kiểm tra người dùng có role 'user'
    const user = await userRepository.findById(created_by);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    if (user.role !== 'user') {
      const err = new Error('Unauthorized: Only users can create charity needs');
      err.status = 403;
      throw err;
    }

    // Tạo project trên blockchain
    const blockchainProject = await blockchainService.createProject(
      title,
      description,
      funding_goal,
      user.wallet_address // Giả sử user model có trường wallet_address
    );

    // Tạo charity need trong database
    const need = await charityNeedRepository.create({
      title,
      description,
      organization_name,
      location,
      target_group,
      items_needed,
      funding_goal,
      image,
      blockchain_link: blockchainProject.transactionHash, // Lưu transaction hash
      project_link,
      fund_avatar,
      created_by,
    });

    res.status(201).json({
      message: 'Charity need created successfully',
      need_id: need.id,
      blockchain_tx: blockchainProject.transactionHash
    });
  } catch (err) {
    next(err);
  }
};

const donate = async (req, res, next) => {
  try {
    const { need_id, amount } = req.body;
    const user_id = req.user.id;

    if (!need_id || !amount) {
      const err = new Error('Missing required fields');
      err.status = 400;
      throw err;
    }

    // Lấy thông tin user và charity need
    const user = await userRepository.findById(user_id);
    const need = await charityNeedRepository.findById(need_id);

    if (!user || !need) {
      const err = new Error('User or charity need not found');
      err.status = 404;
      throw err;
    }

    // Thực hiện quyên góp trên blockchain
    const donation = await blockchainService.donate(
      need_id,
      amount,
      user.wallet_address
    );

    // Cập nhật thông tin quyên góp trong database
    const contribution = await charityNeedRepository.createContribution({
      user_id,
      need_id,
      amount,
      blockchain_tx: donation.transactionHash,
      status: 'confirmed'
    });

    res.status(201).json({
      message: 'Donation successful',
      contribution,
      blockchain_tx: donation.transactionHash
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCharityNeeds,
  createCharityNeed,
  donate,
};