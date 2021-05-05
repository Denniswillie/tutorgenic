require('dotenv').config({
    path: __dirname + '/../../.env'
});
const inProduction = process.env.NODE_ENV === "production";

const Pool = require('pg').Pool;

let pool;

if (inProduction) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    })
} else {
    pool = new Pool({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DATABASE,
        password: process.env.POSTGRES_PASSWORD,
        port: process.env.POSTGRES_PORT,
    })
}

module.exports = pool;
