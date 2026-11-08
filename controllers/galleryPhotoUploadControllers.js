const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const sharp = require('sharp');
const galleryPhotoUpload = (req, res) => {
    res.render('galleryPhotoUpload')
};

const galleryPhotoUploadPost = async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    let conn;
    try{
        //gen oma faili nimi
        const fileName = 'vp_' + Date.now() + '.jpg';
        await fs.rename(req.file.path, req.file.destination + fileName);
        await sharp(req.file.destination + fileName).resize(800, 600).composite([ { input: process.env.UPLOAD_WATERMARK_PATH, gravity: 'southeast' } ]).jpeg({quality: 90}).toFile(process.env.UPLOAD_RESIZED_PATH + fileName);
        //teeme pisipildi
        await sharp(req.file.destination + fileName).resize(100, 100).jpeg({quality: 90}).toFile('./public/gallery/thumbs/' + fileName);
        const userid = 1;//AJUTINE
        let sqlReq = 'INSERT INTO galleryphotos (filename, origname, alttext, privacy, userid) VALUES (?,?,?,?,?)'

        conn = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME
            });
        const [result] = await conn.execute(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userid]);
        console.log('Salavestati kirje id: ' + result.inesertId);

        res.redirect('/galleryPhotoUpload');




    }
    catch (err){
        console.log('Viga' + err);
        res.render('galleryPhotoUpload');
    }

finally {
            if(conn) {
                await conn.end();
            }
        }
};
const galleryLastPhotoGet = async (req, res) => {
    let conn;

    try {
        let sqlReq = 'SELECT filename, alttext FROM galleryphotos WHERE id=(SELECT MAX(id) FROM galleryphotos WHERE privacy=? AND deleted IS NULL)'
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
    catch (err){
        console.log('Viga ' , err);
        res.render('galleryPhotoUpload', { filename: null, alttext: null });
    }

    finally {
        if(conn) {
            await conn.end();
        }
    }
};
const galleryPhotosView = async (req, res) => {
    let conn;
    console.log('handler started');
    try {
        let sqlReq = 'SELECT filename, alttext FROM galleryphotos WHERE (privacy >= 2 AND deleted IS NULL) ORDER BY id DESC'
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        const [result] = await conn.execute(sqlReq);
        console.log(result);

        res.render('galleryPhotos', {photos: result});
    }
    catch (err) {
        console.log('Viga', err);
        res.render('galleryPhotos', {photos: result});
    }
    finally {
        if(conn) {
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