// ProductForm.jsx — форма добавления товара.
//
// Форма не пишет в базу напрямую.
// Она передает данные в App.jsx, а App.jsx вызывает POST /api/products.

import { useState } from 'react';

const initialForm = {
  name: '',
  description: '',
  image_url: '',
  price: '',
  category: 'laptops',
};

export default function ProductForm({ onCreate, busy }) {
  const [form, setForm] = useState(initialForm);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await onCreate(form);

      setForm({
        ...initialForm,
        category: form.category,
      });
    } catch {
      // Ошибка уже отображается в App.jsx.
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h2>Добавить товар</h2>

      <label>
        Название
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Например: Ноутбук UltraBook 14"
          required
        />
      </label>

      <label>
        Описание
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Краткое описание товара"
          rows="3"
        />
      </label>

      <label>
        Ссылка на изображение
        <input
          name="image_url"
          type="url"
          value={form.image_url}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />
      </label>

      <label>
        Цена
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={handleChange}
          placeholder="9990.00"
          required
        />
      </label>

      <label>
        Категория
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="laptops">Ноутбуки</option>
          <option value="phones">Смартфоны</option>
          <option value="accessories">Аксессуары</option>
          <option value="monitors">Мониторы</option>
          <option value="other">Другое</option>
        </select>
      </label>

      <button type="submit" disabled={busy}>
        {busy ? 'Сохранение...' : 'Добавить'}
      </button>
    </form>
  );
}