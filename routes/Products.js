const express = require('express');
const router = express.Router();
const Product = require('../model/products'); // Import the Product model

// ✅ Route to create a new product
router.post('/products', async (req, res) => {
  try {
    const { username, userId, productName, price, location, category, phoneNumber, base64 } = req.body;
    const product = new Product({
      userId,
      productName,
      price,
      location,
      category,
      username,
      phoneNumber,
      base64
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// ✅ Route to get all products
router.get('/get-all-products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

// ✅ Route to get a product by ID
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

// ✅ Route to update a product by ID
router.put('/products/:id', async (req, res) => {
  try {
    const { productName, price, location, category, phoneNumber, base64 } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, {
      productName,
      price,
      location,
      category,
      phoneNumber,
      base64
    }, { new: true });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or no changes made' });
    }

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// ✅ Route to delete a product by ID
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

// ✅ Route to delete all products
router.delete('/delete-all-products', async (req, res) => {
  try {
    await Product.deleteMany();
    res.status(200).json({ message: 'All products deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete all products' });
  }
});

// ✅ Route to get products by userId
router.get('/products/user/:userId', async (req, res) => {
  try {
    const products = await Product.find({ userId: req.params.userId });
    if (products.length === 0) {
      return res.status(404).json({ error: 'No products found for this user.' });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products by userId:', error);
    res.status(500).json({ error: 'Failed to fetch products by userId' });
  }
});

// ✅ Route to update products by userId
router.put('/products/user/:userId', async (req, res) => {
  try {
    const { productName, price, location, category, phoneNumber, base64 } = req.body;
    const products = await Product.updateMany(
      { userId: req.params.userId },
      { productName, price, location, category, phoneNumber, base64 }
    );
    if (products.matchedCount === 0) {
      return res.status(404).json({ error: 'No products found for this user or no changes made' });
    }
    res.status(200).json({ message: 'Products updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update products by userId' });
  }
});

// Function to compress base64 image
const compressBase64 = async (base64String) => {
  try {
      const buffer = Buffer.from(base64String, 'base64');
      const compressedBuffer = await sharp(buffer)
          .resize({ width: 500 }) // Adjust width as needed
          .jpeg({ quality: 50 }) // Adjust quality as needed
          .toBuffer();
      return compressedBuffer.toString('base64');
  } catch (error) {
      console.error('Error compressing image:', error);
      return base64String; // Return original if compression fails
  }
};

// GET products by category (only productName, price, and compressed base64)
router.get('/products/category/:category', async (req, res) => {
  try {
      const { category } = req.params;
      let products = await Product.find({ category }).select('productName price base64');
      
      // Compress base64 images
      products = await Promise.all(products.map(async (product) => {
          if (product.base64) {
              product.base64 = await compressBase64(product.base64);
          }
          return product;
      }));
      
      res.json(products);
  } catch (error) {
      res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
