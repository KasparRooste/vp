const express = require('express');

const dateET = require('./src/dateTimeET');
const app = express();
const fs = require('fs').promises;
const textRef = 'public/txt/vanasonad.txt';
const regTextRef = 'public/txt/regvisit.txt';
const bodyparser = require ('body-parser');

require('dotenv').config();

const mysql = require('mysql2/promise');
//mallide renderdamise mootor
app.set('view engine', 'ejs');
//määran ühe päris kataloogi virtuaalses serveris kättesaadavaks
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended: false}));



//marsruudid
app.get('/', (req, res)=>{
	//res.send('Express.js läks käima ja serveerib meile veebi.');
	const dayNow = dateET.weekdayET();
	const dateNow = dateET.dateFormattedET(1);
	const timeNow = dateET.timeFormattedET();
	res.render('index', {dayNow: dayNow, dateNow: dateNow,timeNow: timeNow});
});

app.get('/vanasona', async (req, res)=>{
	try {
		const data = await fs.readFile(textRef, "utf8");
		let folkWisdom = data.split(";");
		res.render('vanasona', {wisdom: folkWisdom[Math.round(Math.random() * (
		folkWisdom.length - 1))]});
	}
	catch (err) {
		res.render('vanasona', {wisdom: 'Ei leidnud ühtegi vanasõna!'});
	}
});
app.get('/pohjus', (req,res)=>{
	res.render('pohjus')
})

app.get('/recvisit', (req, res)=>{
	res.render('recvisit');
});
app.post('/recvisit', async (req, res)=>{
	try {
		const dateNow = dateET.dateFormattedET(0);
		const timeNow = dateET.timeFormattedET();

		await fs.open(regTextRef, 'a')
		await fs.appendFile(regTextRef, req.body.nameInput + ',' + dateNow + ',' +  timeNow +';');
		res.render('recvisit');
	}
	catch (err) {
		console.log(err);
		res.render('recvisit');
	}
});
app.get('/lastvisit', async (req, res)=>{
	try {
		const lastVisit = await fs.readFile(regTextRef, "utf8");
		let displayVisit = lastVisit.split(";");
		res.render('lastvisit', {
			visit:
				displayVisit[displayVisit.length - 2].split(",")
		});
	}
	catch (err) {
		res.render('lastvisit', {visit: 'Ei ole külastusi!'});
	}
});
app.get('/eestifilm', (req, res)=>{
	try {
		res.render('eestifilm');
	}
	catch (err) {
		res.render('eestifilm', {film: 'ei leidnud'});
	}
});
app.get('/eestifilm/inimesed', async (req, res)=>{
	console.log('Andmebaasi server on: ' + process.env.DB_HOST);
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
	
});
app.get('/eestifilm/inimesed_add', (req, res)=>{
	
		res.render('eestifilminimesed_add', {
			notice: 'Ootan sisestust!',
			firstNameInput: null,
			lastNameInput: null,
			bornInput: null,
			deceasedInput: null
	});
});

app.post('/eestifilm/inimesed_add', async (req, res) => {
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
});




//Filmid


app.get('/eestifilm/filmid', async (req, res)=>{
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

});


app.get('/eestifilm/eestifilmid_add', (req, res)=>{

	res.render('eestifilmid_add', {
		notice: 'Ootan sisestust!',
		movieNameInput: null,
		descriptionInput: null,
		releaseYearInput: null,
		durationInput: null
	});
});

app.post('/eestifilm/eestifilmid_add', async (req, res) => {
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

});




//------------------------------------------------------------------------------------


app.get('/eestifilm/ametid', async (req, res)=>{
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

});


app.get('/eestifilm/ametid_add', (req, res)=>{

	res.render('ametid_add', {
		notice: 'Ootan sisestust!',
		title: null,
		description: null,

	});
});

app.post('/eestifilm/ametid_add', async (req, res) => {
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

});


app.listen(5107);