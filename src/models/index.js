const sequelize = require('../config/db');


// 1. ИМПОРТ ФУНКЦИЙ ОПРЕДЕЛЕНИЯ МОДЕЛЕЙ

const defineUser = require('./User');
const defineFarm = require('./Farm');
const defineCategory = require('./Category');
const defineProduct = require('./Product');
const defineAddress = require('./Address');
const defineOrder = require('./Order');
const defineOrderItem = require('./OrderItem');
const defineReview = require('./Review');


// 2. ИНИЦИАЛИЗАЦИЯ МОДЕЛЕЙ

const User = defineUser(sequelize);
const Farm = defineFarm(sequelize);
const Category = defineCategory(sequelize);
const Product = defineProduct(sequelize);
const Address = defineAddress(sequelize);
const Order = defineOrder(sequelize);
const Order_Items = defineOrderItem(sequelize);
const Review = defineReview(sequelize);


// 3. НАСТРОЙКА СВЯЗЕЙ (ASSOCIATIONS)

// --- Профиль и Ферма ---
User.hasOne(Farm, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Farm.belongsTo(User, { foreignKey: 'user_id' });

// --- Ферма и Товары ---
Farm.hasMany(Product, { foreignKey: 'farm_id', onDelete: 'CASCADE' });
Product.belongsTo(Farm, { foreignKey: 'farm_id' });

// --- Категории и Товары ---
Category.hasMany(Product, { foreignKey: 'category_id', onDelete: 'RESTRICT' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

// --- Иерархия Категорий (Родитель -> Ребенок) ---
Category.hasMany(Category, { as: 'children', foreignKey: 'parent_id' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parent_id' });

// --- Пользователь и Адреса доставки ---
User.hasMany(Address, { foreignKey: 'user_id' });
Address.belongsTo(User, { foreignKey: 'user_id' });

// --- Пользователь и Заказы ---
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

// --- Заказ и Адрес ---
Address.hasMany(Order, { foreignKey: 'address_id' });
Order.belongsTo(Address, { foreignKey: 'address_id' });

// --- Заказ и Позиции заказа (Order Items) ---
Order.hasMany(Order_Items, { foreignKey: 'order_id' });
Order_Items.belongsTo(Order, { foreignKey: 'order_id' });

// --- Товар и Позиции заказа ---
Product.hasMany(Order_Items, { foreignKey: 'product_id' });
Order_Items.belongsTo(Product, { foreignKey: 'product_id' });

// --- СВЯЗИ ДЛЯ ОТЗЫВОВ ---

// Товар и Отзывы (У товара много отзывов)
Product.hasMany(Review, { foreignKey: 'product_id', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'product_id' });

// Пользователь и Отзывы (Один пользователь может оставить много отзывов)
User.hasMany(Review, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'user_id' });


// 4. ЭКСПОРТ

const db = {
  sequelize,
  Sequelize: sequelize.Sequelize,
  User,
  Farm,
  Category,
  Product,
  Address,
  Order,
  Order_Items,
  Review 
};

module.exports = db;