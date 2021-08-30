const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    password: "mrchair4",
    database: "musicoterapia_db",
    host: "localhost",
    port: 5432
});

module.exports = pool;
