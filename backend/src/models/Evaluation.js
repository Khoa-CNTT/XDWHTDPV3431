const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Evaluation = sequelize.define('Evaluation', {
  need_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'charity_needs',
      key: 'id',
    },
  },
  evaluator_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  comment: {
    type: DataTypes.TEXT,
  },
  score: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 10,
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'evaluations',
  timestamps: false,
});

module.exports = { Evaluation };