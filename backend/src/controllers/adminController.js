const { User, Contribution, CharityNeed, Evaluation, AdminLog } = require('../models');
const { logAdminAction } = require('../services/adminLogService');

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
  await logAdminAction(req.user.id, `Changed user role to ${role}`, 'users', id);
  res.json({ message: 'User role updated successfully' });
};

// Lock/Unlock user
const lockUser = async (req, res) => {
  const { id } = req.params;
  const isLocked = req.body.isLocked ? 1 : 0;
  await User.update({ isLocked }, { where: { id } });
  await logAdminAction(req.user.id, isLocked ? 'Locked user' : 'Unlocked user', 'users', id);
  res.json({ message: 'User status updated successfully' });
};

// Delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.destroy({ where: { id } });
  await logAdminAction(req.user.id, 'Deleted user', 'users', id);
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
  const { id } = req.params;
  await CharityNeed.update({ status: 'rejected' }, { where: { id } });
  await logAdminAction(req.user.id, 'Rejected charity need', 'charity_needs', id);
  res.json({ message: 'Charity need rejected successfully' });
};

// Delete charity need
const deleteCharityNeed = async (req, res) => {
  const { id } = req.params;
  await CharityNeed.destroy({ where: { id } });
  await logAdminAction(req.user.id, 'Deleted charity need', 'charity_needs', id);
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
  await logAdminAction(req.user.id, `Sent notification: ${title}`, 'notifications', null);
  res.json({ message: 'Notification sent successfully' });
};

// Get admin logs
const getLogs = async (req, res) => {
  const logs = await AdminLog.findAll({
    order: [['created_at', 'DESC']],
    include: [{ 
      model: User,
      as: 'admin',
      foreignKey: 'admin_id'
    }]
  });
  res.json(logs);
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