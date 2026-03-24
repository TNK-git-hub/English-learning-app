const express = require('express');
const router = express.Router();
const ctrl = require('../controller/articleController');

router.get('/', ctrl.getAllArticles);
router.post('/', ctrl.createArticle);
router.delete('/:id', ctrl.deleteArticle);

module.exports = router;