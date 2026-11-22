const express = require('express');
const router = express.Router();

const {
    signinPage,
    signinPagePost
} = require('../controllers/signinPageControllers');

router.route('/').get(signinPage);
router.route('/').post(signinPagePost);

module.exports = router;