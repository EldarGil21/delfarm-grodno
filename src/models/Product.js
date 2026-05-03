// src/models/Product.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Явно указываются внешние ключи, чтобы Sequelize знал их имена в БД
    farm_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING, 
      allowNull: false,
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    // --- ПОЛЕ ДЛЯ КАРТИНКИ ---
    image_url: {
      type: DataTypes.STRING,
      allowNull: true, // Может быть пустым
    }
  }, {
    tableName: 'products', // Точное имя таблицы в PostgreSQL
    timestamps: false,     
  });

  return Product;
};