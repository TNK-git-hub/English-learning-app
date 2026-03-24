const pool = require('../config/db');

// Lấy danh sách tất cả tags
exports.getAllTags = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tags ORDER BY name ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tạo tag mới (Admin)
exports.createTag = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Tên tag là bắt buộc' });

        const [result] = await pool.query('INSERT INTO tags (name) VALUES (?)', [name]);
        res.status(201).json({ success: true, message: 'Tạo tag thành công!', data: { id: result.insertId, name } });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Tag đã tồn tại' });
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa tag (Admin)
exports.deleteTag = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM tags WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Tag không tồn tại' });
        res.json({ success: true, message: 'Xóa tag thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};