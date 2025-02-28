const { Pool } = require("pg");

// Database configuration
const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "postgres", // Docker service name for PostgreSQL
  database: process.env.POSTGRES_DB || "DTSM",
  password: process.env.POSTGRES_PASSWORD || "kingcrimson69",
  port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
});

// Export a query function for easy use
export const query = (text, params) => {
  return pool.query(text, params);
};
