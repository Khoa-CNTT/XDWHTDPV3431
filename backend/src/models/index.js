const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Import models
const User = require('./User');
const CharityNeed = require('./CharityNeed');
const TransparencyReport = require('./TransparencyReport');
const Contribution = require('./Contribution');
const Feedback = require('./Feedback');
const Evaluation = require('./Evaluation');
const AdminLog = require('./AdminLog');

// Define associations
const setupAssociations = () => {
  // User associations
  User.hasMany(Contribution, { 
    foreignKey: 'user_id',
    as: 'contributions'
  });

  User.hasMany(CharityNeed, { 
    foreignKey: 'created_by',
    as: 'charityNeeds'
  });

  User.hasMany(TransparencyReport, { 
    foreignKey: 'created_by',
    as: 'reports'
  });

  User.hasMany(Feedback, { 
    foreignKey: 'user_id',
    as: 'feedbacks'
  });

  User.hasMany(Evaluation, { 
    foreignKey: 'user_id',
    as: 'evaluations'
  });

  User.hasMany(AdminLog, {
    foreignKey: 'admin_id',
    as: 'adminLogs'
  });

  // CharityNeed associations
  CharityNeed.belongsTo(User, { 
    foreignKey: 'created_by',
    as: 'creator'
  });

  CharityNeed.hasMany(Contribution, { 
    foreignKey: 'need_id',
    as: 'contributions'
  });

  CharityNeed.hasMany(Evaluation, { 
    foreignKey: 'need_id',
    as: 'evaluations'
  });

  // Contribution associations
  Contribution.belongsTo(User, { 
    foreignKey: 'user_id',
    as: 'user'
  });

  Contribution.belongsTo(CharityNeed, { 
    foreignKey: 'need_id',
    as: 'need'
  });

  // TransparencyReport associations
  TransparencyReport.belongsTo(User, { 
    foreignKey: 'created_by',
    as: 'creator'
  });

  // Feedback associations
  Feedback.belongsTo(User, { 
    foreignKey: 'user_id',
    as: 'user'
  });

  // Evaluation associations
  Evaluation.belongsTo(User, { 
    foreignKey: 'user_id',
    as: 'user'
  });

  Evaluation.belongsTo(CharityNeed, { 
    foreignKey: 'need_id',
    as: 'need'
  });

  // AdminLog associations
  AdminLog.belongsTo(User, {
    foreignKey: 'admin_id',
    as: 'admin'
  });
};

// Setup associations
setupAssociations();

// Export models and sequelize instance
module.exports = {
  sequelize: config,
  Sequelize,
  Op: Sequelize.Op,
  User,
  CharityNeed,
  TransparencyReport,
  Contribution,
  Feedback,
  Evaluation,
  AdminLog
};