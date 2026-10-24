// api.js — слой общения React с backend.
//
// Главная идея:
// React не хранит товары в коде.
// Все товары запрашиваются через HTTP API.
//
// В Docker Nginx проксирует /api в Express.
// Поэтому здесь используется относительный путь /api.

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Универсальная fetch-функция.
async function request(path, options = {}) {
  const { headers, ...rest } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `HTTP ошибка ${response.status}`);
  }

  return data;
}

// Получить список товаров.
export function getProducts(params = {}) {
  const searchParams = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );

  const queryString = searchParams.toString();

  return request(`/products${queryString ? `?${queryString}` : ''}`);
}

// Создать товар.
export function createProduct(payload) {
  return request('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Удалить товар.
export function deleteProduct(id) {
  return request(`/products/${id}`, {
    method: 'DELETE',
  });
}