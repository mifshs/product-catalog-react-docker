-- init.sql — инициализация PostgreSQL.
--
-- Этот скрипт выполняется только при первом создании volume с данными.
-- Если база уже существовала, изменения не применятся автоматически.
--
-- Пересоздать базу:
-- docker compose down -v
-- docker compose up --build

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL DEFAULT 'other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для фильтрации и сортировки.
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);

-- Стартовые товары.
INSERT INTO products (
  id,
  name,
  description,
  image_url,
  price,
  category,
  created_at
)
VALUES
  (
    1,
    'Ноутбук UltraBook 14',
    'Легкий ноутбук для работы и учебы. 16 ГБ ОЗУ, SSD 512 ГБ, экран 14 дюймов.',
    'https://picsum.photos/seed/laptop1/400/300',
    89990.00,
    'laptops',
    NOW() - INTERVAL '3 days'
  ),
  (
    2,
    'Игровой ноутбук PowerGame 16',
    'Мощный ноутбук для игр и монтажа видео. RTX-графика, 32 ГБ ОЗУ.',
    'https://picsum.photos/seed/laptop2/400/300',
    145000.00,
    'laptops',
    NOW() - INTERVAL '2 days'
  ),
  (
    3,
    'Смартфон Nova X',
    'Смартфон с хорошей камерой, AMOLED-экраном и быстрой зарядкой.',
    'https://picsum.photos/seed/phone1/400/300',
    54990.00,
    'phones',
    NOW() - INTERVAL '1 day'
  ),
  (
    4,
    'Беспроводные наушники AirSound',
    'Наушники с активным шумоподавлением и автономностью до 30 часов.',
    'https://picsum.photos/seed/headphones1/400/300',
    12990.00,
    'accessories',
    NOW() - INTERVAL '12 hours'
  ),
  (
    5,
    'Механическая клавиатура TypePro',
    'Компактная клавиатура с горячей заменой переключателей и RGB-подсветкой.',
    'https://picsum.photos/seed/keyboard1/400/300',
    8990.00,
    'accessories',
    NOW() - INTERVAL '6 hours'
  ),
  (
    6,
    'Монитор ProView 27',
    '27-дюймовый монитор, IPS, 144 Гц, идеально для работы и игр.',
    'https://picsum.photos/seed/monitor1/400/300',
    34990.00,
    'monitors',
    NOW() - INTERVAL '2 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- Обновляем последовательность id после вставки фиксированных значений.
SELECT setval(
  pg_get_serial_sequence('products', 'id'),
  COALESCE((SELECT MAX(id) FROM products), 1)
);