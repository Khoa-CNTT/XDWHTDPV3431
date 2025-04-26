const { User, Project, Donation, Notification, Log } = require('../models');

// Thống kê tổng quan
exports.getStats = async (req, res) => {
  const totalUsers = await User.count();
  const totalProjects = await Project.count();
  const totalDonations = await Donation.sum('amount');
  const recentProjects = await Project.findAll({ order: [['createdAt', 'DESC']], limit: 5, include: [{ model: User, as: 'creator' }] });
  res.json({ totalUsers, totalProjects, totalDonations, recentProjects });
};

// Quản lý user
exports.getUsers = async (req, res) => {
  const users = await User.findAll();
  res.json(users);
};
exports.changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  await User.update({ role }, { where: { id } });
  res.json({ success: true });
};
exports.lockUser = async (req, res) => {
  const { id } = req.params;
  const { locked } = req.body;
  await User.update({ locked }, { where: { id } });
  res.json({ success: true });
};
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.destroy({ where: { id } });
  res.json({ success: true });
};

// Quản lý dự án
exports.getProjects = async (req, res) => {
  const projects = await Project.findAll({ include: [{ model: User, as: 'creator' }] });
  res.json(projects);
};
exports.approveProject = async (req, res) => {
  const { id } = req.params;
  await Project.update({ status: 'active' }, { where: { id } });
  res.json({ success: true });
};
exports.rejectProject = async (req, res) => {
  const { id } = req.params;
  await Project.update({ status: 'rejected' }, { where: { id } });
  res.json({ success: true });
};
exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  await Project.destroy({ where: { id } });
  res.json({ success: true });
};

// Lịch sử quyên góp
exports.getDonations = async (req, res) => {
  const donations = await Donation.findAll({ include: [{ model: User }, { model: Project }] });
  res.json(donations);
};

// Gửi thông báo
exports.sendNotification = async (req, res) => {
  const { message, target } = req.body;
  await Notification.create({ message, target });
  res.json({ success: true });
};

// Nhật ký hoạt động
exports.getLogs = async (req, res) => {
  const logs = await Log.findAll({ order: [['createdAt', 'DESC']], limit: 100, include: [{ model: User }] });
  res.json(logs);
};

module.exports = { getStats, getUsers, changeUserRole, lockUser, deleteUser, getProjects, approveProject, rejectProject, deleteProject, getDonations, sendNotification, getLogs };