const express = require('express');
const router = express.Router();
const Product = require('../model/products');  // Import the Product model
const ProductPicture = require('../model/productPicture'); 

// Route to add a product picture
router.post('/product-pictures', async (req, res) => {
    try {
        const { productId, base64 } = req.body;

        // Create a new picture with the provided productId and base64
        const newPicture = new ProductPicture({ productId, base64 });
        await newPicture.save();

        // Respond with a success message and the saved picture
        res.status(201).json({ message: 'Picture added successfully', picture: newPicture });
    } catch (error) {
        console.error(error);  // Log the actual error for debugging
        res.status(500).json({ error: 'Failed to add picture' });
    }
});


// Route to get a product picture by ID
router.get('/product-pictures/:id', async (req, res) => {
    try {
        const picture = await ProductPicture.findById(req.params.id);
        if (!picture) {
            return res.status(404).json({ error: 'Picture not found' });
        }
        res.json(picture);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve picture' });
    }
});

// Route to update a product picture
router.put('/product-pictures/:id', async (req, res) => {
    try {
        const { base64 } = req.body;
        const updatedPicture = await ProductPicture.findByIdAndUpdate(
            req.params.id,
            { base64 },
            { new: true }
        );
        if (!updatedPicture) {
            return res.status(404).json({ error: 'Picture not found' });
        }
        res.json({ message: 'Picture updated successfully', picture: updatedPicture });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update picture' });
    }
});

// Route to delete a product picture
router.delete('/product-pictures/:id', async (req, res) => {
    try {
        const deletedPicture = await ProductPicture.findByIdAndDelete(req.params.id);
        if (!deletedPicture) {
            return res.status(404).json({ error: 'Picture not found' });
        }
        res.json({ message: 'Picture deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete picture' });
    }
});

module.exports = router;
