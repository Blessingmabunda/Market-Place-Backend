const express = require('express');
const router = express.Router();
const ProductPicture = require('../model/productPicture'); // Import the ProductPicture model

// Route to add a product picture
router.post('/product-pictures', async (req, res) => {
    try {
        const { productId, base64 } = req.body;

        // Validate required fields
        if (!productId || !base64) {
            return res.status(400).json({ error: 'Missing productId or base64 data' });
        }

        // Create a new picture using the ProductPicture model
        const newPicture = await ProductPicture.create({ productId, base64 });

        // Respond with success and the saved picture
        res.status(201).json({ message: 'Picture added successfully', picture: newPicture });
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).json({ error: error.message || 'Failed to add picture' });
    }
});

// Route to get all product pictures
router.get('/product-pictures', async (req, res) => {
    try {
        const pictures = await ProductPicture.findAll();
        if (pictures.length === 0) {
            return res.status(404).json({ error: 'No pictures found' });
        }
        res.json(pictures);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve pictures' });
    }
});

// Route to get product pictures by productId
router.get('/product-pictures/product/:productId', async (req, res) => {
    console.log('Requested Product ID:', req.params.productId); // Log the ID for debugging
    try {
        const pictures = await ProductPicture.findAll({ where: { productId: req.params.productId } });
        if (pictures.length === 0) {
            return res.status(404).json({ error: 'No pictures found for this product' });
        }
        res.json(pictures);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve pictures by productId' });
    }
});

// Route to get a product picture by ID
router.get('/product-pictures/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const pictures = await ProductPicture.findAll({
            where: { productId }
        });

        if (pictures.length === 0) {
            return res.status(404).json({ message: 'No pictures found for this product' });
        }

        res.json(pictures);
    } catch (error) {
        console.error('Error fetching product pictures:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to update a product picture
router.put('/product-pictures/:id', async (req, res) => {
    try {
        const { base64 } = req.body;
        const [updated] = await ProductPicture.update({ base64 }, { where: { id: req.params.id } });
        if (updated) {
            const updatedPicture = await ProductPicture.findByPk(req.params.id);
            return res.json({ message: 'Picture updated successfully', picture: updatedPicture });
        }
        throw new Error('Picture not found');
    } catch (error) {
        res.status(500).json({ error: 'Failed to update picture' });
    }
});

// Route to delete a product picture
router.delete('/product-pictures/:id', async (req, res) => {
    try {
        const deleted = await ProductPicture.destroy({ where: { id: req.params.id } });
        if (deleted) {
            return res.json({ message: 'Picture deleted successfully' });
        }
        throw new Error('Picture not found');
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete picture' });
    }
});

// Route to delete all product pictures
router.delete('/product-pictures', async (req, res) => {
    try {
        const deletedCount = await ProductPicture.destroy({ where: {} });
        if (deletedCount > 0) {
            return res.json({ message: 'All pictures deleted successfully' });
        }
        return res.status(404).json({ error: 'No pictures found to delete' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete pictures' });
    }
});

module.exports = router;