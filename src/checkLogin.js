let timeNow = new Date();
let dateET = require('./dateTimeET');
const time = dateET.timeFormattedET();
exports.isLogin = function(req, res, next){
    if(req.session != null){
        if(req.session.userId){
            const loginMoment = time;
            const loginUserId = req.session.userId;
            const loginUserFirstName = req.session.userFirstName;
            const loginUserLastName = req.session.userLastName;
            console.log('sisseloginud kasutaja: ' + loginUserId);
            console.log(loginMoment);
            next();
        } else {
            console.log('pole sisse loginud, pole sessioonimuutujat');
            return res.redirect('/signin');
        }
    } else {
        console.log('sessiooni pole')
        return res.redirect('/signin')
    }
}

