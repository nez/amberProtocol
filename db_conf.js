var options = {};
pgp = require('pg-promise')(options);

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process_env.DB_PORT || '5432',
    database: process.env.DB_NAME  || 'amber',
    user: process.env.DB_USER || 'auser',
    password: process.env.DB_PASSWORD || 'test'
};

console.log('DB Config -> ', JSON.stringify(config));

var db = pgp(config);

module.exports = {
    db: db
};
