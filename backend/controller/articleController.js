const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Lấy danh sách bài viết (Kèm mảng tags)
exports.getAllArticles = async (req, res) => {
    try {
        const [articles] = await pool.query(`
            SELECT a.id, a.title, a.content, a.image_url, a.created_at, 
                   GROUP_CONCAT(t.name) AS tags
            FROM articles a
            LEFT JOIN article_tags at2 ON a.id = at2.article_id
            LEFT JOIN tags t ON at2.tag_id = t.id
            GROUP BY a.id ORDER BY a.created_at DESC
        `);

        // Xử lý chuỗi tags thành mảng
        const result = articles.map(a => ({
            ...a,
            tags: a.tags ? a.tags.split(',') : []
        }));
        res.json({ success: true, data: result, total: result.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tạo bài viết mới & Gắn Tags (Dùng Transaction)
exports.createArticle = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { title, content, image_url, tag_ids } = req.body;

        if (!title) return res.status(400).json({ success: false, message: 'Tiêu đề là bắt buộc' });

        const id = uuidv4(); // Dùng UUID theo Schema
        await conn.query(
            'INSERT INTO articles (id, title, content, image_url) VALUES (?, ?, ?, ?)',
            [id, title, content || '', image_url || null]
        );

        // Lưu vào bảng trung gian article_tags nếu có gửi tag_ids = [1, 2]
        if (tag_ids && Array.isArray(tag_ids) && tag_ids.length > 0) {
            const tagValues = tag_ids.map(tid => [id, tid]);
            await conn.query('INSERT INTO article_tags (article_id, tag_id) VALUES ?', [tagValues]);
        }

        await conn.commit();
        res.status(201).json({ success: true, message: 'Tạo bài viết thành công!', data: { id, title } });
    } catch (error) {
        await conn.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        conn.release();
    }
};

// Xóa bài viết (Các tags liên kết sẽ tự xóa nhờ ON DELETE CASCADE trong DB)
exports.deleteArticle = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM articles WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
        res.json({ success: true, message: 'Xóa bài viết thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};