const { DataTypes } = require('sequelize');
const sequelize = require('../ds'); // Import the database connection

const User = sequelize.define('User', {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  username: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  profilePicture: { 
    type: DataTypes.STRING 
  },
  loginHistory: { 
    type: DataTypes.JSON // Store login timestamps as JSON array
  }
}, {
  tableName: 'users',
  timestamps: true // Adds createdAt and updatedAt fields
});

// Sync model with database (creates the table if it doesn't exist)
User.sync()
  .then(() => console.log('User table created'))
  .catch(err => console.error('Error creating table:', err));

module.exports = User;
