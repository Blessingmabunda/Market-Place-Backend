const express = require('express');
const router = express.Router();
const Message = require('../model/messege'); // Corrected model import

// Route to send a message
router.post('/send-messege', async (req, res) => {
  try {
    const { content, sender, recipient } = req.body;

    const newMessage = new Message({ content, sender, recipient });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Route to get messages (optional: filter by recipient, sender, etc.)
router.get('/receive-messages', async (req, res) => {
  try {
    // Optionally, you can filter messages based on parameters
    const { recipient, sender } = req.query;

    const query = {};
    if (recipient) query.recipient = recipient;
    if (sender) query.sender = sender;

    const messages = await Message.find(query);
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

module.exports = router;
