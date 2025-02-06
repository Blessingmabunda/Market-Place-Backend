const express = require('express');
const router = express.Router();
const FavouriteProduct = require('../model/favouriteProducts');

// Create a favorite product
router.post('/favorite-products', async (req, res) => {
    try {
      const { userId, productId } = req.body;
  
      // Check if userId and productId are provided
      if (!userId || !productId) {
        return res.status(400).json({ error: 'User ID and Product ID are required' });
      }
  
      // Check if the product is already favorited by the user
      const existingFavorite = await FavouriteProduct.findOne({
        where: { userId, productId },
      });
  
      if (existingFavorite) {
        return res.status(400).json({ error: 'Product is already in favorites' });
      }
  
      // If not, create a new favorite entry
      const favoriteProduct = await FavouriteProduct.create({ userId, productId });
      res.status(201).json({ message: 'Favourite has been added', favoriteProduct });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create favorite product' });
    }
  });

// Get all favorite products
// Get all favorite products
router.get('/favorite-products', async (req, res) => {
    try {
      const favoriteProducts = await FavouriteProduct.findAll();
      res.status(200).json({ message: 'Favorite products retrieved successfully', favoriteProducts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve favorite products' });
    }
  });

// Get favorite products by user ID
router.get('/favorite-products/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const favoriteProducts = await FavouriteProduct.find({ userId });
    res.status(200).json({ message: 'Favorite products retrieved successfully', favoriteProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve favorite products' });
  }
});

// Delete a favorite product
router.delete('/favorite-products/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const deletedProduct = await FavouriteProduct.findOneAndDelete({ productId });
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Favorite product not found' });
    }

    res.status(200).json({ message: 'Favorite product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete favorite product' });
  }
});

module.exports = router;