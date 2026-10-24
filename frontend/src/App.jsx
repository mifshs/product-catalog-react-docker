// App.jsx — главный компонент каталога.
//
// Логика:
// 1. React вызывает getProducts().
// 2. getProducts() делает fetch на /api/products.
// 3. Express читает товары из PostgreSQL.
// 4. React получает JSON и рисует карточки.
// 5. Добавление и удаление тоже идут через backend API.

import { useCallback, useEffect, useState } from 'react';
import ProductCard from './components/ProductCard.jsx';
import ProductForm from './components/ProductForm.jsx';
import { createProduct, deleteProduct, getProducts } from './api.js';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    q: '',
    category: 'all',
    sort: 'newest',
  });

  const [categories, setCategories] = useState([
    'all',
    'laptops',
    'phones',
    'accessories',
    'monitors',
    'other',
  ]);

  // Загрузка товаров с учетом фильтров.
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getProducts({
        q: filters.q,
        category: filters.category === 'all' ? '' : filters.category,
        sort: filters.sort,
      });

      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Примитивный debounce: ждем 250 мс после изменения фильтров.
  useEffect(() => {
    const timer = setTimeout(loadProducts, 250);

    return () => clearTimeout(timer);
  }, [loadProducts]);

  // Добавляем новые категории, если преподаватель вставит товар с другой категорией напрямую в БД.
  useEffect(() => {
    setCategories((prev) => {
      const next = new Set(prev);

      products.forEach((product) => {
        if (product.category) {
          next.add(product.category);
        }
      });

      return Array.from(next);
    });
  }, [products]);

  async function handleCreate(formValues) {
    setSaving(true);
    setError('');

    try {
      const created = await createProduct({
        name: formValues.name,
        description: formValues.description,
        image_url: formValues.image_url,
        price: Number(formValues.price),
        category: formValues.category,
      });

      setProducts((prev) => [created, ...prev]);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Удалить товар?');

    if (!confirmed) {
      return;
    }

    setError('');

    try {
      await deleteProduct(id);

      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function updateFilter(name, value) {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Каталог компьютерной техники</h1>
        <p>
          Товары хранятся в PostgreSQL, обрабатываются Express API
          и отображаются React-фронтендом.
        </p>
      </header>

      <section className="controls">
        <input
          value={filters.q}
          onChange={(event) => updateFilter('q', event.target.value)}
          placeholder="Поиск по названию или описанию"
        />

        <select
          value={filters.category}
          onChange={(event) => updateFilter('category', event.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'all' ? 'Все категории' : category}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(event) => updateFilter('sort', event.target.value)}
        >
          <option value="newest">Сначала новые</option>
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
          <option value="name_asc">Название: А–Я</option>
        </select>
      </section>

      {error && <div className="error">{error}</div>}

      <ProductForm onCreate={handleCreate} busy={saving} />

      <main>
        {loading ? (
          <div className="empty">Загрузка товаров...</div>
        ) : products.length === 0 ? (
          <div className="empty">Товары не найдены</div>
        ) : (
          <div className="grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}