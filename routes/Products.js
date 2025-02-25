const express = require('express');
const router = express.Router();
const Product = require('../model/products'); // Import the Product model
const sequelize = require('../ds');

// ✅ Route to create a new product
router.post('/products', async (req, res) => {
  try {
    const { username, userId, productName, price, location, category, phoneNumber } = req.body;

    // ✅ Correct Sequelize create method
    const product = await Product.create({
      userId,
      productName,
      price,
      location,
      category,
      username,
      phoneNumber
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// ✅ Route to get all products
router.get('/get-all-products', async (req, res) => {
  try {
    const products = await Product.findAll();  // ✅ Fixed to use findAll()
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

// ✅ Route to get a product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);  // ✅ Fixed to use findByPk()
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
    const { productName, price, location, category, phoneNumber } = req.body;

    const [updatedRows] = await Product.update(
      { productName, price, location, category, phoneNumber },
      { where: { id: req.params.id } }  // ✅ Fixed to use where
    );

    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Product not found or no changes made' });
    }

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// ✅ Route to delete a product by ID
router.delete('/products/:id', async (req, res) => {
  try {
    const deletedRows = await Product.destroy({ where: { id: req.params.id } });  // ✅ Fixed to use destroy()
    
    if (deletedRows === 0) {
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
    await Product.destroy({ where: {} });  // ✅ Fixed to use destroy()
    res.status(200).json({ message: 'All products deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete all products' });
  }
});

// ✅ Route to get products by userId
router.get('/products/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    const products = await Product.findAll({ where: { userId } });

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
    const { productName, price, location, category, phoneNumber } = req.body;
    const userId = parseInt(req.params.userId, 10);

    const [updatedRows] = await Product.update(
      { productName, price, location, category, phoneNumber },
      { where: { userId } }  // ✅ Fixed to use where
    );

    if (updatedRows === 0) {
      return res.status(404).json({ error: 'No products found for this user or no changes made' });
    }

    res.status(200).json({ message: 'Products updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update products by userId' });
  }
});

module.exports = router;
