const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../model/products'); // Adjust the path if needed

// Configure multer for file uploads (with memory storage to keep file in memory)
const storage = multer.memoryStorage(); // Store file in memory instead of on disk
const upload = multer({ storage: storage });

// Add a product with Base64 image upload
router.post('/add-products', upload.single('image'), async (req, res) => {
  try {
    const { userId, productName, price, category, location, image } = req.body;

   

    const newProduct = new Product({
      userId,
      productName,
      price,
      category,
      location,
      image, // Store the Base64-encoded image
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Other routes (e.g., get, update, delete)
router.get('/all-products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single product by ID
router.get('/products-byid/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products by user ID
router.get('/products-by-user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const products = await Product.find({ userId: userId });

    if (products.length === 0) return res.status(404).json({ message: 'No products found for this user' });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a product by ID
router.put('/update-product/:id', async (req, res) => {
  try {
    const { productName, price, category, location, image } = req.body;

    // Validate the base64 string (basic check for format)
    if (image && !image.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image format. Must be a base64-encoded image.' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { productName, price, category, location, image },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a product by ID
router.delete('/delete-product/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete products by user ID
router.delete('/delete-products-by-user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await Product.deleteMany({ userId: userId });

    if (result.deletedCount === 0) return res.status(404).json({ message: 'No products found for this user' });
    res.status(200).json({ message: 'Products deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
