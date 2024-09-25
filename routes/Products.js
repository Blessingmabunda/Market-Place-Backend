const express = require('express');
const router = express.Router();
const Product = require('../model/products'); // Import the Product model

// Route to create a new product
router.post('/products', async (req, res) => {
  try {
    const { username, profilePicture, userId, productName, price, location, category, base64Image, phoneNumber } = req.body;

    // Create and save product
    const product = new Product({
      userId,
      productName,
      price,
      location,
      category,
      base64Image,
      username,
      profilePicture,
      phoneNumber // Include the phone number here
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});


// Route to get all products
router.get('/get-all-products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Route to get a single product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Route to update a product by ID
router.put('/products/:id', async (req, res) => {
  try {
    const { name, price, description } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, description },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Route to delete a product by ID
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Route to delete all products
router.delete('/delete-all-products', async (req, res) => {
  try {
    await Product.deleteMany({});
    res.status(200).json({ message: 'All products deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete all products' });
  }
});

module.exports = router;
