const express = require('express');
const router = express.Router();
const{
    eestifilm,
    inimesed,
    inimesedAdd,
    inimesedAddPost,
    filmid,
    filmidAdd,
    filmidAddPost,
    ametid,
    ametidAdd,
    ametidAddPost,
    genreAdd,
    personInMovie
} = require('../controllers/eestifilmControllers');

router.route('/').get(eestifilm);

router.route('/inimesed').get(inimesed);

router.route('/inimesed_add').get(inimesedAdd);

router.route('/inimesed_add').post(inimesedAddPost);

router.route('/filmid').get(filmid);

router.route('/filmid_add').get(filmidAdd);

router.route('/filmid_add').post(filmidAddPost);

router.route('/ametid').get(ametid);

router.route('/ametid_add').get(ametidAdd);

router.route('/ametid_add').post(ametidAddPost);

router.route('/genreAdd').get(genreAdd);

router.route('/genreAdd').post(genreAdd);

router.route('/personInMovie').get(personInMovie);

module.exports = router;