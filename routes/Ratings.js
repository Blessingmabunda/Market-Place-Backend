const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const Rating = require('../model/ratings'); // Adjust path as needed

// Create a new rating
router.post('/add-ratings', async (req, res) => {
    try {
      // Destructure fields from request body
      const { product, rating, comment } = req.body;
  
     
      // Create a new rating
      const newRating = new Rating({
        product,
        rating,
        comment
      });
  
      // Save the rating to the database
      await newRating.save();
  
      // Respond with the newly created rating
      res.status(201).json(newRating);
    } catch (error) {
      // Respond with validation or server error
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Get all ratings
router.get('/ratings', async (req, res) => {
  try {
    const ratings = await Rating.find().populate('product'); // Populate to get product details
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single rating by ID
router.get('/ratings/:id', async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id).populate('product');
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    res.status(200).json(rating);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a rating by ID
router.put('/ratings/:id', async (req, res) => {
  try {
    const rating = await Rating.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    res.status(200).json(rating);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a rating by ID
router.delete('/ratings/:id', async (req, res) => {
  try {
    const rating = await Rating.findByIdAndDelete(req.params.id);
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    res.status(200).json({ message: 'Rating deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get average rating for a product
router.get('/ratings/summary/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;

    const ratingSummary = await Rating.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId) } }, // Match ratings for the specified product
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (ratingSummary.length === 0) {
      return res.status(404).json({ message: 'No ratings found for this product' });
    }

    const summary = ratingSummary[0];
    res.status(200).json({
      productId: summary._id,
      averageRating: summary.averageRating.toFixed(2), // Format to 2 decimal places
      totalRatings: summary.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
