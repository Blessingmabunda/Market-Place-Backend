const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User'); // Correct path to User model

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
    const user = await User.findOne({
      where: { email } // Added where clause for Sequelize
    });

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
      { id: user.id, email: user.email, username: user.username }, // Sequelize uses 'id' instead of '_id'
      'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.id.toString(),
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
    const user = await User.findById(userId).select('loginHistory'); // Only select the loginHistory field
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
    const users = await User.find({}).select('-password'); // Exclude the password field
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Delete All Users Route
router.delete('/users', async (req, res) => {
  try {
    await User.deleteMany({}); // Deletes all users from the database
    res.status(200).json({ message: 'All users deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting users', error });
  }
});

// Change Password Route
router.post('/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword, confirmPassword } = req.body;

  try {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// Update User Profile Route
router.put('/update-profile', async (req, res) => {
  const { userId, username, email, profilePicture } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user properties
    if (username) user.username = username;
    if (email) user.email = email;
    if (profilePicture) user.profilePicture = profilePicture; // Store as string

    await user.save();

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
});

// Get Profile Picture by User ID Route
router.get('/profile-picture/:userId', async (req, res) => {
  const { userId } = req.params;

  // Check if userId is a valid number (since it's an INTEGER in your model)
  if (isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const user = await User.findByPk(userId, {
      attributes: ['profilePicture'], // Only fetch the profilePicture field
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ profilePicture: user.profilePicture });
  } catch (error) {
    console.error('Error fetching profile picture:', error); // Log the full error
    res.status(500).json({ message: 'Error fetching profile picture', error: error.message }); // Include error message in response
  }
});

module.exports = router;