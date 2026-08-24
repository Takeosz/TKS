const { Pool } = require("pg");

require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
    console.log("PostgreSQL conectado.");
});

pool.on("error", (error) => {
    console.error("Erro no PostgreSQL:", error);
});

module.exports = pool;