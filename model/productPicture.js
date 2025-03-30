const mongoose = require('mongoose');

const ProductPictureSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
        required: true,
    },
    base64: {
        type: String, // Base64 data as a string
        required: true,
    },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const ProductPicture = mongoose.model('ProductPicture', ProductPictureSchema);

module.exports = ProductPicture;
