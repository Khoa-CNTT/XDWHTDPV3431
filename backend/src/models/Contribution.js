const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contribution = sequelize.define('Contribution', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  charity_need_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'charity_needs', key: 'id' },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paypal_payment_id: {
    type: DataTypes.STRING(255),
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'contributions',
  timestamps: true,
});

module.exports = { Contribution };