const { User, Contribution, CharityNeed, Evaluation } = require('../models');

// Get admin dashboard stats
const getStats = async (req, res) => {
  const totalUsers = await User.count();
  const totalContributions = await Contribution.count();
  const totalCharityNeeds = await CharityNeed.count();
  const recentCharityNeeds = await CharityNeed.findAll({ 
    order: [['created_at', 'DESC']], 
    limit: 5, 
    include: [{ model: User, as: 'creator' }] 
  });
  res.json({ totalUsers, totalContributions, totalCharityNeeds, recentCharityNeeds });
};

// Get all users
const getUsers = async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json(users);
};

// Change user role
const changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  await User.update({ role }, { where: { id } });
  res.json({ message: 'User role updated successfully' });
};

// Lock/Unlock user
const lockUser = async (req, res) => {
  const { id } = req.params;
  const { isLocked } = req.body;
  await User.update({ isLocked }, { where: { id } });
  res.json({ message: 'User status updated successfully' });
};

// Delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.destroy({ where: { id } });
  res.json({ message: 'User deleted successfully' });
};

// Get all charity needs
const getCharityNeeds = async (req, res) => {
  const charityNeeds = await CharityNeed.findAll({ 
    include: [{ model: User, as: 'creator' }] 
  });
  res.json(charityNeeds);
};

// Approve charity need
const approveCharityNeed = async (req, res) => {
  const { id } = req.params;
  await CharityNeed.update({ status: 'active' }, { where: { id } });
  res.json({ message: 'Charity need approved successfully' });
};

// Reject charity need
const rejectCharityNeed = async (req, res) => {
  const { id } = req.params;
  await CharityNeed.update({ status: 'rejected' }, { where: { id } });
  res.json({ message: 'Charity need rejected successfully' });
};

// Delete charity need
const deleteCharityNeed = async (req, res) => {
  const { id } = req.params;
  await CharityNeed.destroy({ where: { id } });
  res.json({ message: 'Charity need deleted successfully' });
};

// Get all contributions
const getDonations = async (req, res) => {
  const contributions = await Contribution.findAll({
    include: [
      { model: User, as: 'user' },
      { model: CharityNeed, as: 'need' }
    ]
  });
  res.json(contributions);
};

// Send notification
const sendNotification = async (req, res) => {
  const { title, content, target } = req.body;
  // TODO: Implement notification system
  res.json({ message: 'Notification sent successfully' });
};

// Get admin logs
const getLogs = async (req, res) => {
  const evaluations = await Evaluation.findAll({
    order: [['created_at', 'DESC']],
    include: [{ 
      model: User, 
      as: 'evaluator',
      foreignKey: 'evaluator_id'
    }]
  });
  res.json(evaluations);
};

module.exports = {
  getStats,
  getUsers,
  changeUserRole,
  lockUser,
  deleteUser,
  getCharityNeeds,
  approveCharityNeed,
  rejectCharityNeed,
  deleteCharityNeed,
  getDonations,
  sendNotification,
  getLogs
};