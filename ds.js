const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql'
});

// Test Connection
sequelize.authenticate()
  .then(() => console.log('Connected to MySQL database'))
  .catch(err => console.error('Error connecting to MySQL:', err));

module.exports = sequelize;
