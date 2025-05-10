const { TransparencyReport } = require('../models');

// Lấy tất cả báo cáo minh bạch
const getAllReports = async (req, res, next) => {
  try {
    const reports = await TransparencyReport.findAll({
      order: [['created_at', 'DESC']],
      include: [{
        model: 'User',
        as: 'created_by',
        attributes: ['id', 'name', 'email']
      }]
    });
    res.json(reports);
  } catch (err) {
    next(err);
  }
};

// Lấy báo cáo theo ID
const getReportById = async (req, res, next) => {
  try {
    const report = await TransparencyReport.findByPk(req.params.id, {
      include: [{
        model: 'User',
        as: 'created_by',
        attributes: ['id', 'name', 'email']
      }]
    });
    if (!report) {
      return res.status(404).json({ error: 'Báo cáo không tồn tại' });
    }
    res.json(report);
  } catch (err) {
    next(err);
  }
};

// Tạo báo cáo mới
const createReport = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Tiêu đề và nội dung là bắt buộc' });
    }

    const report = await TransparencyReport.create({
      title,
      content,
      created_by: req.user.id
    });

    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
};

// Cập nhật báo cáo
const updateReport = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Tiêu đề và nội dung là bắt buộc' });
    }

    const report = await TransparencyReport.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Báo cáo không tồn tại' });
    }

    await report.update({
      title,
      content
    });

    res.json(report);
  } catch (err) {
    next(err);
  }
};

// Xóa báo cáo
const deleteReport = async (req, res, next) => {
  try {
    const report = await TransparencyReport.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Báo cáo không tồn tại' });
    }

    await report.destroy();
    res.json({ message: 'Xóa báo cáo thành công' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport
}; 