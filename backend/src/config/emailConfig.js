const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendVerificationEmail = async (email, token) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Xác nhận đăng ký tài khoản',
        html: `
            <h1>Xác nhận đăng ký tài khoản</h1>
            <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng click vào link dưới đây để xác nhận email của bạn:</p>
            <a href="${verificationLink}">Xác nhận email</a>
            <p>Link này sẽ hết hạn sau 24 giờ.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = {
    sendVerificationEmail
}; 