const db = require('../config/db');
const bcrypt = require('bcryptjs'); // Dùng bcryptjs theo package.json của bạn
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Hàm Đăng ký (Tạo tài khoản)
exports.register = async (req, res) => {
    try {
        // Điều chỉnh các trường theo đúng bảng users trong LearnUp (name, role ENUM)
        const { email, password, name, role } = req.body;

        // 1. Validate: Kiểm tra các trường bắt buộc
        if (!email || !password || !name) {
            return res.status(400).json({ status: 'Error', message: 'Vui lòng điền đủ email, password, và name' });
        }

        // 2. Validate format email (cơ bản)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ status: 'Error', message: 'Email không hợp lệ' });
        }

        // 3. Kiểm tra email đã tồn tại chưa
        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ status: 'Error', message: 'Email này đã được sử dụng' });
        }

        // 4. Xác định role hợp lệ (mặc định là 'user')
        const validRole = role === 'admin' ? 'admin' : 'user';

        // 5. Mã hóa mật khẩu với bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 6. Lưu vào bảng users
        const [userResult] = await db.query(
            'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, name, validRole]
        );
        const userId = userResult.insertId;

        res.status(201).json({
            status: 'Success',
            message: 'Tạo tài khoản thành công',
            data: { userId, email, name, role: validRole }
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ status: 'Error', message: 'Lỗi server, không thể tạo tài khoản' });
    }
};

// Hàm Đăng nhập
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: 'Error', message: 'Vui lòng cung cấp email và password' });
        }

        // 1. Tìm user theo email trực tiếp từ bảng users
        const [users] = await db.query(`SELECT id, email, password_hash, name, role FROM users WHERE email = ?`, [email]);

        if (users.length === 0) {
            return res.status(401).json({ status: 'Error', message: 'Tài khoản hoặc mật khẩu không đúng' });
        }

        const user = users[0];

        // 2. So sánh mật khẩu bằng bcrypt
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ status: 'Error', message: 'Tài khoản hoặc mật khẩu không đúng' });
        }

        // 3. Tạo JWT Token bảo mật
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'learnup_fallback_secret_key', { expiresIn: '7d' });

        res.status(200).json({
            status: 'Success',
            message: 'Đăng nhập thành công',
            token: token,
            user: payload
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ status: 'Error', message: 'Lỗi server, không thể đăng nhập' });
    }
};

// Hàm Quên Mật Khẩu
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ status: 'Error', message: 'Vui lòng cung cấp email' });
        }

        // 1. Kiểm tra User
        const [users] = await db.query('SELECT id, name, email FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'Email không tồn tại trong hệ thống' });
        }
        const user = users[0];

        // 2. Tạo mật khẩu mới ngẫu nhiên (8 ký tự)
        const newPassword = Math.random().toString(36).slice(-8);

        // 3. Hash và lưu vào Database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, user.id]);

        // 4. Cấu hình gửi mail (Hỗ trợ Ethereal test giả lập)
        let transporter;
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });
        } else {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: { user: testAccount.user, pass: testAccount.pass }
            });
            console.log('--- ETHEREAL TEST ACCOUNT ---');
            console.log('User:', testAccount.user);
        }

        // 5. Nội dung Email
        const mailOptions = {
            from: '"LearnUp Support" <no-reply@learnup.edu.vn>',
            to: user.email,
            subject: 'Xác nhận Đặt lại Mật khẩu - LearnUp',
            html: `
                <h3>Xin chào ${user.name},</h3>
                <p>Bạn đã yêu cầu đặt lại mật khẩu thành công.</p>
                <p>Mật khẩu mới của bạn là: <strong style="color: blue; font-size: 18px;">${newPassword}</strong></p>
                <p>Vui lòng đăng nhập và tiến hành đổi lại mật khẩu để đảm bảo an toàn.</p>
            `
        };

        // 6. Gửi mail
        const info = await transporter.sendMail(mailOptions);

        let previewUrl = '';
        if (!process.env.EMAIL_USER) {
            previewUrl = nodemailer.getTestMessageUrl(info);
            console.log("Xem email giả lập tại:", previewUrl);
        }

        res.status(200).json({
            status: 'Success',
            message: process.env.EMAIL_USER ? 'Mật khẩu mới đã được gửi vào email của bạn!' : 'Đã gửi email khôi phục!',
            previewUrl: previewUrl // Trả về để Frontend có thể show link test nếu đang dev
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ status: 'Error', message: 'Lỗi server, không thể thiết lập lại mật khẩu' });
    }
};