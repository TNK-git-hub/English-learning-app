const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');


router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/forgot-password', ctrl.forgotPassword);

module.exports = router;