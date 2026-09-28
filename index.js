const express = require('express');
const dateET = require('./src/dateTimeET');
const app = express();
const fs = require('fs').promises;
const textRef = 'public/txt/vanasonad.txt';
const regTextRef = 'public/txt/regvisit.txt';
const bodyparser = require ('body-parser');
//mallide renderdamise mootor
app.set('view engine', 'ejs');
//määran ühe päris kataloogi virtuaalses serveris kättesaadavaks
app.use(express.static('public'));


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

app.get('/recvisit', (req, res)=>{
	res.render('recvisit');
});
app.post('/recvisit', async (req, res)=>{
	try {
		await fs.open(regTextRef, 'a')
		await fs.appendFile(regTextRef, req.body.nameInput + ';');
		res.render('recvisit');
	}
	catch (err) {
		console.log(err);
		res.render('recvisit');
	}
});
app.listen(5107);