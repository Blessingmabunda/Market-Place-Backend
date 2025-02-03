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
  username: {
    type: String
  },
  phoneNumber: {
    type: String,
    required: true
  }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
