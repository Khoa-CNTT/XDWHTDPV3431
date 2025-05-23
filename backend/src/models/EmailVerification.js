const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');

const EmailVerification = sequelize.define('EmailVerification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// Tạo token mới
EmailVerification.generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Tạo thời gian hết hạn (24 giờ)
EmailVerification.generateExpiry = () => {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    return expiry;
};

module.exports = EmailVerification; 