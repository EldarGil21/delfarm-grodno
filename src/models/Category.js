// src/models/Category.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true, 
    }
  }, {
    tableName: 'categories', 
    timestamps: false,       
  });

  return Category;
};