// db.js — подключение к PostgreSQL.
// Используем Pool, чтобы переиспользовать соединения с базой.
// Это стандартный подход для Express + PostgreSQL.

import pg from 'pg';

const { Pool } = pg;

// DATABASE_URL задается через переменные окружения.
// В Cloud Shell его подставит docker-compose.yml.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Универсальная функция для SQL-запросов.
export function query(text, params) {
  return pool.query(text, params);
}