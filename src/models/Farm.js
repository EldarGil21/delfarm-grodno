// src/models/Farm.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Farm = sequelize.define('Farm', {
    farm_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Связь 1:1 с пользователем
    },
    farm_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    logo_url: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    }
  }, {
    tableName: 'farms',
    timestamps: false, 
  });

  return Farm;
};