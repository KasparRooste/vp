const express = require('express');

const session = require('express-session');
const checkLogin = require('./src/checkLogin');
const dateET = require('./src/dateTimeET');
const app = express();
const fs = require('fs').promises;
const textRef = 'public/txt/vanasonad.txt';
const regTextRef = 'public/txt/regvisit.txt';
const bodyparser = require ('body-parser');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();

const mysql = require('mysql2/promise');
//mallide renderdamise mootor
app.set('view engine', 'ejs');
//määran ühe päris kataloogi virtuaalses serveris kättesaadavaks
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended: true}));//kui vomides ainult text siis false
const sessionStore = new MySQLStore({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME
});
app.use(session({
	secret: process.env.SES_SECRET ,
	store: sessionStore,
	saveUninitialized : false,
	resave : false,
	cookie: {
		maxAge: 1000 * 60 * 60 * 1 //sessiooni küpsiste aegumisaeg
	}
}));
/*app.use(session({
	secret: process.env.SES_SECRET ,
	saveUninitialized : false,
	resave : false
}));*/

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

//eesti filmi marsruudid

app.get('/home', checkLogin.isLogin, (req, res)=>{
		const timeNow = dateET.timeFormattedET();
		const loginUserFirstName = req.session.userFirstName;
		const loginUserLastName = req.session.userLastName;
		res.render('home', {loginUserFirstName, loginUserLastName, timeNow});
		
	});
app.get('/logout', (req, res)=>{
	res.redirect('/');
});

const { galleryPhotosView } = require('./controllers/galleryPhotoUploadControllers');
app.get('/galleryPhotos', checkLogin.isLogin, galleryPhotosView);

const eestifilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestifilmRouter)

const signupRouter = require('./routes/signupRoutes');  
app.use('/signup', signupRouter);

const signinRouter = require('./routes/signinRoutes');   
app.use('/signin', signinRouter);

const galleryPhotoUploadRouter = require('./routes/galleryPhotoUploadRoutes');
app.use('/galleryPhotoUpload', galleryPhotoUploadRouter );

app.listen(5107);