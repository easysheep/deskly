// src/utils/db.js
import { Pool } from 'pg'
console.log('> DATABASE_URL=', process.env.DATABASE_URL)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

pool.on('connect', () => console.log('✅ Connected to Supabase Postgres'))
pool.on('error', err => console.error('❌ Supabase Postgres error', err))

export const query = (text, params) => pool.query(text, params)

