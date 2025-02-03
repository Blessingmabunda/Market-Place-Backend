const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer'); 
const cors = require('cors'); // Add this line

// Import routes
const userRoutes = require('./routes/User'); 
const productRoutes = require('./routes/Products'); 
const productPictureRoutes = require('./routes/productPicture'); 
const advertRoutes = require('./routes/Advert'); 
const messageRoutes = require('./routes/Messege');
const ratingsRoutes = require('./routes/Ratings');
const notificationRoutes = require('./routes/Notification'); 
const notificationSettingsRoutes = require('./routes/Settings'); 

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(cors({
  origin: '*',  // Temporarily allow all origins (adjust for production)
}));

app.use(express.json({ limit: '1000mb' })); // Increase limit to 10MB
app.use(express.urlencoded({ limit: '100mb', extended: true })); // Parse URL-encoded data

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Set upload destination
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique file name
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit for files
    fieldSize: 1 * 1024 * 1024, // 1 MB limit for form fields
  }
});

// Connect to MongoDB using environment variables for security
mongoose
.connect('mongodb+srv://blessie999:Mabunda@blessingapi.vbplv.mongodb.net/blessAPI?retryWrites=true&w=majority&appName=BlessingAPI', {})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Use routes
app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', productPictureRoutes);
app.use('/api', advertRoutes);
app.use('/api', messageRoutes); 
app.use('/api', ratingsRoutes); 
app.use('/api', notificationRoutes); 
app.use('/api', notificationSettingsRoutes); 

// Example route for file uploads with logging
app.post('/upload', upload.any(), (req, res) => {
  console.log('Received fields:', req.body);
  console.log('Received files:', req.files);
  res.send('Files and fields received');
});

// General error-handling middleware for multer and other errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer Error:', err);
    return res.status(400).send('File or field value too large');
  } else {
    console.error('Server Error:', err);
    return res.status(500).send('An error occurred');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
