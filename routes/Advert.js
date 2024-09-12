const express = require('express');
const router = express.Router();
const multer = require('multer');
const Advert = require('../model/advert'); // Adjust the path to your Advert model

// Configure multer for image uploads
const storage = multer.memoryStorage(); // Store images in memory (you might want to use disk storage)
const upload = multer({ storage: storage });

// Create a new advert
router.post('/add-adverts', upload.single('image'), async (req, res) => {
  try {
    // Extract userId and image from request body and file respectively
    const { userId } = req.body;
    const { image } = req.body;
    
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const advert = new Advert({
      userId,
      image // Assuming the image is Base64-encoded
    });
    
    await advert.save();
    res.status(201).json(advert);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all adverts
router.get('/get-adverts', async (req, res) => {
  try {
    const adverts = await Advert.find();
    res.status(200).json(adverts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single advert by ID
router.get('/get-adverts/:id', async (req, res) => {
  try {
    const advert = await Advert.findById(req.params.id);
    if (!advert) return res.status(404).json({ error: 'Advert not found' });
    res.status(200).json(advert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an advert by ID
router.put('/update-adverts/:id', async (req, res) => {
  try {
    const advert = await Advert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!advert) return res.status(404).json({ error: 'Advert not found' });
    res.status(200).json(advert);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an advert by ID
router.delete('/delete-adverts/:id', async (req, res) => {
  try {
    const advert = await Advert.findByIdAndDelete(req.params.id);
    if (!advert) return res.status(404).json({ error: 'Advert not found' });
    res.status(200).json({ message: 'Advert deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete-adverts-by-user/:userId', async (req, res) => {
  try {
    const result = await Advert.deleteMany({ userId: req.params.userId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'No adverts found for this userId' });
    res.status(200).json({ message: 'Adverts deleted successfully', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
