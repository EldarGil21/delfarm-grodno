const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Address = sequelize.define('Address', {
    address_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    address_line: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'addresses',
    timestamps: false,
  });

  return Address;
};