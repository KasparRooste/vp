const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkLogin = require('../src/checkLogin')
router.use(checkLogin.isLogin);
//if sõidueksam = passed:
    //print("Yippie!")
//else
    //delete.drive(C:)
const upload = multer({dest: process.env.UPLOAD_ORIGINAL_PATH});

const{
    galleryPhotoUpload,
    galleryPhotoUploadPost,
    galleryLastPhotoGet,
    galleryPhotosView,

} = require('../controllers/galleryPhotoUploadControllers');
router.route('/').get(galleryLastPhotoGet);

router.route('/').post(upload.single('photoInput'), galleryPhotoUploadPost);
router.route('/').get(galleryPhotoUpload);
router.route('/galleryPhotos').get(galleryPhotosView);


module.exports = router;