const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CharityNeed = sequelize.define('CharityNeed', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  goal_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  current_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'charity_needs',
  timestamps: true,
});

module.exports = { CharityNeed };