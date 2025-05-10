const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Evaluation extends Model {}

Evaluation.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  need_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'charity_needs',
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
  modelName: 'Evaluation',
  tableName: 'evaluations',
  timestamps: true,
  underscored: true
});

module.exports = Evaluation;