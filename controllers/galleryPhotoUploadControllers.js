
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const sharp = require('sharp');

const watermarkFile = process.env.UPLOAD_WATERMARK_PATH || './public/pic/vp_logo_small.png';

//@desc home page for uploading gallery photos
//@route GET /galleryPhotoUpload
//@access private

const galleryPhotoUpload = (req, res) => {
    res.render('galleryPhotoUpload');
};

//@desc upload a gallery photo
//@route POST /galleryPhotoUpload
//@access private

const galleryPhotoUploadPost = async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    let conn;
    try {
        //gen oma faili nimi
        const fileName = 'vp_' + Date.now() + '.jpg';
        await fs.rename(req.file.path, req.file.destination + fileName);

        //kontrollin, kas vesimärgi fail on olemas
        const watermarkSettings = [{
            input: watermarkFile,
            gravity: 'southeast'
        }];
        if (!await fs.access(watermarkFile).then(() => true).catch(() => false)) {
            //vesimärki ei leitud, tühjendame seaded, et seda ei proovitaks lisada
            watermarkSettings.length = 0;
        }

        //pildi suuruse muutmine (max 800 X 600)
        let normalImageProcessor = sharp(req.file.destination + fileName).resize(800, 600).jpeg({quality: 90});
        //lisan vesimärgi
        if (watermarkSettings.length > 0) {
            normalImageProcessor = normalImageProcessor.composite(watermarkSettings);
        }
        await normalImageProcessor.toFile(process.env.UPLOAD_RESIZED_PATH + fileName);

        //teeme pisipildi (100 X 100)
        await sharp(req.file.destination + fileName).resize(100, 100).jpeg({quality: 90}).toFile('./public/gallery/thumbs/' + fileName);

        //const userId = 1;//AJUTINE
        const userId = req.session.userId;
        let sqlReq = 'INSERT INTO galleryphotos (filename, origname, alttext, privacy, userid) VALUES (?,?,?,?,?)';

        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        const [result] = await conn.execute(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userId]);
        console.log('Salvestati kirje id: ' + result.insertId);

        res.redirect('/galleryPhotoUpload');
    }
    catch (err) {
        console.log('Viga: ' + err);
        res.render('galleryPhotoUpload');
    }
    finally {
        if (conn) {
            await conn.end();
        }
    }
};

//@desc show the last public photo on the upload page
//@route GET /galleryPhotoUpload (last photo)
//@access private

const galleryLastPhotoGet = async (req, res) => {
    let conn;
    try {
        let sqlReq = 'SELECT filename, alttext FROM galleryphotos WHERE id=(SELECT MAX(id) FROM galleryphotos WHERE privacy=? AND deleted IS NULL)';
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        const [result] = await conn.execute(sqlReq, [3]);
        console.log(result);
        const photo = result[0] || { filename: null, alttext: null };
        res.render('galleryPhotoUpload', photo);
    }
    catch (err) {
        console.log('Viga ', err);
        res.render('galleryPhotoUpload', { filename: null, alttext: null });
    }
    finally {
        if (conn) {
            await conn.end();
        }
    }
};

//@desc Photogallery
//@route GET /gallery
//@access private

const privacyLabels = {
    1: 'Privaatne',
    2: 'Sisseloginud kasutajatele',
    3: 'Avalik'
};

const galleryPhotosView = async (req, res) => {
    let conn;
    try {
        const userId = req.session.userId;

        // public photos for everyone, logged-in photos for any logged-in user,
        // private photos only for their owner
        const sqlReq = `
            SELECT id, filename, alttext, privacy, userid
            FROM galleryphotos
            WHERE deleted IS NULL
              AND (privacy = 3
                   OR (privacy = 2 AND ? IS NOT NULL)
                   OR (privacy = 1 AND userid = ?))
            ORDER BY id DESC`;

        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        // mysql2 throws on undefined, so use null when not logged in
        const uid = userId ?? null;
        const [result] = await conn.execute(sqlReq, [uid, uid]);

        const galleryData = result.map(photo => ({
            id: photo.id,
            src: photo.filename,
            alt: photo.alttext || 'Galeriipilt',
            privacy: photo.privacy,
            privacyText: privacyLabels[photo.privacy] || 'Teadmata',
            isOwner: photo.userid === userId
        }));

        res.render('galleryPhotos', {
            photos: result,
            galleryData: galleryData,
            imagehref: process.env.GALLERY_THUMBNAIL
        });
    }
    catch (err) {
        console.log('Viga', err);
        res.render('galleryPhotos', {photos: [], galleryData: [], imagehref: process.env.GALLERY_THUMBNAIL});
    }
    finally {
        if (conn) {
            await conn.end();
        }
    }
};

module.exports = {
    galleryPhotoUpload,
    galleryPhotoUploadPost,
    galleryLastPhotoGet,
    galleryPhotosView
}
