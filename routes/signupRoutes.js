const express = require('express');
const router = express.Router();

const {
    signupPage,
    signupPagePost
} = require('../controllers/signupPageControllers');

router.route('/').get(signupPage);
router.route('/').post(signupPagePost);

module.exports = router;