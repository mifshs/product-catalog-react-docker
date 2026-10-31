// products.js — REST API для товаров.
//
// Реализовано:
// GET    /api/products      — список товаров с поиском, фильтром и сортировкой
// GET    /api/products/:id  — один товар
// POST   /api/products      — добавить товар
// DELETE /api/products/:id  — удалить товар
//
// Все данные читаются и пишутся в PostgreSQL.

import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// Белый список сортировок.
// ORDER BY нельзя безопасно параметризовать как обычный SQL-параметр,
// поэтому разрешаем только известные варианты.
const SORT_MAP = {
  newest: 'created_at DESC, id DESC',
  price_asc: 'price ASC, id ASC',
  price_desc: 'price DESC, id DESC',
  name_asc: 'lower(name) ASC, id ASC',
};

// PostgreSQL возвращает numeric как строку.
// Приводим цену к числу для удобной работы на фронтенде.
function formatProduct(row) {
  return {
    ...row,
    price: Number(row.price),
  };
}

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const category = String(req.query.category || '').trim();
    const sort = String(req.query.sort || 'newest');
    const limitRaw = Number.parseInt(req.query.limit, 10);
    const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 50 : limitRaw, 1), 100);

    const conditions = [];
    const params = [];
    let index = 1;

    // Поиск по названию, описанию и категории.
    if (q) {
      conditions.push(
        `(name ILIKE $${index} OR description ILIKE $${index} OR category ILIKE $${index})`
      );
      params.push(`%${q}%`);
      index += 1;
    }

    // Фильтр по категории.
    if (category && category !== 'all') {
      conditions.push(`category = $${index}`);
      params.push(category);
      index += 1;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderBy = SORT_MAP[sort] || SORT_MAP.newest;

    params.push(limit);

    const sql = `
      SELECT
        id,
        name,
        description,
        image_url,
        price,
        category,
        created_at
      FROM products
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${index}
    `;

    const result = await query(sql, params);

    res.json(result.rows.map(formatProduct));
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Некорректный id товара' });
    }

    const result = await query(
      `
        SELECT
          id,
          name,
          description,
          image_url,
          price,
          category,
          created_at
        FROM products
        WHERE id = $1
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    res.json(formatProduct(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

// POST /api/products
router.post('/', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const description = String(req.body.description || '').trim();
    const imageUrl = String(req.body.image_url || '').trim();
    const category = String(req.body.category || 'other').trim() || 'other';
    const price = Number(req.body.price);

    if (!name) {
      return res.status(400).json({ error: 'Поле name обязательно' });
    }

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        error: 'Поле price должно быть числом больше или равным 0',
      });
    }

    // Если изображение не передано, используем placeholder.
    const finalImageUrl =
      imageUrl || `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI0HAbrkZVnhnxTv2DUXeEhWiYoJt-vTfDEKD06dZ3q9y4-Y9OAvn3Hw2g&s=10`;

    const result = await query(
      `
        INSERT INTO products (
          name,
          description,
          image_url,
          price,
          category
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          name,
          description,
          image_url,
          price,
          category,
          created_at
      `,
      [name, description, finalImageUrl, price.toFixed(2), category]
    );

    res.status(201).json(formatProduct(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Некорректный id товара' });
    }

    const result = await query(
      `
        DELETE FROM products
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    res.json({
      deleted: true,
      id: result.rows[0].id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;