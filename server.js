const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const cors = require('cors');
const { Sequelize } = require('sequelize');  // Import Sequelize
require('dotenv').config(); // Load environment variables from .env file
// const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');
// require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Import routes
const userRoutes = require('./routes/User'); 
const productRoutes = require('./routes/Products'); 
const productPictureRoutes = require('./routes/productPicture'); 
const advertRoutes = require('./routes/Advert'); 
const messageRoutes = require('./routes/Messege');
const ratingsRoutes = require('./routes/Ratings');
const notificationRoutes = require('./routes/Notification'); 
const notificationSettingsRoutes = require('./routes/Settings'); 
const FavouriteProduct = require('./routes/favouriteProducts'); 
const app = express();

// Middleware
app.use(cors({ origin: '*' })); // Adjust for production security
app.use(express.json({ limit: '100000mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Set up Sequelize connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'Blessing', 
  process.env.DB_USER || 'root', 
  process.env.DB_PASS || 'Mabunda@99', 
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
  }
);

// Sync the database (ensure models are defined before this step)
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced');
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });

// Set up MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'Mabunda@99', // Set your MySQL password
  database: process.env.DB_NAME || 'Blessing'
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024, fieldSize: 1 * 1024 * 1024 }
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
app.use('/api', FavouriteProduct);

//payment method 

app.post('/create-payment-link', async (req, res) => {
  const { cart_items, total_amount, user_info, payment_method, order_date } = req.body;

  try {
    // Create line items for each cart item
    const lineItems = [];

    // For each item, create the corresponding Stripe product and price
    for (const item of cart_items) {
      // Create a product for each item with metadata
      const product = await stripe.products.create({
        name: item.name,
        description: item.category,
        images: [item.imageBase64],
        metadata: { location: item.location }, // Adding location as metadata
      });

      // Create a price for each item
      const price = await stripe.prices.create({
        unit_amount: item.price * 100, // Convert price to cents
        currency: 'zar',
        product: product.id,
      });

      // Push the line item with the corresponding price ID and quantity
      lineItems.push({
        price: price.id,
        quantity: item.quantity,
      });
    }

    // Create a payment link with multiple line items (cart items)
    const paymentLink = await stripe.paymentLinks.create({
      line_items: lineItems,
    });

    // Send response with the payment link URL
    res.json({
      paymentLink: paymentLink.url, // This is the actual Stripe payment link
    });
  } catch (err) {
    console.error('Error creating payment link:', err);
    res.status(500).json({ error: 'Failed to create payment link' });
  }
});







// Example API Route using MySQL
app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

// File upload route
app.post('/upload', upload.any(), (req, res) => {
  console.log('Received fields:', req.body);
  console.log('Received files:', req.files);
  res.send('Files and fields received');
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  return res.status(500).send('An error occurred');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
