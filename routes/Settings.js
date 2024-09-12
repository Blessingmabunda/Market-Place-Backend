const express = require('express');
const router = express.Router();
const Notification = require('../model/settings');

// Create or update notification settings for a user
router.post('/settings', async (req, res) => {
  try {
    const { userId, emailNotifications, smsNotifications, pushNotifications, emailFrequency, smsFrequency, pushFrequency } = req.body;

    // Check if settings already exist for the user
    let settings = await Notification.findOne({ userId });

    if (settings) {
      // Update existing settings
      settings.emailNotifications = emailNotifications;
      settings.smsNotifications = smsNotifications;
      settings.pushNotifications = pushNotifications;
      settings.emailFrequency = emailFrequency;
      settings.smsFrequency = smsFrequency;
      settings.pushFrequency = pushFrequency;
      settings.lastUpdated = Date.now();
    } else {
      // Create new settings
      settings = new Notification({
        userId,
        emailNotifications,
        smsNotifications,
        pushNotifications,
        emailFrequency,
        smsFrequency,
        pushFrequency
      });
    }

    // Save settings
    await settings.save();
    res.status(200).json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get notification settings for a user
router.get('/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const settings = await Notification.findOne({ userId });

    if (settings) {
      res.status(200).json(settings);
    } else {
      res.status(404).json({ message: 'Settings not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete notification settings for a user
router.delete('/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await Notification.deleteOne({ userId });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Settings deleted' });
    } else {
      res.status(404).json({ message: 'Settings not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
