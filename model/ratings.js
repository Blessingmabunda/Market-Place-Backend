const { DataTypes } = require('sequelize');
const sequelize = require('../ds');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
      isInt: true
    }
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: true
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: false,
  tableName: 'ratings'
});

module.exports = Rating;