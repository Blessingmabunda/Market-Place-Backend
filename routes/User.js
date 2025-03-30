const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User'); // Path remains the same

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, profilePicture } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      profilePicture,
      loginHistory: [] // Initialize with empty array
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('User already registered ', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // MongoDB find syntax
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update login history
    user.loginHistory.push(new Date());
    await user.save();

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.id,
      username: user.username,
      profilePicture: user.profilePicture,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get Login History Route
router.get('/login-history/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select('loginHistory');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ loginHistory: user.loginHistory });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching login history', error });
  }
});

// Get All Users Route
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Delete All Users Route
router.delete('/users', async (req, res) => {
  try {
    await User.deleteMany({});
    res.status(200).json({ message: 'All users deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting users', error });
  }
});

// Change Password Route
router.put('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    // In a real application, you would send the reset token to the user's email here

    res.status(200).json({ message: 'Password reset token generated', resetToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  const { resetToken, newPassword, confirmPassword } = req.body;

  try {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    const decoded = jwt.verify(resetToken, 'your_jwt_secret');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update Profile Route
router.put('/updateProfile', async (req, res) => {
  try {
    const { id, username, email, profilePicture } = req.body;

    // Validate request body
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields if provided in the request body
    if (username) user.username = username;
    if (email) user.email = email;
    if (profilePicture) user.profilePicture = profilePicture;

    // Save the updated user data
    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Profile Picture Route
router.get('/profile-picture/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Fetch user by ID
    const user = await User.findById(userId).select('profilePicture');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the profile picture URL (or path)
    return res.status(200).json({
      profilePicture: user.profilePicture || 'No profile picture available'
    });
  } catch (err) {
    console.error('Error fetching profile picture:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;