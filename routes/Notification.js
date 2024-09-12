// notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../model/notification');

// Create a new notification
router.post('/notifications', async (req, res) => {
  try {
    const { message, messageId, userId } = req.body;
    const notification = new Notification({ message, messageId, userId });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.status(200).json(notifications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a specific notification by ID
router.get('/notifications/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a notification by ID
router.put('/notifications/:id', async (req, res) => {
  try {
    const { message, messageId, userId, read } = req.body;
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { message, messageId, userId, read },
      { new: true, runValidators: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a notification by ID
router.delete('/notifications/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
