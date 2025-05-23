const charityNeedRepository = require('../repositories/charityNeedRepository');
const userRepository = require('../repositories/userRepository');
const blockchainService = require('../services/blockchainService');
const { CharityNeed, User, Contribution } = require('../models');
const { logAdminAction } = require('../services/adminLogService');

const getAllCharityNeeds = async (req, res, next) => {
  try {
    const { created_by, page, limit } = req.query;

    // Nếu không có phân trang, trả về toàn bộ danh sách dự án
    if (!page && !limit) {
      const needs = await charityNeedRepository.getAll({ created_by });
      return res.json({
        data: needs,
        pagination: {
          total: needs.length,
          page: 1,
          limit: needs.length,
          totalPages: 1
        }
      });
    }

    // Nếu có phân trang
    const filters = {};
    if (created_by) filters.created_by = created_by;
    const pageNum = (!page || isNaN(Number(page))) ? 1 : parseInt(page);
    const limitNum = (!limit || isNaN(Number(limit))) ? 10 : parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    const needs = await charityNeedRepository.getAll({ ...filters, limit: limitNum, offset });
    const total = await charityNeedRepository.count(filters);
    res.json({
      data: needs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('Error in getAllCharityNeeds:', err);
    next(err);
  }
};

const createCharityNeed = async (req, res, next) => {
  try {
    const { 
      title, 
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
    if (!title || !organization_name || !location || !target_group || !items_needed || !funding_goal) {
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
    let blockchainProject;
    try {
      blockchainProject = await blockchainService.createNeed(
        title,
        items_needed, // Sử dụng items_needed thay vì description
        funding_goal,
        user.wallet_address
      );
    } catch (blockchainError) {
      console.error('Blockchain createNeed error:', blockchainError);
      return res.status(500).json({ message: 'Blockchain error', error: blockchainError.message });
    }

    // Tạo charity need trong database
    const need = await charityNeedRepository.create({
      title,
      organization_name,
      location,
      target_group,
      items_needed,
      funding_goal,
      image,
      blockchain_link: blockchainProject.transactionHash,
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

    console.log('Donate request:', { need_id, amount, user_id });

    if (!need_id || !amount) {
      const err = new Error('Missing required fields');
      err.status = 400;
      throw err;
    }

    // Lấy thông tin user và charity need
    const user = await userRepository.findById(user_id);
    const need = await CharityNeed.findByPk(need_id);

    console.log('User and need:', { user, need });

    if (!user || !need) {
      const err = new Error('User or charity need not found');
      err.status = 404;
      throw err;
    }

    if (!user.wallet_address) {
      const err = new Error('User wallet address not found');
      err.status = 400;
      throw err;
    }

    // Thực hiện quyên góp trên blockchain
    try {
      const donation = await blockchainService.contribute(
        need_id,
        amount,
        user.wallet_address
      );

      console.log('Blockchain donation result:', donation);

      // Cập nhật thông tin quyên góp trong database
      const contribution = await charityNeedRepository.createContribution({
        user_id,
        need_id,
        amount,
        blockchain_tx: donation.transactionHash,
        status: 'confirmed'
      });

      // Cập nhật số tiền đã quyên góp và phần trăm
      const newRaisedAmount = parseFloat(need.raised_amount) + parseFloat(amount);
      const raisedPercent = (newRaisedAmount / parseFloat(need.funding_goal)) * 100;
      
      await need.update({
        raised_amount: newRaisedAmount,
        raised_percent: raisedPercent
      });

      res.status(201).json({
        message: 'Donation successful',
        contribution,
        blockchain_tx: donation.transactionHash
      });
    } catch (blockchainError) {
      console.error('Blockchain error:', blockchainError);
      const err = new Error('Failed to process donation on blockchain');
      err.status = 500;
      err.originalError = blockchainError;
      throw err;
    }
  } catch (err) {
    console.error('Donate error:', err);
    next(err);
  }
};

const getCharityNeedById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const need = await CharityNeed.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Contribution, as: 'contributions', include: [
          { model: User, as: 'user', attributes: ['id', 'name'] }
        ]}
      ]
    });

    if (!need) {
      const err = new Error('Charity need not found');
      err.status = 404;
      throw err;
    }

    res.json(need);
  } catch (err) {
    next(err);
  }
};

// Approve charity need
const approveCharityNeed = async (req, res) => {
  try {
    const { id } = req.params;
    const charityNeed = await CharityNeed.findByPk(id);
    
    if (!charityNeed) {
      return res.status(404).json({ message: 'Charity need not found' });
    }

    await charityNeed.update({ status: 'approved' });
    await logAdminAction(req.user.id, 'Approved charity need', 'charity_needs', id);

    res.json({ message: 'Charity need approved successfully' });
  } catch (error) {
    console.error('Error approving charity need:', error);
    res.status(500).json({ message: 'Error approving charity need' });
  }
};

// Reject charity need
const rejectCharityNeed = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const charityNeed = await CharityNeed.findByPk(id);
    
    if (!charityNeed) {
      return res.status(404).json({ message: 'Charity need not found' });
    }

    await charityNeed.update({ 
      status: 'rejected',
      rejection_reason: reason
    });
    await logAdminAction(req.user.id, `Rejected charity need: ${reason}`, 'charity_needs', id);

    res.json({ message: 'Charity need rejected successfully' });
  } catch (error) {
    console.error('Error rejecting charity need:', error);
    res.status(500).json({ message: 'Error rejecting charity need' });
  }
};

// Get pending charity needs
const getPendingCharityNeeds = async (req, res) => {
  try {
    const pendingNeeds = await CharityNeed.findAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'creator' }],
      order: [['created_at', 'DESC']]
    });
    res.json(pendingNeeds);
  } catch (error) {
    console.error('Error getting pending charity needs:', error);
    res.status(500).json({ message: 'Error getting pending charity needs' });
  }
};

module.exports = {
  getAllCharityNeeds,
  createCharityNeed,
  donate,
  getCharityNeedById,
  approveCharityNeed,
  rejectCharityNeed,
  getPendingCharityNeeds
};