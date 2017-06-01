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
    res.render('alertaBeta', {title: 'Amber', user: req.user, section: 'alerta'});
});

/* Admin */
router.get('/admin', isAuthenticated, function(req, res){
    res.render('administradorBeta', {title: 'Amber', user: req.user, section: 'administrador'})
});

/* Ind options */
router.post('/ind/options', isAuthenticated, function(req, res){
    res.render('partials/ind-options', {title: 'Amber', user: req.user})
});


/* Event new */
router.post('/event/new', isAuthenticated, function(req, res){
    db_conf.db.manyOrNone('select * from alertas').then(function(data){
        res.render('partials/new-event', {title: 'Amber', user: req.user, alertas: data})
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al cargar la vista'
        })
    })
});

/* Event register */
router.post('/event/register', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.oneOrNone('insert into event (id_alert, edate, victimnumber, companionnumber, suspectnumber, eventdesc,' +
        ' expiration, latitude, longitude, roadtype, roadname, exteriornumber, interiornumber, settlementtype, ' +
        'settlementname, postalcode, municipalityname, municipalitycode, statename, statecode, perpendiculars, parallel,' +
        'landmarks, localityname, localitycode) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, ' +
        '$21, $22, $23, $24, $25) returning id',[
        req.body.id_alerta,
        req.body.edate,
        req.body.victimnumber,
        req.body.companionnumber,
        req.body.suspectnumber,
        req.body.eventdesc,
        req.body.expiration,
        req.body.latitude,
        req.body.longitude,
        req.body.roadtype,
        req.body.roadname,
        req.body.exteriornumber,
        req.body.interiornumber,
        req.body.settlementtype,
        req.body.settlementname,
        req.body.postalcode,
        req.body.municipalityname,
        req.body.municipalitycode,
        req.body.statename,
        req.body.statecode,
        req.body.perpendiculars,
        req.body.parallel,
        req.body.landmarks,
        req.body.localityname,
        req.body.localitycode
    ]).then(function(data){
        res.json({
            status: 'Ok',
            message: 'El evento ha sido de alta exitosamente.'
        })
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'error',
            message: 'Ocurrió un error al registrar el evento'
        })
    })
})

/* Events results */
router.post('/events/results', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.manyOrNone('select * from event where id = $1', [
        req.body.id
    ]).then(function(data){
        res.render('partials/event-results-view', {title: 'Amber', user: req.user, events: data})
    }).catch(function(error){
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al cargar la vista'
        })
    })

})

/* Event edit */
router.post('/event/edit', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.task(function(t){
        return t.batch([
            this.oneOrNone('select * from event where id = $1', [
                req.body.id
            ]),
            this.manyOrNone('select * from alertas')
        ])
    }).then(function(data){
        res.render('partials/edit-event', {title: 'Amber', user: req.user, event: data[0], alertas: data[1]})
    }).catch(function(error){
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al cargar la vista'
        })
    })
})

/* Event update */
router.post('/event/update', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.oneOrNone('update event set id_alert = $1, edate = $2, victimnumber = $3, companionnumber = $4, ' +
        'suspectnumber = $5, eventdesc = $6, expiration = $7, latitude = $8, longitude = $9, roadtype = $10, ' +
        'roadname = $11, exteriornumber = $12, interiornumber = $13, settlementtype = $14,' +
        ' postalcode = $15, localityname = $16, localitycode = $17, municipalityname = $18, municipalitycode = $19, ' +
        'statename = $20, statecode = $21, perpendiculars = $22, parallel = $23, landmarks = $24 where id = $25 returning id', [
        req.body.id_alert,
        new Date(req.body.edate),
        numericCol(req.body.victimnumber),
        numericCol(req.body.companionnumber),
        numericCol(req.body.suspectnumber),
        req.body.eventdesc,
        new Date(req.body.expiration),
        numericCol(req.body.latitude),
        numericCol(req.body.longitude),
        req.body.roadtype,
        req.body.roadname,
        numericCol(req.body.exteriornumber),
        numericCol(req.body.interiornumber),
        req.body.settlementtype,
        req.body.postalcode,
        req.body.localityname,
        req.body.localitycode,
        req.body.municipalityname,
        req.body.municipalitycode,
        req.body.statename,
        req.body.statecode,
        req.body.perpendiculars,
        req.body.parallel,
        req.body.landmarks,
        req.body.id
    ]).then(function(data){
        res.json({
            status: 'Ok',
            message: 'Se han actualizado los campos del evento'
        })
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al actualizar los campos del evento'
        })
    })
})

/* Ind select */
router.post('/ind/select-form', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.task(function(t){
        return this.batch([
            req.body.ind_type,
            this.manyOrNone('select * from alertas')
        ])
    }).then(function(data){
        console.log(data[0]);
        res.render('partials/new-ind', {title: 'Amber', user: req.user, type: data[0], alertas: data[1]})
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al cargar la plantilla'
        })
    })
})

/* Ind register */
router.post('/ind/register', isAuthenticated, function(req, res){
    console.log(req.body);
    var query = 'insert into victims (id_alert, name, surname1, surname2, birthdate, age, gender, nationality, ' +
        'hairtype, haircolor, eyecolor, height, weight, complex, wear, peculiar) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, ' +
        '$12, $13, $14, $15, $16) returning id'
    if(req.body.type == 'companion'){
        query = 'insert into companion (id_alert, name, surname1, surname2, birthdate, age, gender, nationality, ' +
            'hairtype, haircolor, eyecolor, height, weight, complex, wear, peculiar, alias, kinship, vehicle) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, ' +
            '$12, $13, $14, $15, $16, $17, $18, $19) returning id'
    }else if(req.body.type == 'suspect'){
        query = 'insert into suspect (id_alert, name, surname1, surname2, birthdate, age, gender, nationality, ' +
            'hairtype, haircolor, eyecolor, height, weight, complex, wear, peculiar, alias, kinship, vehicle) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, ' +
            '$12, $13, $14, $15, $16, $17, $18, $19) returning id'
    }
    db_conf.db.oneOrNone(query, [
        req.body.id_alerta,
        req.body.name,
        req.body.surname1,
        req.body.surname2,
        req.body.birthdate,
        req.body.age,
        req.body.gender,
        req.body.nationality,
        req.body.hairtype,
        req.body.haircolor,
        req.body.eyecolor,
        req.body.height,
        req.body.weight,
        req.body.complex,
        req.body.wear,
        req.body.peculiar,
        req.body.alias,
        req.body.kinship,
        req.body.vehicle
    ]).then(function(data){
        res.json({
            status: 'Ok',
            message: 'El individuo ha sido registrado'
        });
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al registrar al individuo'
        });
    });
});

/* Find ind */
router.post('/ind/find-ind-view', isAuthenticated, function(req, res){
    db_conf.db.manyOrNone('select alertas.id, alertas.title, alertas.id_usuario, alertas.sent, alertas.status, ' +
        ' alertas.msgtype, alertas.source from alertas, usuarios where (alertas.source = usuarios.id_dependencia  ' +
        ' and usuarios.id = $1) or (usuarios.permiso_administrador = TRUE and usuarios.id = $1)  ' +
        ' order by sent', [req.user.id]).then(function(data){
        res.render('partials/find-inds-view', {title: 'Amber', user: req.user, alertas: data});
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al levantar la vista'
        })
    })
});

/* Results ind */
router.post('/ind/results', isAuthenticated, function(req, res){
    console.log(req.body);
    var query = "select * from victims where id_alert = $1 and name ilike '%$2#%'";
    if(req.body.optradio == 'companion'){
        query = "select * from companion where id_alert = $1 and name ilike '%$2#%'";
    }
    if(req.body.optradio == 'suspect'){
        query = "select * from suspect where id_alert = $1 and name ilike '%$2#%'";
    }
    db_conf.db.manyOrNone(query, [
        req.body.id_alerta,
        req.body.nombre
    ]).then(function(data){
        res.render('partials/inds-results-view', {title: 'Amber', user: req.user, inds: data, type: req.body.optradio});
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al buscar al individuo'
        })
    })
})

/* Ind Edit */
router.post('/ind/edit', isAuthenticated, function(req, res){
    console.log(req.body);
    var query = 'select * from victims where id = $1'
    if(req.body.type == 'suspect'){
        query = 'select * from suspect where id = $1'
    }
    if(req.body.type == 'companion'){
        query = 'select * from companion where id = $1'
    }
    db_conf.db.task(function(t){
        return t.batch([
            t.manyOrNone('select * from alertas'),
            t.oneOrNone(query, [
                req.body.id
            ])
        ])
    }).then(function(data){
        res.render('partials/edit-ind', {title: 'Amber', user: req.user, ind: data[1], alertas: data[0], type: req.body.type})
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al cargar la vista'
        });
    });
});


/* Ind Update */
router.post('/ind/update', isAuthenticated, function(req, res){
    console.log(req.body);
    var query = 'update victims set id_alert = $1, name = $2, surname1 = $3, surname2 = $4, birthdate = $5, age = $6, ' +
        'gender = $7, nationality = $8, hairtype = $9, haircolor = $10, eyecolor = $11, height = $12, weight = $13, ' +
        'complex = $14, wear = $15, peculiar = $16 where id = $17 returning id'

    if(req.body.type == 'companion'){
        query = 'update companion set id_alert = $1, name = $2, surname1 = $3, surname2 = $4, birthdate = $5, age = $6, ' +
            'gender = $7, nationality = $8, hairtype = $9, haircolor = $10, eyecolor = $11, height = $12, weight = $13, ' +
            'complex = $14, wear = $15, peculiar = $16, alias = $18, kinship = $19, vehicle = $20 where id = $17 returning id'
    }

    if(req.body.type == 'suspect'){
        query = 'update suspect set id_alert = $1, name = $2, surname1 = $3, surname2 = $4, birthdate = $5, age = $6, ' +
            'gender = $7, nationality = $8, hairtype = $9, haircolor = $10, eyecolor = $11, height = $12, weight = $13, ' +
            'complex = $14, wear = $15, peculiar = $16, alias = $18, kinship = $19, vehicle = $20 where id = $17 returning id'
    }
    db_conf.db.oneOrNone(query, [
        req.body.id_alerta,
        req.body.name,
        req.body.surname1,
        req.body.surname2,
        new Date(req.body.birthdate),
        req.body.age,
        req.body.gender,
        req.body.nationality,
        req.body.hairtype,
        req.body.haircolor,
        req.body.eyecolor,
        req.body.height,
        req.body.weight,
        req.body.complex,
        req.body.wear,
        req.body.pecualiar,
        req.body.id,
        req.body.alias,
        req.body.kinship,
        req.body.vehicle
    ]).then(function(data){
        res.json({
            status: 'Ok',
            message: 'Se han actualizado los datos de el individuo'
        })
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un erro al actualizar los datos del individuo'
        })
    })
})

/* New area */
router.post('/area/new', isAuthenticated, function(req, res){
    db_conf.db.manyOrNone('select * from alertas').then(function(data){
        res.render('partials/new-area', {title: 'Amber', user: req.user, alertas: data})
    }).catch(function(error){
        res.json({
            status: 'Error',
            message: 'Ocurrió un error'
        });
    });
});

/* Area regiter */
router.post('/area/register', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.oneOrNone('insert into area (id_alert, area, areadesc, polygon, geocode) ' +
        'values ($1, $2, $3, $4, $5) returning id',[
        req.body.id_alerta,
        req.body.area,
        req.body.areadesc,
        req.body.polygon,
        req.body.geocode
    ]).then(function(data){
        res.json({
            status: 'Ok',
            message: 'El área se ha registrado con éxito'
        });
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al registrar el área'
        });
    });
});

/* Area results */
router.post('/area/results', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.manyOrNone('select * from area where id_alert = $1', [
        req.body.id
    ]).then(function(data){
        console.log(data);
        res.render('partials/area-results-view', {title: 'Amber', user: req.user, areas: data})
    }).catch(function(data){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al buscar el área'
        });
    });
});

/* Area edit */
router.post('/area/edit', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.tx(function(t){
        return this.batch([
            this.oneOrNone('select * from area where id = $1', [
                req.body.id
            ]),
            this.manyOrNone('select * from alertas')
        ]).then(function(data){
            res.render('partials/edit-area', {title: 'Amber', user: req.user, area: data[0], alertas: data[1]});
        }).catch(function(error){
            console.log(error);
            res.json({
                status: 'Error',
                message: 'Ocurrió un error al buscar el área'
            });
        });
    });
});

/* Area update */
router.post('/area/update', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.oneOrNone('update area set id_alert = $1, area = $2, areadesc = $3, polygon = $4, geocode = $5 where id = $6', [
        req.body.id_alerta,
        req.body.area,
        req.body.areadesc,
        req.body.polygon,
        req.body.geocode,
        req.body.id
    ]).then(function(data){
        res.json({
            status: 'Ok',
            message: 'Se actualizó el área exitosamente'
        });
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al actualizar el área'
        });
    });
});


/* New Resource */
router.post('/resource/new', isAuthenticated, function(req, res){
    db_conf.db.manyOrNone('select * from alertas').then(function(data){
        res.render('partials/new-resource', {title: 'Amber', user: req.user, alertas: data})
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al dar de alta el recurso'
        });
    });
});

/* Register resource */
router.post('/resource/register', isAuthenticated, function(req, res){
    console.log(req.body),
        db_conf.db.one('insert into resources (id_alert, description, mimetype, rec_size, uri) ' +
            'values($1, $2, $3, $4, $5) returning id', [
            req.body.id_alerta,
            req.body.description,
            req.body.mimeType,
            req.body.size,
            req.body.uri
        ]).then(function(data){
            res.json({
                status: 'Ok',
                message: 'El recurso se ha registrado con éxito'
            });
        }).catch(function(error){
            console.log(error);
            res.json({
                status: 'Error',
                message: 'Ocurrió un error al registrar el recurso'
            });
        });
});

/* Resource results */
router.post('/resource/results', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.manyOrNone('select * from resources where id = $1', [
        req.body.id,
    ]).then(function(data){
        res.render('partials/resources-results-view', {title: 'Amber', user: req.user, resources: data});
    }).catch(function(error){
        res.json({
            status: 'Error',
            message: 'Ocurrió un erro al buscar el recurso'
        })
    })
})

/* Resource edit */
router.post('/resource/edit', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.task(function(t){
        return t.batch([
            this.oneOrNone('select * from resources where id = $1', [
                req.body.id
            ]),
            this.manyOrNone('select * from alertas')
        ]).then(function(data){
            res.render('partials/edit-resource', {title: 'Amber', user: req.user, resource: data[0], alertas: data[1]});
        }).catch(function(error){
            res.json({
                status: 'Error',
                message: 'Ocurrió un erro al buscar el recurso'
            });
        });
    });
});

/* Resource update */
router.post('/resource/update', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.oneOrNone('update resources set id_alert = $1, description = $2, mimetype = $3, ' +
        'rec_size = $4, uri = $5 where id = $6 returning id', [
        req.body.id_alerta,
        req.body.description,
        req.body.mimeType,
        req.body.size,
        req.body.uri,
        req.body.id
    ]).then(function(data){
        res.json({
            status: 'Ok',
            message: 'Se han actualizado los datos del recurso exitosamente'
        });
    }).catch(function(error){
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al actualizar los datos del recurso'
        })
    })
})

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
    db_conf.db.one('insert into infos (id_alert, event, responsetype, urgency, severity, certainty, headline, description, effective) ' +
        ' values($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id, id_alert', [
        req.body.id_alerta,
        req.body.event,
        req.body.responsetype,
        req.body.urgency,
        req.body.severidad,
        req.body.certeza,
        req.body.headline,
        req.body.desc,
        req.body.effective
    ]).then(function(data){
        res.json({
            status: 'Ok',
            message: 'Se registro con exito la información de la alerta'
        })
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al registrar la información de la alerta'
        })
    });
})

// Infos results
router.post('/info/results', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.manyOrNone('select * from infos where id_alert = $1', [
        req.body.id
    ]).then(function(data){
        res.render('partials/infos-results-view', {title: 'Amber', user: req.user, infos: data})
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al buscar la información'
        })
    })
})

// Info edit
router.post('/info/edit', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.task(function(t){
        return this.batch([
            this.oneOrNone('select * from infos where id = $1', [
                req.body.id
            ]),
            this.manyOrNone('select * from alertas')
        ])
    }).then(function(data){
        res.render('partials/edit-info', {title: 'Amber', user: req.user, alertas: data[1], info: data[0]})
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al buscar la informacón'
        })
    })
})

/* Info update */
router.post('/info/update', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.oneOrNone(
        'update infos set id_alert = $1, event = $2, responsetype = $3, urgency = $4, severity = $5, certainty = $6, ' +
        ' effective = $7, headline = $8, description = $9 where id = $10 returning id, event',[
            req.body.id_alerta,
            req.body.event,
            req.body.responsetype,
            req.body.urgency,
            req.body.severidad,
            req.body.certeza,
            new Date(req.body.effective),
            req.body.headline,
            req.body.desc,
            req.body.id
        ]
    ).then(function(data){
        res.json({
            status: 'Ok',
            message: 'Se ha actualizado exitosamente la información'
        })
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al actualizar la información'
        })
    })
})

/* New alert */
router.post('/alert/new', isAuthenticated, function(req, res){
    db_conf.db.manyOrNone(
        'select * from dependencias'
    ).then(function(data){
        res.render('partials/new-alert', {title: 'Amber', user: req.user, deps: data});
    }).catch(function(error){
        console.log(errro);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error'
        })
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
    var page     = req.body.page;
    var pageSize = 10;
    var offset   = page * pageSize;
    console.log(req.body.page);
    db_conf.db.task(function(t){
        return t.batch([
            this.manyOrNone('select distinct dependencias.id, dependencias.nombre from dependencias, usuarios where (usuarios.id_dependencia = ' +
                'dependencias.id or usuarios.permiso_administrador = TRUE) and usuarios.id = $1', [req.user.id]),
            this.manyOrNone('select count(*) from alertas as count'),
            this.manyOrNone('select alertas.id, alertas.title, alertas.id_usuario, alertas.sent, alertas.status, ' +
                'alertas.msgtype, alertas.source from alertas, usuarios where (alertas.source = usuarios.id_dependencia  ' +
                ' and usuarios.id = $3) or (usuarios.permiso_administrador = TRUE and usuarios.id = $3)  ' +
                ' order by sent limit $1 offset $2', [pageSize, offset, req.user.id])
        ])
    }).then(function(data){
        console.log('RESULT');
        console.log(data[2]);
        res.render('partials/find-alerts-view', {
            title: 'Amber',
            user: req.user,
            deps: data[0],
            alertas: data[2],
            pageNumber: page,
            numberOfPages: parseInt((+data[1].count + pageSize - 1) / pageSize)
        })
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al cargar los datos'
        })
    })
});

/* Look up results */
router.post('/alerts/results', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.manyOrNone("select * from alertas where status = 'activa' and (title ilike '%$1#%' and (sent <= $2 and sent >= $3) and source = $4) ", [
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

/* PDF */
router.get('/pdfAlerta', isAuthenticated, function(req, res){
    var page     = 0;
    var pageSize = 10;
    var offset   = page * pageSize;
    console.log(req.body.page);
    db_conf.db.task(function(t){
        return t.batch([
            this.manyOrNone('select distinct dependencias.id, dependencias.nombre from dependencias, usuarios where (usuarios.id_dependencia = ' +
                'dependencias.id or usuarios.permiso_administrador = TRUE) and usuarios.id = $1', [req.user.id]),
            this.manyOrNone('select count(*) from alertas as count'),
            this.manyOrNone('select alertas.id, alertas.title, alertas.id_usuario, alertas.sent, alertas.status, ' +
                'alertas.msgtype, alertas.source from alertas, usuarios where (alertas.source = usuarios.id_dependencia  ' +
                ' and usuarios.id = $3) or (usuarios.permiso_administrador = TRUE and usuarios.id = $3)  ' +
                ' order by sent limit $1 offset $2', [pageSize, offset, req.user.id])
        ])
    }).then(function(data){
        res.render('pdfBeta', {
            title: 'Amber',
            user: req.user,
            section: 'pdf',
            deps: data[0],
            alertas: data[2],
            pageNumber: page,
            numberOfPages: parseInt((+data[1].count + pageSize - 1) / pageSize)
        })
    })
});


/* XML */
router.get('/xmlAlerta', isAuthenticated, function(req, res){
    var page     = 0;
    var pageSize = 10;
    var offset   = page * pageSize;
    console.log(req.body.page);
    db_conf.db.task(function(t){
        return t.batch([
            this.manyOrNone('select distinct dependencias.id, dependencias.nombre from dependencias, usuarios where (usuarios.id_dependencia = ' +
                'dependencias.id or usuarios.permiso_administrador = TRUE) and usuarios.id = $1', [req.user.id]),
            this.manyOrNone('select count(*) from alertas as count'),
            this.manyOrNone('select alertas.id, alertas.title, alertas.id_usuario, alertas.sent, alertas.status, ' +
                'alertas.msgtype, alertas.source from alertas, usuarios where (alertas.source = usuarios.id_dependencia  ' +
                ' and usuarios.id = $3) or (usuarios.permiso_administrador = TRUE and usuarios.id = $3)  ' +
                ' order by sent limit $1 offset $2', [pageSize, offset, req.user.id])
        ])
    }).then(function(data){
        res.render('xmlBeta', {
            title: 'Amber',
            user: req.user,
            section: 'xml',
            deps: data[0],
            alertas: data[2],
            pageNumber: page,
            numberOfPages: parseInt((+data[1].count + pageSize - 1) / pageSize)
        })
    })
});

/* XML Structure */
router.post('/alert/xml', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.task(function(t){
        return t.batch([
            this.oneOrNone('select alertas.id, alertas.title, alertas.sent, alertas.status, alertas.msgtype, ' +
                ' alertas.source, dependencias.nombre, usuarios.usuario ' +
                ' from alertas, dependencias, usuarios ' +
                ' where alertas.id = $1 and alertas.id_usuario = ' +
                ' usuarios.id and alertas.source = dependencias.id', [
                req.body.id
            ]),
            this.manyOrNone('select * from infos where id_alert = $1', [
                req.body.id
            ]),
            this.manyOrNone('select * from resources where id_alert = $1', [
                req.body.id
            ]),
            this.manyOrNone('select * from area where id_alert = $1', [
                req.body.id
            ]),
            this.manyOrNone('select * from victims where id_alert = $1', [
                req.body.id
            ]),
            this.manyOrNone('select * from suspect where id_alert = $1', [
                req.body.id
            ]),
            this.manyOrNone('select * from companion where id_alert = $1', [
                req.body.id
            ]),
            this.manyOrNone('select * from event where id_alert = $1', [
                req.body.id
            ]),
            this.oneOrNone('select xmlelement(name alert, xmlattributes(title)) from alertas where id = $1', [
                req.body.id
            ])
        ])
    }).then(function(data){
        console.log(data[8]);
        /*res.render('partials/xml-test', {
            title: 'Amber',
            user: req.user,
            alerts: data[0],
            infos: data[1],
            resources: data[2],
            areas: data[3],
            victims: data[4],
            suspects: data[5],
            companions: data[6],
            event: data[7],
            test: data[8]
        })*/
        res.json(data[8].xmlelement);
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al buscar la alerta'
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

/* User Update */
router.post('/user/update', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.oneOrNone('update usuarios set usuario=$1, contrasena=$2, email=$3, nombres=$4, apellido_paterno=$5, ' +
        'apellido_materno=$6, rfc=$7, direccion_calle=$8, direccion_numero_int=$9, direccion_numero_ext=$10, ' +
        'direccion_colonia=$11, direccion_localidad=$12, direccion_municipio=$13, direccion_ciudad=$14, ' +
        'direccion_estado=$15, direccion_pais=$16, permiso_alerta=$17, permiso_administrador=$18, permiso_tablero=$19, ' +
        'id_dependencia=$20 where id = $21 returning id, nombres', [
        req.body.usuario,
        req.body.contrasena,
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
        req.body.permiso_alertas,
        req.body.permiso_administrador,
        req.body.permiso_tablero,
        req.body.source,
        req.body.id
    ]).then(function(data){
      res.json({
          status: 'Ok',
          message: 'El usuario: ' + data.nombres + ' ha sido actualizado'
      })
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al actualizar al usuario'
        })
    })
})

/* Edit User */
router.post('/user/edit', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.task(function(t){
        return this.batch([
            t.manyOrNone('select * from dependencias'),
            t.oneOrNone('select * from usuarios where id = $1', [
                req.body.id
            ])
        ])
    }).then(function(data){
        res.render('partials/edit-user', {title: 'Amber', user: data[1], deps: data[0]})
    }).catch(function(error){
        console.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un erro al buscar al usuario'
        })
    })
})

/* Find User */
router.post('/user/find-users-view', isAuthenticated, function(req, res){
    db_conf.db.manyOrNone('select * from dependencias').then(function(data){
        res.render('partials/find-users-view', {title: 'Amber', user: req.user, deps: data})
    }).catch(function(error){
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al cargar la vista'
        })
    })

});

/* User results */
router.post('/user/results', isAuthenticated, function(req, res){
    console.log(req.body);
    db_conf.db.manyOrNone("select * from usuarios where id_dependencia = $1 and nombres ilike '%$2#%'",[
        req.body.id_dep,
        req.body.nombre
    ]).then(function(data){
        res.render('partials/users-results-view', {title: 'Amber', user: req.user, users: data})
    }).catch(function(error){
        consol.log(error);
        res.json({
            status: 'Error',
            message: 'Ocurrió un error al realizar la búsqueda'
        })
    })
})

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
