const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for Notification Settings
const notificationSettingsSchema = new Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true,
    unique: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  emailFrequency: {
    type: String,
    enum: ['immediate', 'daily', 'weekly'],
    default: 'immediate'
  },
  smsFrequency: {
    type: String,
    enum: ['immediate', 'daily', 'weekly'],
    default: 'daily'
  },
  pushFrequency: {
    type: String,
    enum: ['immediate', 'daily', 'weekly'],
    default: 'immediate'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create a model from the schema
const NotificationSettings = mongoose.model('NotificationSettings', notificationSettingsSchema);

module.exports = NotificationSettings;
