const express = require('express');
const router = express.Router();
const ctrl = require('../controller/quizController');

router.get('/questions', ctrl.getQuestions);
router.post('/submit', ctrl.submitQuiz);
router.get('/history/:user_id', ctrl.getHistory);

module.exports = router;