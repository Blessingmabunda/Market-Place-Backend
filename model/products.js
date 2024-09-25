const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true 
  },
  productName: {
    type: String,
    required: true 
  },
  price: {
    type: String,
    required: true 
  },
  location: {
    type: String
  },
  category: {
    type: String
  },
  base64Image: {
    type: String
  },
  username: {
    type: String
  },
  profilePicture: {
    type: String
  },
  phoneNumber: {
    type: String, // You can use String type for the phone number
    required: true // Optional: If phone number is mandatory, set this to true
  }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
