const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define('Order_Items', {
    order_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price_per_unit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  }, {
    tableName: 'order_items',
    timestamps: false,
  });

  return OrderItem;
};