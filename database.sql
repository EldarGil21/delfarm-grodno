/*
 * SQL Schema for DelFarm
 * Based on Course Work: Chapter 2.3 "Logical Database Model Design"
 * Database: PostgreSQL
 */

-- 1. Очистка базы данных от предыдущих версий таблиц и типов
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS farms CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS farm_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

-- 2. Создание ENUM типов (Перечисления)

CREATE TYPE user_role AS ENUM ('client', 'farmer', 'admin');
COMMENT ON TYPE user_role IS 'Роли пользователей: Клиент, Фермер, Администратор';

CREATE TYPE farm_status AS ENUM ('pending', 'approved', 'rejected');
COMMENT ON TYPE farm_status IS 'Статус верификации фермерского хозяйства';

CREATE TYPE order_status AS ENUM ('pending_payment', 'paid', 'confirmed', 'delivering', 'completed', 'cancelled');
COMMENT ON TYPE order_status IS 'Жизненный цикл заказа';

-- 3. Создание таблиц

-- Таблица: Users (Пользователи)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    role user_role NOT NULL DEFAULT 'client',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Хранит основную информацию о всех зарегистрированных пользователях';
COMMENT ON COLUMN users.email IS 'Используется как логин';

-- Таблица: Farms (Фермерские хозяйства)
CREATE TABLE farms (
    farm_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    farm_name VARCHAR(150) NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    status farm_status NOT NULL DEFAULT 'pending',
    CONSTRAINT fk_farm_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

COMMENT ON TABLE farms IS 'Расширенная информация о профиле фермера-партнера';
COMMENT ON COLUMN farms.status IS 'Статус проверки администратором';

-- Таблица: Addresses (Адреса доставки)
CREATE TABLE addresses (
    address_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    CONSTRAINT fk_address_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

COMMENT ON TABLE addresses IS 'Адреса доставки, привязанные к профилям клиентов';

-- Таблица: Categories (Категории товаров)
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INTEGER, -- Ссылка на родительскую категорию для иерархии
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

COMMENT ON TABLE categories IS 'Справочник для классификации продукции (иерархический)';

-- Таблица: Products (Товары)
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    farm_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    unit VARCHAR(20) NOT NULL, -- например: 'кг', 'литр', 'шт'
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    CONSTRAINT fk_product_farm FOREIGN KEY (farm_id) REFERENCES farms(farm_id) ON DELETE CASCADE,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT
);

COMMENT ON TABLE products IS 'Информация о товарах, выставленных фермерами';
COMMENT ON COLUMN products.stock_quantity IS 'Доступное количество на складе';

-- Таблица: Orders (Заказы)
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- Клиент
    address_id INTEGER NOT NULL, -- Адрес доставки
    status order_status NOT NULL DEFAULT 'pending_payment',
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_order_address FOREIGN KEY (address_id) REFERENCES addresses(address_id) ON DELETE RESTRICT
);

COMMENT ON TABLE orders IS 'Информация о заказах';

-- Таблица: Order_Items (Позиции заказа)
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_per_unit DECIMAL(10, 2) NOT NULL, -- Цена на момент покупки (историчность данных)
    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL
);

COMMENT ON TABLE order_items IS 'Связующая таблица (состав заказа)';
COMMENT ON COLUMN order_items.price_per_unit IS 'Фиксируем цену товара на момент оформления заказа';

-- Таблица: Reviews (Отзывы)
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

COMMENT ON TABLE reviews IS 'Отзывы и оценки клиентов к товарам';