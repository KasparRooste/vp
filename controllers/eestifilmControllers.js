const mysql = require('mysql2/promise');
//@desc homme page for estonian movie section
//@route GET /eestifilm
//@access public


//app.get('/eestifilm', (req,res=>){
    const eestifilm = (req, res)=> {
        res.render('eestifilm');
};


//page for list of people involved 
//route get /eestifilm/inimesed
const inimesed = async (req,res)=>{
  //  console.log('Andmebaasi server on: ' + process.env.DB_HOST);
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        const sqlReq = 'SELECT * FROM person ORDER by last_name';
        const [sqlRes] = await conn.execute(sqlReq);
        console.log(sqlRes);
        res.render('eestifilminimesed', {personList: sqlRes});
    }
    catch (err){
        console.log('Viga andmebaasist lugemisel:' + err);
        res.render('eestifilminimesed', {personList: []})
    }
    finally {
        if(conn) {
            await conn.end();
        }
    }

};

//kirjeldus

const inimesedAdd = (req, res) => {

    res.render('eestifilminimesed_add', {
        notice: 'Ootan sisestust!',
        firstNameInput: null,
        lastNameInput: null,
        bornInput: null,
        deceasedInput: null
    });
};


//kirjeldus

const inimesedAddPost = async (req, res) => {
    const { firstNameInput, lastNameInput, bornInput, deceasedInput } = req.body;

    // Praegune aeg ja sisestatud sünnikuupäev
    const now = new Date();
    const bornDate = new Date(bornInput);

    // Abifunktsioon vormi uuesti kuvamiseks
    const showForm = (notice, clear = false) => {
        res.render('eestifilminimesed_add', {
            notice: notice,
            firstNameInput: clear ? null : firstNameInput,
            lastNameInput: clear ? null : lastNameInput,
            bornInput: clear ? null : bornInput,
            deceasedInput: clear ? null : deceasedInput
        });
    };

    // Kohustuslike väljade kontroll
    if (
        !firstNameInput?.trim() ||
        !lastNameInput?.trim() ||
        !bornInput
    ) {
        return showForm('Täida eesnimi, perekonnanimi ja sünnikuupäev!');
    }

    // Sünnikuupäeva kontroll
    if (isNaN(bornDate.getTime()) || bornDate > now) {
        return showForm('Sünnikuupäev on vigane või tulevikus!');
    }

    // Surmakuupäeva kontroll, kui see on sisestatud
    if (deceasedInput != '') {
        const deceasedDate = new Date(deceasedInput);

        if (
            isNaN(deceasedDate.getTime()) ||
            deceasedDate > now ||
            deceasedDate < bornDate
        ) {
            return showForm('Surmakuupäev on vigane!');
        }
    }

    let conn;

    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        const sqlReq = `
            INSERT INTO person
            (first_name, last_name, born, deceased)
            VALUES (?, ?, ?, ?)
        `;

        await conn.execute(sqlReq, [
            firstNameInput.trim(),
            lastNameInput.trim(),
            bornInput,
            deceasedInput || null
        ]);

        // Eduka salvestamise järel tühjendame vormi
        showForm('Andmed salvestati! Ootan uut sisestust!', true);

    } catch (err) {
        console.log('Viga andmebaasiga suhtlemisel: ' + err);
        showForm('Tekkis viga, andmeid ei salvestatud!');
    } finally {
        if (conn) {
            await conn.end();
        }
    }
};


const filmid = async (req, res) => {
	console.log('Andmebaasi server on: ' + process.env.DB_HOST);
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const sqlReq = 'SELECT * FROM movie ORDER by release_year';
		const [sqlRes] = await conn.execute(sqlReq);
		console.log(sqlRes);
		res.render('eestifilmid', {movieList: sqlRes});
	}
	catch (err){
		console.log('Viga andmebaasist lugemisel:' + err);
		res.render('eestifilmid', {movieList: []})
	}
	finally {
		if(conn) {
			await conn.end();
		}
	}

};


const filmidAdd = (req, res) => {

    res.render('eestifilmid_add', {
        notice: 'Ootan sisestust!',
        movieNameInput: null,
        descriptionInput: null,
        releaseYearInput: null,
        durationInput: null
    });
};



const filmidAddPost = async (req, res) => {
    const { movieNameInput, descriptionInput, releaseYearInput, durationInput } = req.body;



    // Abifunktsioon vormi uuesti kuvamiseks
    const showForm = (notice, clear = false) => {
        res.render('eestifilmid_add', {
            notice: notice,
            movieNameInput: clear ? null : movieNameInput,
            descriptionInput: clear ? null : descriptionInput,
            releaseYearInput: clear ? null : releaseYearInput,
            durationInput: clear ? null : durationInput
        });
    };
    if (
        !movieNameInput?.trim() ||
        !descriptionInput?.trim() ||
        !releaseYearInput ||
        !durationInput
    ) {
        return showForm('Täida nimi, kirjeldus, aasta ja pikkus!');
    }
    let conn;

    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        const sqlReq = `
            INSERT INTO movie
            (title, description, release_year, duration_minutes)
            VALUES (?, ?, ?, ?)
        `;

        await conn.execute(sqlReq, [
            movieNameInput.trim(),
            descriptionInput.trim(),
            releaseYearInput,
            durationInput
        ]);

        // Eduka salvestamise järel tühjendame vormi
        showForm('Andmed salvestati! Ootan uut sisestust!', true);

    } catch (err) {
        console.log('Viga andmebaasiga suhtlemisel: ' + err);
        showForm('Tekkis viga, andmeid ei salvestatud!');
    } finally {
        if (conn) {
            await conn.end();
        }
    }

};



const ametid = async (req, res)=>{
    console.log('Andmebaasi server on: ' + process.env.DB_HOST);
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        const sqlReq = 'SELECT * FROM profession ORDER by id';
        const [sqlRes] = await conn.execute(sqlReq);
        console.log(sqlRes);
        res.render('ametid', {professionList: sqlRes});
    }
    catch (err){
        console.log('Viga andmebaasist lugemisel:' + err);
        res.render('ametid', {professionList: []})
    }
    finally {
        if(conn) {
            await conn.end();
        }
    }

};

const ametidAdd = (req, res)=>{

    res.render('ametid_add', {
        notice: 'Ootan sisestust!',
        title: null,
        description: null,

    });
};

const ametidAddPost = async (req, res) => {
    const { title, description} = req.body;



    // Abifunktsioon vormi uuesti kuvamiseks
    const showForm = (notice, clear = false) => {
        res.render('ametid_add', {
            notice: notice,
            title: clear ? null : title,
            description: clear ? null : description

        });
    };
    if (
        !title?.trim() ||
        !description?.trim()

    ) {
        return showForm('Täida nimi ja kirjeldus!');
    }
    let conn;

    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        const sqlReq = `
            INSERT INTO profession
            (title, description)
            VALUES (?, ?)
        `;

        await conn.execute(sqlReq, [
            title.trim(),
            description.trim()
        ]);

        // Eduka salvestamise järel tühjendame vormi
        showForm('Andmed salvestati! Ootan uut sisestust!', true);

    } catch (err) {
        console.log('Viga andmebaasiga suhtlemisel: ' + err);
        showForm('Tekkis viga, andmeid ei salvestatud!');
    } finally {
        if (conn) {
            await conn.end();
        }
    }

};


//genres


const genreAdd = (req, res)=>{
    res.render('genreAdd', {notice: 'ootan sisestust', genreName: null, description: null});
};

const genreAddPost = async (req, res)=>{
    if(!req.body.genreNameInput){
        return res.render('genreAdd', {notice: 'Å¾anri nimi puudub', genreName: req.body.genreNameInput, description: req.body.descriptionInput});
    }
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });
        let sqlReq = 'INSERT INTO genre (name, description) VALUES (?,?)';
        await conn.execute(sqlReq, [req.body.genreNameInput, req.body.descriptionInput || null]);
        res.render('genreAdd', {notice: 'andmed salvestati', genreName: null, description: null});
    }
    catch (err){
        console.log('viga andmebaasiga suhtlemisel: ' + err);
        res.render('genreAdd', {notice: 'andmebaasi suhtlus nurjus', genreName: req.body.genreNameInput, description: req.body.descriptionInput});
    }
    finally {
        if(conn){
            await conn.end();
        }
    }
};













const personInMovie = async (req, res) => {
    let conn;

    try {
        // 1. Connect to MySQL
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        // 2. Get people
        const personSql = `
            SELECT id, first_name, last_name
            FROM person
            ORDER BY last_name
        `;

        const [personList] = await conn.execute(personSql);

        // 3. Get movies
        const movieSql = `
            SELECT id, title
            FROM movie
            ORDER BY title
        `;

        const [movieList] = await conn.execute(movieSql);


        //get profession
        const professionSql = 'SELECT id, title FROM profession ORDER BY id';
        const [professionList] = await conn.execute(professionSql);

        // 4. Render the page once with both lists
        res.render('person_in_movie', {
            personList: personList,
            movieList: movieList,
            professionList: professionList,
            notice: 'Vali inimene ja film.'
        });


    } catch (err) {
        console.error('Viga andmebaasiga suhtlemisel:', err);
        res.status(500).send('Andmebaasi päring ebaõnnestus.');

    } finally {
        if (conn) {
            await conn.end();
        }
    }
};
const personInMoviePost = async (req, res) => {
    const {movieInput} = req.body;
    const {personInput} = req.body;
    const {roleInput} = req.body;
    const {professionInput} = req.body;
    let conn;

    try {
        // 1. Connect to MySQL
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        let sqlReq = 'INSERT INTO person_in_movie (character_name, person_id, movie_id, profession_id) VALUES (?,?,?,?)';
        await conn.execute(sqlReq, [roleInput,personInput,movieInput,professionInput || null]);
        res.redirect('/eestifilm/personInMovie');

        }
        catch (err) {
            console.error('Viga andmebaasiga suhtlemisel:', err);
            res.status(500).send('Andmebaasi päring ebaõnnestus.');
        }
    finally {
        if (conn) {
            await conn.end();
        }
    }
};
module.exports = {
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
    genreAddPost,
    personInMovie,
    personInMoviePost
}