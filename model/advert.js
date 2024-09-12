const mongoose = require('mongoose');

// Define the Advert schema
const advertSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  image: {
    type: String, // Store the Base64-encoded image string here
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 24 * 60 * 60 * 1000, // Set expiration time to 24 hours after creation
    index: { expires: '1s' } // Mongoose TTL index to automatically delete expired documents
  }
});

// Create the Advert model
const Advert = mongoose.model('Advert', advertSchema);

module.exports = Advert;
