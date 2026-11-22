exports.isLogin = function(req, res, next){
    if(req.session != null){
        if(req.session.userId){
            console.log('sisseloginud kasutaja: ' + req.session.userId);
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
