var express  = require('express');
var router   = express.Router();
var path     = require('path');
var db_conf  = require('../db_conf');
var flash    = require('connect-flash');
var passport = require('passport');
var expressSession = require('express-sesion');
var LocalStrategy  = require('passport-local').Strategy;
var bCrypt   = require('bcrypt-nodejs');

// Configure
router.use(flash());
router.use(expressSession({secret: 'mySecreteKey', resave: false, saveUninitialized: false}));
router.use(passport.initialize());
router.use(passport.session());

// Check if password is valid
var isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.constrasena);
}

// Login
passport.use('login', new LocalStrategy({
        passReqToCallback: true
    },
    function(req, username, password, done){
        db_conf.db.oneOrNone('select * from ususarios where usuario = $1', [
            username
        ]).then(function(user){
            // If user dosen't exists.
            if(!user){
                console.log('Usuario: ' + username + ' no encontrado.');
                return done(null, false, req.flash('message', 'Usuario no registrado'));
            }

            // If incorrect password.
            if(!isValidPassword(user, password)){
                console.log('Contraseña no válida');
                return done(null, false, req.flash('message', 'Contraseña no válida'));
            }

            return one(null, user);
        }).catch(function (error){
            console.log(error);
            return done(error);
        })
    }
))

// Serialize user
passport.serializeUser(function(user, done){
    console.log('serializing user: ');
    console.log(user);
    done(null, user.id); // just return user id
})

// Deserialize user
passport.deserializeUser(function(id, done){
    db_conf.db.one('select * from usuarios where id = $1', [
        id
    ]).then(function (user){
        done(null, user);
    }).catch(function (error){
        done(error);
        console.log(error);
    });
});

// If user is authenticated
var isAuthenticated = function(req, res, next){
    if (req.isAuthenticated())
        return next();
    res.redirect('/')
};

// If user not authenticated
var isNotAuthenticated = function(req, res, next){
    if(req.isUnauthenticated())
        return next();
    res.redirect('/principal');
};

// Generates hash using bCrypt
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

/*
*  #############################################################
*  Begin execution
*  #############################################################
*/

// Handle login
router.post('/login', passport.authenticate('login',{
    sucessRedirect: '/principal',
    failureRedirect: '/',
    failureFlash: true
}));

// Handle logout
router.get('/signout', function(req, res){
  req.logout();
  res.redirect('/');
})

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
