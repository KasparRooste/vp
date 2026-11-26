const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkLogin = require('../src/checkLogin')
const upload = multer({dest: process.env.UPLOAD_ORIGINAL_PATH});
router.use(checkLogin.isLogin);

const {
    myGalleryView,
    myGalleryHome
} = require('../controllers/myGalleryControllers')

router.route('/').get(myGalleryView);
router.route('/').get(myGalleryHome);
router.route('/:page').get(myGalleryView);

module.exports = router;