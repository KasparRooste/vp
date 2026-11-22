const mysql = require('mysql2/promise');
const validator = require('validator');
const argon = require('argon2');
//page for creating user account
const signupPage = (req, res) => {
    res.render('signup', {notice: 'Ootan andmeid!'});
};
const signupPagePost = async (req, res) => {
    let conn;
    let notice = '';
    //puhastame andmeid ja valideerime
    const firstName = validator.escape(req.body.firstNameInput.trim());
    const lastName = validator.escape(req.body.lastNameInput.trim());
    const birthDate = req.body.birthDateInput;
    const gender = req.body.genderInput;
    const email = req.body.emailInput.trim();
    const password = req.body.passwordInput;
    const confirmPassword = req.body.confirmPasswordInput;
    if(!firstName || !lastName || !birthDate || !gender || !email || !password || !confirmPassword){
        notice = 'sisest andmed!';
        return res.render('signup', {notice: notice});
    }

    if (!validator.isEmail(email)){
        notice = 'Meili aadress pole korrektne!'
        return res.render('signup', {notice: notice});
    }
    if (!validator.isDate(birthDate) || validator.isAfter(birthDate)){
        notice = 'Sisestatud sünnikuupäev pole korrektne!'
        return res.render('signup', {notice: notice});
    }
    //kas parool on piisavalt tugev?????????
    const passwordOptions = {minLength: 8,minLowercase: 1,minUppercase: 1, minNumbers: 1, minSymbols: 1,};
    if (!validator.isStrongPassword(password, passwordOptions)){
        notice = 'Sisestatud parool pole piisavalt tugev!'
        return res.render('signup', {notice: notice});
    }
    //kas kaks on ühe sugused
    if (password != confirmPassword){
        notice = 'Sisestatud paroolid ei kattu!'
        return res.render('signup', {notice: notice});
    }
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        let sqlReq = 'SELECT id FROM users WHERE email = ?';
        const [users] = await conn.execute(sqlReq, [email]);
        if (users.length > 0){
            //nii tegelt ei tohi seaduse järgi
            notice = 'Selline kasutaja on juba olemas!'
            return res.render('signup', {notice: notice});
        }
        sqlReq = 'INSERT INTO users (firstname, lastname, birthdate, gender, email, password) VALUES (?,?,?,?,?,?)';
        //krüpteerime parooli
        const pwdHash = await argon.hash(password);
        const [result] = await conn.execute(sqlReq, [
            firstName,
            lastName,
            birthDate,
            gender,
            email,
            pwdHash
        ]);
        notice = 'Loodi kasutaja konto!'
        res.render('signup', {notice: notice});
    }
    catch (err) {
        console.log('Viga', err);
        res.render('signup', {notice: 'ootan andmeid'});
    }
    finally {
        if(conn) {
            await conn.end();
        }
    }

};




module.exports = {
    signupPage,
    signupPagePost
}