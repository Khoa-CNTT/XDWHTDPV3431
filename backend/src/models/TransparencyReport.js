const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TransparencyReport = sequelize.define('TransparencyReport', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'transparency_reports',
  timestamps: false,
});

module.exports = { TransparencyReport };