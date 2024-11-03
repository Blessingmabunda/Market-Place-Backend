const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer'); 
const cors = require('cors');
const serverless = require('serverless-http'); // Import serverless-http

// Import routes
const userRoutes = require('./routes/User');
const productRoutes = require('./routes/Products');
const advertRoutes = require('./routes/Advert');
const messageRoutes = require('./routes/Message');
const ratingsRoutes = require('./routes/Ratings');
const notificationRoutes = require('./routes/Notification');
const notificationSettingsRoutes = require('./routes/Settings');

const app = express();

app.use(cors({
  origin: '*',
}));
app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    fieldSize: 1 * 1024 * 1024,
  }
});

mongoose
  .connect('mongodb+srv://blessie999:Mabunda@blessingapi.vbplv.mongodb.net/blessAPI?retryWrites=true&w=majority&appName=BlessingAPI')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

app.use('/api/user', userRoutes);
app.use('/api/product', productRoutes);
app.use('/api/advert', advertRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/settings', notificationSettingsRoutes);

app.post('/api/upload', upload.any(), (req, res) => {
  console.log('Received fields:', req.body);
  console.log('Received files:', req.files);
  res.send('Files and fields received');
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer Error:', err);
    return res.status(400).send('File or field value too large');
  } else {
    console.error('Server Error:', err);
    return res.status(500).send('An error occurred');
  }
});

module.exports = app;
module.exports.handler = serverless(app); // Export as a serverless function
