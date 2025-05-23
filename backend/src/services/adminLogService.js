const { AdminLog } = require('../models');

const logAdminAction = async (adminId, action, targetTable, targetId) => {
  try {
    await AdminLog.create({
      admin_id: adminId,
      action,
      target_table: targetTable,
      target_id: targetId
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

module.exports = {
  logAdminAction
}; 