const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    order_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending_payment', 'paid', 'confirmed', 'delivering', 'completed', 'cancelled'),
      defaultValue: 'pending_payment',
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return Order;
};