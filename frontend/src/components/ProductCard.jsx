// ProductCard.jsx — карточка товара.
// Все данные приходят из backend API, то есть из PostgreSQL.

export default function ProductCard({ product, onDelete }) {
  // Запасная картинка, если image_url пустой или не загрузился.
  const fallbackImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='20'%3ENo photo%3C/text%3E%3C/svg%3E";

  const priceFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  });

  return (
    <article className="card">
      <img
        src={product.image_url || fallbackImage}
        alt={product.name}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = fallbackImage;
        }}
      />

      <div className="card-body">
        <span className="badge">{product.category}</span>

        <h3>{product.name}</h3>

        <p>{product.description || 'Описание отсутствует'}</p>

        <div className="card-footer">
          <strong className="price">
            {priceFormatter.format(Number(product.price))}
          </strong>

          <button
            type="button"
            className="danger"
            onClick={() => onDelete(product.id)}
          >
            Удалить
          </button>
        </div>
      </div>
    </article>
  );
}