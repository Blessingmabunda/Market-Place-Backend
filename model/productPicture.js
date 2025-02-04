const { DataTypes } = require('sequelize');
const sequelize = require('../ds'); // Import the database connection

const ProductPicture = sequelize.define('ProductPicture', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,  // Assuming productId is required
    },
    base64: {
        type: DataTypes.TEXT, // Use TEXT for larger data (base64)
        allowNull: false,     // Make base64 required for this case
    },
}, {
    tableName: 'ProductPicture', // Ensure the table name matches
    timestamps: true,             // Enable automatic createdAt and updatedAt management
    createdAt: 'createdAt',       // Custom name for createdAt column (optional)
    updatedAt: 'updatedAt',       // Custom name for updatedAt column (optional)
});

module.exports = ProductPicture;
