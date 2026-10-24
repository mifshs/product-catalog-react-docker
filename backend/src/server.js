// server.js — основной HTTP-сервер.
// Здесь настраиваются Express, CORS, JSON, маршруты и ожидание PostgreSQL.
// Backend не хранит товары в памяти: все данные берутся из базы.

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import productRoutes from './routes/products.js';
import { pool } from './db.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);

// CORS нужен, чтобы браузер с фронтенда мог обращаться к API.
app.use(cors());

// Разрешаем Express читать JSON-тело запросов.
app.use(express.json());

// Health-check: простая проверка, что API работает.
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'product-catalog-api',
  });
});

// Все запросы /api/products обрабатывает products.js.
app.use('/api/products', productRoutes);

// 404 для неизвестных маршрутов.
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Централизованная обработка ошибок.
app.use((err, req, res, _next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    error: err.message || 'Внутренняя ошибка сервера',
  });
});

// PostgreSQL может стартовать медленнее, чем Express.
// Ждем, пока база станет доступна.
async function waitForDatabase(attempts = 20) {
  for (let i = 1; i <= attempts; i += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      console.log(`Ожидание БД, попытка ${i}/${attempts}: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  throw new Error('Не удалось подключиться к PostgreSQL');
}

let server;

async function start() {
  try {
    await waitForDatabase();

    server = app.listen(PORT, () => {
      console.log(`API запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

start();

// Корректное остановление контейнера.
process.on('SIGTERM', async () => {
  if (server) {
    server.close();
  }

  await pool.end();
  process.exit(0);
});