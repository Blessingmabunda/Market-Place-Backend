const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    trim: true, // Trims any whitespace around the content
  },
  sender: {
    type: String,
    trim: true, 
  },
  recipient: {
    type: String,
    trim: true, 
  },
  timestamp: {
    type: Date,
    default: Date.now, // Automatically sets the current date and time
  },
});

// Ensure the model name matches usage throughout the application
module.exports = mongoose.model('Message', messageSchema);
