const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { id: decoded.id } });

        if (!user) {
            return res.status(401).json({ message: 'Không tìm thấy người dùng' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Vui lòng xác thực email trước khi đăng nhập' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }
};

module.exports = auth; 