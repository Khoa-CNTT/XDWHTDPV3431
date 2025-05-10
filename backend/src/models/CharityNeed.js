const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class CharityNeed extends Model {}

CharityNeed.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  amount_needed: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  amount_raised: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'completed', 'rejected'),
    defaultValue: 'pending'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'CharityNeed',
  tableName: 'charity_needs',
  timestamps: true,
  underscored: true
});

module.exports = CharityNeed;