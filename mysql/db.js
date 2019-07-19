var mysql = require('mysql');
var sql = mysql.createConnection({
    host:'127.0.0.1',
    user: 'root',
    password: '',
    database: 'telecom'
});

module.exports = sql;