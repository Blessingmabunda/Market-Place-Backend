const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer'); 
const userRoutes = require('./routes/User'); 
const productRoutes = require('./routes/Products'); 
const advertRoutes = require('./routes/Advert'); 
const messegeRoutes = require('./routes/Messege');
const ratingsRoutes = require('./routes/Ratings');
const notificationRoutes = require('./routes/Notification'); // Adjust the path as needed
const notificationsettingsRoutes = require('./routes/Settings'); 

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // For handling form submissions

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Set upload destination
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Set unique file name
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit for files
    fieldSize: 1 * 1024 * 1024, // 1 MB limit for fields
  }
});

// Connect to MongoDB
mongoose
  .connect('mongodb+srv://blessie999:Mabunda@blessingapi.vbplv.mongodb.net/blessAPI?retryWrites=true&w=majority&appName=BlessingAPI', {})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

app.use('/api', userRoutes); // Use user routes
app.use('/api', productRoutes); // Use product routes
app.use('/api', advertRoutes); // Use advert routes
app.use('/api', messegeRoutes); 
app.use('/api', ratingsRoutes); 
app.use('/api', notificationRoutes); 
app.use('/api', notificationsettingsRoutes); 


// Example route with logging
app.post('/upload', upload.any(), (req, res, next) => {
  console.log('Received fields:', req.body);
  console.log('Received files:', req.files);
  res.send('Files and fields received');
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer Error:', err);
    return res.status(400).send('File or field value too large');
  }
  console.error('Server Error:', err);
  res.status(500).send('An error occurred');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
