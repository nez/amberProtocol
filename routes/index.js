var express = require('express');
var router = express.Router();
var path = require('path');
var json2csv = require('json2csv'); //export -> csv
var fs = require('fs'); //read/write files
var db_conf = require('../db_conf');
// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
router.use(flash());

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
var bCrypt = require('bcrypt-nodejs');

router.use(expressSession({secret: 'mySecretKey', resave : false , saveUninitialized: false}));
router.use(passport.initialize());
router.use(passport.session());
var LocalStrategy = require('passport-local').Strategy;

passport.use('login', new LocalStrategy({
        passReqToCallback : true
    },
    function(req, username, password, done) {
        // check in postgres if a user with username exists or not
        db_conf.db.oneOrNone('select * from usuarios where usuario = $1', [ username ]).then(function (user) {
            // session

            if (!user){
                console.log('User Not Found with username '+username);
                return done(null, false, req.flash('message', 'Usuario no registrado'));
            }

            if (!isValidPassword(user ,password)){
                console.log('Contraseña no válida');
                return done(null, false, req.flash('message', 'Contraseña no válida')); // redirect back to login page
            }

            return done(null,user);
        }).catch(function (error) {
            console.log(error);
            return done(error);
        });
    }
));

var isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.contrasena);
};

// Passport needs to be able to serialize and deserialize users to support persistent login sessions
passport.serializeUser(function(user, done) {
    console.log('serializing user: ');
    console.log(user);
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    db_conf.db.one(' select * from usuarios where id = $1',[ id ]).then(function (user) {
        //console.log('deserializing user:',user);
        done (null, user);
    }).catch(function (error) {
        done(error);
        console.log(error);
    });
});

var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/');
};

var isNotAuthenticated = function (req, res, next) {
    if (req.isUnauthenticated())
        return next();
    // if the user is authenticated then redirect him to the main page
    res.redirect('/principal');
};


// Generates hash using bCrypt
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

/*
 * ############################################
 *  Exec
 * ############################################
 */

// ----------------------------------------------------
// Useful functions
function numericCol ( x ){
    return ( x == '' || isNaN(x))?null:x;
}

function stob( str) {
    return (str == 'true')
}

/* uploads */
var multer = require ('multer');

var upload = multer({
    dest: path.join(__dirname, '..', 'uploads')
});
// ----------------------------------------------------

/* Handle Login POST */
router.post('/login', passport.authenticate('login', {
    successRedirect: '/principal',
    failureRedirect: '/',
    failureFlash : true
}));

/* Handle Logout */
router.get('/signout', function(req, res) {
    req.logout();
    res.redirect('/');
});


/* GET login page. */
router.get('/', isNotAuthenticated, function(req, res, next) {
    res.render('login', { title: '', message : req.flash('message') });
});

router.get('/principal', isAuthenticated, function (req, res) {
    res.render('principal', { title: 'Amber', user: req.user, section: 'principal'});
});

/* Tablero */
router.get('/tablero', isAuthenticated, function(req, res){
    res.render('tablero', {title: 'Amber', user: req.user, section: 'tablero'});
});

/* Admin */
router.get('/alerta', isAuthenticated, function(req, res){
    res.render('alerta', {title: 'Amber', user: req.user, section: 'alerta'});
});

/* Admin */
router.get('/admin', isAuthenticated, function(req, res){
    res.render('administrador', {title: 'Amber', user: req.user, section: 'administrador'})
});


/* New info */
router.post('/info/new', isAuthenticated, function(req, res){
    db_conf.db.manyOrNone('select * from alertas').then(function(data){
        res.render('partials/new-info', {title:'Amber', user: req.user, alertas: data})
    }).catch(function (error){
        console.log(error);
        res.json({
            status: 'error',
            message: 'Ocurrió un error a la hora de registrar la alerta'
        })
    });
});

/* Register info */
router.post('/info/register', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.one('insert into infos (id_alert, event, responsetype, urgency, severity, certainty, headline, description) ' +
        ' values($1, $2, $3, $4, $5, $6, $7, $8) returning id, id_alert', [
        req.body.id_alerta,
        req.body.event,
        req.body.responsetype,
        req.body.urgency,
        req.body.severidad,
        req.body.certeza,
        //req.body.optradio,
        req.body.headline,
        req.body.desc
    ]).then(function(data){
        res.json({
            status: 'Ok',
            message: 'Se registro con exito la información de la alerta:  '
        })
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'error',
            message: 'Ocurrió un error al registrar la información de la alerta'
        })
    });
})

/* New alert */
router.post('/alert/new', isAuthenticated, function(req, res){
    db_conf.db.manyOrNone(
        'select * from dependencias'
    ).then(function(data){
        res.render('partials/new-alert', {title: 'Amber', user: req.user, deps: data});
    })
});

/* Register alert */
router.post('/alert/register', isAuthenticated, function(req, res){
    console.log(req.body);
    console.log(req.user.id);
    db_conf.db.one('insert into alertas (title, id_usuario, status, msgtype, source, sent) ' +
        ' values($1, $2, $3, $4, $5, now()) returning id, title', [
        req.body.title,
        req.user.id,
        req.body.status,
        req.body.msgtype,
        req.body.source
    ]).then(function(data){
        res.json({
            status: 'Ok',
            message: 'Se ha dado generado la alerta: ' + data.title
        });
    }).catch(function(error){
        res.json({
            status: 'error',
            message: 'Ocurrió un error al generar la alerta.'
        });
    });
});


/* Look up alert view */
router.post('/alert/find-alerts-view', isAuthenticated, function(req, res){
    db_conf.db.manyOrNone('select * from dependencias').then(function(data){
        res.render('partials/find-alerts-view', {title: 'Amber', user: req.user, deps: data})
    })
});

/* Look up results */
router.post('/alerts/results', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.manyOrNone("select * from alertas where status = 'activa' and (title ilike '%$1#%' or (sent <= $2 and sent >= $3) or source = $4) ", [
        req.body.title,
        req.body.fecha_final,
        req.body.fecha_inicial,
        req.body.id_source
    ]).then(function(data){
        console.log(data.length);
        res.render('partials/alerts-results-view', {title: 'Amber', user: req.user, alerts: data})
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al buscar la alerta'
        })
    })
})

/* Edit alert */
router.post('/alert/edit', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.task(function(t){
        return this.batch([
            this.oneOrNone('select * from alertas where id = $1', [
                req.body.id
            ]),
            this.manyOrNone('select * from dependencias')
        ])
    }).then(function(data){
        res.render('partials/edit-alert', {title: 'Amber', user: req.user, deps: data[1], alert: data[0]});
    })
});

/* Alert update */
router.post('/alert/update', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.oneOrNone('update alertas set title = $1, status = $2, source = $3, msgtype = $4, sent = now(), id_usuario = $5 ' +
        'where id = $6 returning id, title', [
        req.body.title,
        req.body.status,
        req.body.source,
        req.body.msgtype,
        req.user.id,
        req.body.id
    ]).then(function(data){
        res.json({
            status: 'Ok',
            message: 'La alerta fue actualizada exitosamente'
        })
    }).catch(function(error){
        res.json({
            status: 'Error',
            message: 'Hubo un error al registrar los cambios'
        })
    })
})

/*
 * ---------------------------------
 *  Deps
 * ---------------------------------
 */

/* New dep */
router.post('/dep/new', isAuthenticated, function(req, res){
    res.render('partials/new-dependency', {title: 'Amber', user: req.user})
});

/* Register dep */
router.post('/dep/register', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.one('insert into dependencias (nombre, direccion_calle, direccion_numero_int, direccion_numero_ext, ' +
        'direccion_colonia, direccion_localidad, direccion_municipio, direccion_ciudad, direccion_estado, direccion_pais, slug) ' +
        'values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning id, nombre', [
        req.body.dependencia,
        req.body.direccion_calle,
        req.body.direccion_numero_int,
        req.body.direccion_numero_ext,
        req.body.direccion_colonia,
        req.body.direccion_localidad,
        req.body.direccion_municipio,
        req.body.direccion_ciudad,
        req.body.direccion_estado,
        req.body.direccion_pais,
        req.body.slug
    ]).then(function(data){
        res.json({
            status:'Ok',
            message: 'Se ha registrado la dependencia: ' + data.nombre
        })
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al registrar la dependencia'
        })
    })
});

/* Look up dep view */
router.post('/dep/find-deps-view', isAuthenticated, function(req, res){
    res.render('partials/find-deps-view', {title: 'Amber', user: req.user})
});

/* Look up results */
router.post('/dep/results', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.manyOrNone("select * from dependencias where nombre ilike '%$1#%' or slug ilike '%$2#%' ", [
        req.body.nombre,
        req.body.siglas
    ]).then(function(data){
        res.render('partials/deps-results-view', {deps: data});
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'error',
            message: 'Ocurrió un error en la búsqueda'
        })
    })
});

/* Edit dep */
router.post('/dep/edit', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.oneOrNone('select * from dependencias where id = $1', [
        req.body.id
    ]).then(function(data){
        res.render('partials/edit-dependency', {title: 'Amber', user: req.user, dep:data})
    }).catch(function(error){
        res.json({
            status: 'error',
            message: 'Ocurrió un error al encontrar la dependencia'
        })
    })
});

/* Update dep */
router.post('/dep/update', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.oneOrNone('update dependencias set nombre = $1, direccion_calle = $2, direccion_numero_int = $3, direccion_numero_ext = $4, ' +
        'direccion_colonia = $5, direccion_localidad = $6, direccion_municipio = $7, direccion_ciudad = $8, direccion_estado = $9, direccion_pais = $10, ' +
        'slug = $11 where id = $12 returning id, nombre ', [
        req.body.dependencia,
        req.body.direccion_calle,
        req.body.direccion_numero_int,
        req.body.direccion_numero_ext,
        req.body.direccion_colonia,
        req.body.direccion_localidad,
        req.body.direccion_municipio,
        req.body.direccion_ciudad,
        req.body.direccion_estado,
        req.body.direccion_pais,
        req.body.slug,
        req.body.id
    ]).then(function (data) {
        res.json({
            status: 'Ok',
            message: 'Dependencia actualizada exitosamente'
        })
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al actualizar la dependencia'
        })
    })
})


/*
 * ---------------------------------
 *  Users
 * ---------------------------------
 */

/* New User */
router.post('/user/new', isAuthenticated, function (req, res) {
    db_conf.db.manyOrNone('select * from dependencias').then(function(data){
        res.render('partials/new-user', {dependencias: data});
    }).catch(function (error) {
        console.log(error);
        res.send('<b>Error</b>');
    });
});

/* New User register */
router.post('/user/signup', isAuthenticated, function(req, res){
    db_conf.db.one('select count(*) as count from usuarios where usuario =$1',[ req.body.usuario ]).then(function (data) {

        // 8 char pass
        // no special char in username

        if ( req.body.contrasena != req.body.confirmar_contrasena){
            return { id: -2 };
        }

        if ( data.count > 0) {
            return { id: -1 };
        }

        return db_conf.db.one('insert into usuarios ( usuario, contrasena, email, nombres, apellido_paterno, apellido_materno, rfc, direccion_calle, direccion_numero_int, ' +
            'direccion_numero_ext, direccion_colonia, direccion_localidad, direccion_municipio, direccion_ciudad, direccion_estado, direccion_pais,' +
            ' permiso_tablero, permiso_administrador, permiso_alerta, id_dependencia) values' +
            '($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) returning id, usuario ', [
            req.body.usuario.trim(),
            bCrypt.hashSync( req.body.contrasena, bCrypt.genSaltSync(10), null),
            req.body.email,
            req.body.nombres,
            req.body.apellido_paterno,
            req.body.apellido_materno,
            req.body.rfc,
            req.body.direccion_calle,
            req.body.direccion_numero_int,
            req.body.direccion_numero_ext,
            req.body.direccion_colonia,
            req.body.direccion_localidad,
            req.body.direccion_municipio,
            req.body.direccion_ciudad,
            req.body.direccion_estado,
            req.body.direccion_pais,
            stob(req.body.permiso_tablero),
            stob(req.body.permiso_administrador),
            stob(req.body.permiso_alertas),
            numericCol(req.body.id_dependencia)
        ]);


    }).then(function (data) {

        var response = { status: '', message: ''};
        switch ( data.id ){
            case -1:
                response.status ='Error';
                response.message = 'Ya existe un usuario registrado con ese nombre, pruebe uno distinto';
                break;
            case -2:
                response.status = 'Error';
                response.message = 'La contraseña no coincide';
                break;
            default:
                response.status = 'Ok';
                response.message = 'El usuario "' + data.usuario + '" ha sido registrado';
        }

        res.json(response);

    }).catch(function (error) {
        console.log(error);
        res.json({
            status : 'Error',
            message: 'Ocurrió un error al registrar el nuevo usuario'
        });
    });
});


module.exports = router;
