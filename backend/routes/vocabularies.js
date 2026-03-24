const express = require('express');
const router = express.Router();
const ctrl = require('../controller/vocabularyController');

router.get('/user/:userId', ctrl.getUserVocabularies);
router.post('/', ctrl.addVocabulary);
router.delete('/:id', ctrl.deleteVocabulary);

module.exports = router;