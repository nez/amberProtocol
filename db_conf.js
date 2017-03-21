var options = {};

pgp = require('pg-promise')(options);

var db;

if (typeof process.env.DB != "undefined"){
    console.log("DB: ", process.env.DB);
    db = pgp(process.env.DB);
}else{
    console.log("Warning: BM_DB env variable si not set \n" +
    " defaulting to -> postgres://auser:test@localhost/amber");
    db = pgp({
        host: 'localhost',
        port: '3000',
        database: 'amber',
        user: 'auser',
        password: 'test'
    });
}

module.exports = {
    db: db
};