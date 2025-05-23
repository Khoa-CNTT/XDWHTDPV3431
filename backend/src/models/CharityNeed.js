const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class CharityNeed extends Model {}

CharityNeed.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  organization_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  target_group: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  items_needed: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  raised_amount: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0,
  },
  funding_goal: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
  },
  raised_percent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  blockchain_link: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  project_link: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  fund_avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  is_interested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
  }
}, {
  sequelize,
  modelName: 'CharityNeed',
  tableName: 'charity_needs',
  timestamps: true,
  underscored: true
});

module.exports = CharityNeed;