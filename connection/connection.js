const mysql = require('mysql');

const connection = mysql.createConnection({
    host : 'mysql-88296-0.cloudclusters.net',
    user : 'admin',
    password : 'hbkYKbjH',
    database : 'banking'
});
connection.connect()

exports.connection = connection;