const mysql = require('mysql2/promise');

const argon = require('argon2');
//page for logging in
const signinPage = (req, res) => {
    res.render('signin', {notice: 'Ootan andmeid!'});
};
const signinPagePost = async (req, res) => {
    let conn;
    let notice = '';
    //puhastame andmeid ja valideerime

    const email = req.body.emailInput.trim();

    if(!email || !req.body.passwordInput){
        notice = 'sisest andmed!';
        return res.render('signup', {notice: notice});
    }


    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        let sqlReq = 'SELECT id, firstname, lastname, password FROM users WHERE email = ?';
        const [users] = await conn.execute(sqlReq, [email]);
        if (users.length === 0) {
            notice = 'Sisestatud kasutajatunnus ja/ või parool oli vale!'
            return res.render('signup', {notice: notice});
        }
        //kui on olemas kas parool klappib
        const match = await argon.verify(users[0].password, req.body.passwordInput);
        if (match) {
            //console.log('oled sisseloginud kasutaja:' + users[0].id);
            //sessiooni käivitamine and shit
            req.session.userFirstName = users[0].firstname;
            req.session.userLastName = users[0].lastname;
            req.session.userId = users[0].id;
            return res.redirect('/home');
        } else {
            notice = 'Sisestatud kasutajatunnus ja/või parool oli vale!';
            return res.render('signup', {notice: notice});
        }
    }

    catch (err) {
        console.log('Viga', err);
        res.render('signin', {notice: 'ootan andmeid'});
    }
    finally {
        if(conn) {
            await conn.end();
        }
    }

};




module.exports = {
    signinPage,
    signinPagePost
}