const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    trim: true, // Trims any whitespace around the content
  },
  sender: {
    userId: {
      type: String, // Storing userId as a simple string
      required: true, // Ensure the sender's userId is always included
    },
    username: {
      type: String,
      trim: true, // Trims any whitespace around the username
      required: true, // Ensure the sender's username is always included
    }
  },
  recipient: {
    userId: {
      type: String, // Storing recipient userId as a simple string
      required: true, // Ensure the recipient's userId is always included
    },
    username: {
      type: String,
      trim: true, // Trims any whitespace around the username
      required: true, // Ensure the recipient's username is always included
    }
  },
  timestamp: {
    type: Date,
    default: Date.now, // Automatically sets the current date and time
  },
});

// Ensure the model name matches usage throughout the application
module.exports = mongoose.model('Message', messageSchema);
