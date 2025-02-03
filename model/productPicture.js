const mongoose = require('mongoose');

const productPictureSchema = new mongoose.Schema({
  productId: {
    type: String,  // simple string instead of ObjectId
    required: true,  // productId is required
  },
  base64: {
    type: String,
    required: true,  // base64 string is required
  },
});

module.exports = mongoose.model('ProductPicture', productPictureSchema);
