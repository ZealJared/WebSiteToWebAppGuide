const db = require('mysql2/promise');
const connection = db.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'blog',
    password: 'secret'
})

const getResults = async function (sql, values) {
    const connectedDb = await connection;
    const [rows, fields] = await connectedDb.execute(sql, values);
    return rows
}

module.exports = { getResults }
