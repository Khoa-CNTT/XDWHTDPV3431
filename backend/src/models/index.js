const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Import models
const { User } = require('./user');
const { CharityNeed } = require('./charityNeed');
const { TransparencyReport } = require('./TransparencyReport');
const { Contribution } = require('./Contribution');
const { Feedback } = require('./Feedback');
const { Evaluation } = require('./Evaluation');

// Define associations
const setupAssociations = () => {
  // User associations
  User.hasMany(Contribution, { 
    foreignKey: 'user_id',
    as: 'contributions'
  });
  User.hasMany(CharityNeed, { 
    foreignKey: 'created_by',
    as: 'charity_needs'
  });
  User.hasMany(TransparencyReport, { 
    foreignKey: 'created_by',
    as: 'transparency_reports'
  });
  User.hasMany(Feedback, { 
    foreignKey: 'user_id',
    as: 'feedbacks'
  });
  User.hasMany(Evaluation, { 
    foreignKey: 'user_id',
    as: 'evaluations'
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
};

// Setup associations
setupAssociations();

module.exports = {
  User,
  CharityNeed,
  TransparencyReport,
  Contribution,
  Feedback,
  Evaluation,
  sequelize,
  Sequelize,
  Op: Sequelize.Op
};