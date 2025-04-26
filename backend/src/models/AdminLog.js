const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');

const AdminLog = sequelize.define('AdminLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  action: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  target_table: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
}, {
  tableName: 'admin_logs',
  timestamps: false,
});

AdminLog.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

module.exports = AdminLog;