const express = require('express');
const sequelize = require('../ds'); // Remove the destructuring
const router = express.Router();
const { Op } = require('sequelize');
const Rating = require('../model/ratings');

// Create a new rating
router.post('/add-ratings', async (req, res) => {
    try {
        // Destructure fields from request body
        const { product, rating, comment, image } = req.body;

        // Create a new rating
        const newRating = await Rating.create({
            product,
            rating,
            comment,
            image,
        });

        // Respond with the newly created rating
        res.status(201).json(newRating);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all ratings
router.get('/ratings', async (req, res) => {
    try {
      const ratings = await Rating.findAll();
      res.status(200).json(ratings); // Return ratings in the response
    } catch (error) {
      console.error('Error fetching ratings:', error);
      res.status(500).json({ error: 'An error occurred while fetching ratings' });
    }
  });

// Get a single rating by ID
router.get('/ratings/:id', async (req, res) => {
    try {
        const rating = await Rating.findByPk(req.params.id);
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
        const [updated] = await Rating.update(req.body, {
            where: { id: req.params.id },
        });
        if (!updated) {
            return res.status(404).json({ error: 'Rating not found' });
        }
        const updatedRating = await Rating.findByPk(req.params.id);
        res.status(200).json(updatedRating);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a rating by ID
router.delete('/ratings/:id', async (req, res) => {
    try {
        const deleted = await Rating.destroy({ where: { id: req.params.id } });
        if (!deleted) {
            return res.status(404).json({ error: 'Rating not found' });
        }
        res.status(200).json({ message: 'Rating deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete all ratings
router.delete('/ratings', async (req, res) => {
    try {
        await Rating.destroy({ where: {} }); // Deletes all ratings
        res.status(200).json({ message: 'All ratings deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add this before your routes
sequelize.authenticate()
  .then(() => console.log('Database connection successful'))
  .catch(err => console.error('Database connection error:', err));


router.get('/ratings/stats/:product', async (req, res) => {
    try {
        const productStats = await Rating.findAll({
            where: {
                product: req.params.product
            },
            attributes: [
                [sequelize.fn('MAX', sequelize.col('rating')), 'highestRating'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings'],
                [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
            ]
        });

        // If no ratings found for the product
        if (!productStats[0].dataValues.totalRatings) {
            return res.status(404).json({
                error: 'No ratings found for this product'
            });
        }

        // Format the response
        const stats = {
            product: req.params.product,
            highestRating: parseFloat(productStats[0].dataValues.highestRating),
            totalRatings: parseInt(productStats[0].dataValues.totalRatings),
            averageRating: parseFloat(productStats[0].dataValues.averageRating).toFixed(1)
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching rating statistics:', error);
        res.status(500).json({
            error: 'An error occurred while fetching rating statistics'
        });
    }
});

module.exports = router;