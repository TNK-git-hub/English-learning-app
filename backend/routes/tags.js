const express = require('express');
const router = express.Router();
const ctrl = require('../controller/tagController');

router.get('/', ctrl.getAllTags);
router.post('/', ctrl.createTag);
router.delete('/:id', ctrl.deleteTag);

module.exports = router;