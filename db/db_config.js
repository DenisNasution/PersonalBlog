const mysql = require('mysql')

const db = mysql.createConnection({
    host: 'localhost',
    user: "root",
    password: "test",
    database: 'blog'


})

module.exports = db