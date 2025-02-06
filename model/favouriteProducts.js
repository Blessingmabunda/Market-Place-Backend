const { DataTypes } = require('sequelize');
const sequelize = require('../ds');

const FavouriteProduct = sequelize.define('FavouriteProduct', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    productId: {
      type: DataTypes.INTEGER,
    },
  }, {
    tableName: 'FavouriteProduct',
  timestamps: false,
  force: true, // Add this option
  });

module.exports = FavouriteProduct;