const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userId: { type: String, required: true, trim: true },
  productName: { type: String, trim: true },
  price: { type: Number },
  category: { type: String, trim: true },
  location: { type: String, trim: true },
  image: { type: String } // Base64-encoded image string
});

module.exports = mongoose.model('Product', productSchema);
