require('dotenv').config();  // Load environment variables from .env file
const mysql = require('mysql');

// Create a connection pool
const pool = mysql.createPool({
    connectionLimit: 10,  // Limit the number of simultaneous connections
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Export the pool for shared use across the application
module.exports = pool;
