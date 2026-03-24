const pool = require('../config/db');

// Lấy danh sách câu hỏi để làm bài (Giấu đáp án đúng)
exports.getQuestions = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM quiz_questions ORDER BY RAND() LIMIT 10');

        // Trộn ngẫu nhiên 4 đáp án và không gửi correct_answer về Frontend để chống gian lận
        const questions = rows.map(q => {
            const options = [q.correct_answer, q.wrong1, q.wrong2, q.wrong3].sort(() => Math.random() - 0.5);
            return { id: q.id, question: q.question, options };
        });

        res.json({ success: true, data: questions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Nộp bài & Chấm điểm (Transaction)
exports.submitQuiz = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { user_id, answers } = req.body;
        // answers có dạng: [{ question_id: 1, selected_answer: "Dog" }]

        if (!user_id || !answers || !answers.length) {
            return res.status(400).json({ success: false, message: 'Thiếu dữ liệu nộp bài' });
        }

        // 1. Lấy đáp án đúng từ DB để đối chiếu
        const questionIds = answers.map(a => a.question_id);
        const [questions] = await conn.query('SELECT id, correct_answer FROM quiz_questions WHERE id IN (?)', [questionIds]);

        const correctMap = {};
        questions.forEach(q => correctMap[q.id] = q.correct_answer);

        // 2. Chấm điểm
        let correct_answers = 0;
        const detailRows = answers.map(a => {
            const isCorrect = correctMap[a.question_id] === a.selected_answer ? 1 : 0;
            if (isCorrect) correct_answers++;
            return { qId: a.question_id, ans: a.selected_answer, isCorrect };
        });

        // 3. Lưu lịch sử lượt làm bài (quiz_attempts)
        const [attemptResult] = await conn.query(
            'INSERT INTO quiz_attempts (user_id, total_questions, correct_answers, started_at, ended_at) VALUES (?, ?, ?, NOW(), NOW())',
            [user_id, answers.length, correct_answers]
        );
        const attempt_id = attemptResult.insertId;

        // 4. Lưu chi tiết từng câu (quiz_attempt_questions)
        const detailValues = detailRows.map(r => [attempt_id, r.qId, r.ans, r.isCorrect]);
        await conn.query('INSERT INTO quiz_attempt_questions (attempt_id, question_id, selected_answer, is_correct) VALUES ?', [detailValues]);

        await conn.commit();
        res.json({ success: true, message: 'Nộp bài thành công!', data: { correct_answers, total: answers.length } });
    } catch (error) {
        await conn.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        conn.release();
    }
};

// Xem lịch sử thi của User
exports.getHistory = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM quiz_attempts WHERE user_id = ? ORDER BY ended_at DESC', [req.params.user_id]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};