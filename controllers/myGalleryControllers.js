const mysql = require('mysql2/promise');

const privacyLabels = {
    1: 'Privaatne',
    2: 'Sisseloginud kasutajatele',
    3: 'Avalik'
};
const myGalleryHome = (req, res) => {
    res.redirect('/myGallery/1');

}
const myGalleryView = async (req, res) => {
    let conn;
    let page = parseInt(req.params.page);
    const limit = 5;
    let skip = 5;
    if(page < 1 || isNaN(page)){
        page = 1;

    }

    try {
        const userId = req.session.userId;
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        //uurime palju sobivaid fotosid on
        const privacy = 1;
        let sqlReq = 'SELECT count(id) AS photos FROM galleryphotos WHERE userid = ? AND deleted IS NULL';
        const [countRows] = await conn.execute(sqlReq, [userId]);
        const photoCount = countRows[0].photos;

        if((page - 1) * limit >= photoCount){
            page = Math.max(1, Math.ceil(photoCount / limit));
        }
        skip = (page-1) * limit;

        let galleryLinks
        if(page === 1){
            galleryLinks = 'Eelmine leht &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;'
        } else {
            galleryLinks = `<a href="/myGallery/${page - 1}">Eelmine leht</a> &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;`
        }
        if(page * limit >= photoCount){
            galleryLinks += 'Järgmine leht'
        }
        else {
            galleryLinks += `<a href="/myGallery/${page + 1}">Järgmine Leht</a>`;
        }
        

        // public photos for everyone, logged-in photos for any logged-in user,
        // private photos only for their owner
        
        sqlReq  = 'SELECT id, filename, alttext, privacy, userid FROM galleryphotos WHERE userid = ? AND deleted IS NULL ORDER BY id DESC LIMIT ?,?';



        // mysql2 throws on undefined, so use null when not logged in
        const uid = userId ?? null;
        const [photoRows] = await conn.execute(sqlReq, [userId, skip, limit]);

        const galleryData = photoRows.map(photo => ({
            id: photo.id,
            src: photo.filename,
            alt: photo.alttext || 'Galeriipilt',
            privacy: photo.privacy,
            privacyText: privacyLabels[photo.privacy] || 'Teadmata',
            isOwner: photo.userid === userId
        }));

        res.render('myGallery', {
            photos: photoRows,
            galleryData: galleryData,
            imagehref: process.env.GALLERY_THUMBNAIL,
            galleryLinks
        });
    }
    catch (err) {
        console.log('Viga', err);
        let galleryLinks = 'Eelmine Leht &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; Järgmine Leht '
        res.render('myGallery', {photos: [], galleryData: [], imagehref: process.env.GALLERY_THUMBNAIL, galleryLinks});

    }
    finally {
        if (conn) {
            await conn.end();
        }
    }
};
module.exports = {
    myGalleryHome,
    myGalleryView
}
