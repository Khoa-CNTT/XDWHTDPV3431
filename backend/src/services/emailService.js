const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Tạo transporter cho nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Tạo token xác thực
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Gửi email xác thực
const sendVerificationEmail = async (email, token) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Xác nhận đăng ký tài khoản',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Xác nhận đăng ký tài khoản</h2>
                <p>Xin chào,</p>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại hệ thống từ thiện của chúng tôi. Để hoàn tất quá trình đăng ký, vui lòng click vào nút bên dưới để xác nhận email của bạn:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" 
                       style="background-color: #3498db; 
                              color: white; 
                              padding: 12px 24px; 
                              text-decoration: none; 
                              border-radius: 5px;
                              display: inline-block;">
                        Xác nhận Email
                    </a>
                </div>
                <p>Hoặc bạn có thể copy và dán đường link sau vào trình duyệt:</p>
                <p style="word-break: break-all;">${verificationLink}</p>
                <p><strong>Lưu ý:</strong> Link xác nhận này sẽ hết hạn sau 24 giờ.</p>
                <p>Nếu bạn không thực hiện đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="color: #7f8c8d; font-size: 12px;">
                    Đây là email tự động, vui lòng không trả lời email này.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
};

// Gửi email thông báo xác thực thành công
const sendVerificationSuccessEmail = async (email) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Xác thực email thành công',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #27ae60;">Xác thực email thành công!</h2>
                <p>Xin chào,</p>
                <p>Email của bạn đã được xác thực thành công. Bây giờ bạn có thể đăng nhập và sử dụng đầy đủ các tính năng của hệ thống.</p>
                <p>Cảm ơn bạn đã tham gia cùng chúng tôi!</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="color: #7f8c8d; font-size: 12px;">
                    Đây là email tự động, vui lòng không trả lời email này.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending success email:', error);
        return false;
    }
};

module.exports = {
    generateVerificationToken,
    sendVerificationEmail,
    sendVerificationSuccessEmail
}; 