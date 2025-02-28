const { Pool } = require('pg');


// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'DTSM',
  password: 'kingcrimson69',
  port: 5432, // Default PostgreSQL port
});

// Export a query function for easy use
export const query = (text, params) => {
    return pool.query(text, params);
};