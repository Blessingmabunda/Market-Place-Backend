const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const cors = require('cors');
const { Sequelize } = require('sequelize');  // Import Sequelize
require('dotenv').config(); // Load environment variables from .env file
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Use environment variable for webhook secret

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
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASS, 
  {
    host: process.env.DB_HOST,
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

// Set up MySQL connection (if you still need it alongside Sequelize)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS, 
  database: process.env.DB_NAME
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

// Payment method 
app.post('/create-payment-link', async (req, res) => {
  const { cart_items, total_amount, user_info, payment_method, order_date } = req.body;

  try {
    const lineItems = [];

    for (const item of cart_items) {
      const product = await stripe.products.create({
        name: item.name,
        description: item.category,
        images: [item.imageBase64],
        metadata: { location: item.location }, // Metadata stored in Product
      });

      const price = await stripe.prices.create({
        unit_amount: item.price * 100, // Convert price to cents
        currency: 'zar',
        product: product.id,
      });

      lineItems.push({
        price: price.id,
        quantity: item.quantity,
      });
    }

    // **Attach metadata to the PaymentIntent**
 const paymentLink = await stripe.paymentLinks.create({
  line_items: lineItems,
  metadata: {
    user_id: user_info.user_id,
    name: user_info.name,
    total_amount: total_amount.toString(),
    order_date: order_date,
    cart_summary: JSON.stringify(cart_items),
  },
});


    res.json({ paymentLink: paymentLink.url });
  } catch (err) {
    console.error('Error creating payment link:', err);
    res.status(500).json({ error: 'Failed to create payment link' });
  }
});
app.get('/get-all-payment-links-metadata', async (req, res) => {
  try {
    // List all payment links
    // You can add optional parameters like limit
    const paymentLinks = await stripe.paymentLinks.list({
      limit: 100, // Adjust as needed
    });
    
    // Extract metadata from each payment link
    const metadataCollection = paymentLinks.data.map(link => ({
      id: link.id,
      url: link.url,
      metadata: link.metadata
    }));
    
    res.json({ paymentLinks: metadataCollection });
  } catch (err) {
    console.error('Error retrieving payment links:', err);
    res.status(500).json({ error: 'Failed to retrieve payment links metadata' });
  }
});
app.get('/get-payment-links-by-user', async (req, res) => {
  try {
    const { userId } = req.query;

    // Fetch all Payment Links
    const allPaymentLinks = await stripe.paymentLinks.list({ limit: 100 });

    // Filter links by user ID in metadata
    const userPaymentLinks = allPaymentLinks.data.filter(link => 
      link.metadata && link.metadata.user_id === userId
    );

    // Fetch payment status for each Payment Link
    const paymentData = await Promise.all(
      userPaymentLinks.map(async (link) => {
        // Fetch Checkout Sessions related to this Payment Link
        const checkoutSessions = await stripe.checkout.sessions.list({
          payment_link: link.id,
          limit: 1, // Get the most recent session
        });

        let paymentStatus = 'unknown';

        if (checkoutSessions.data.length > 0) {
          const session = checkoutSessions.data[0];

          if (session.payment_intent) {
            // Retrieve the Payment Intent status
            const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
            paymentStatus = paymentIntent.status;
          }
        }

        return {
          id: link.id,
          url: link.url,
          active: link.active,
          created: link.created,
          metadata: link.metadata,
          cart_summary: JSON.parse(link.metadata.cart_summary || '[]'),
          order_date: link.metadata.order_date,
          total_amount: link.metadata.total_amount,
          payment_status: paymentStatus,
        };
      })
    );

    res.json({ paymentLinks: paymentData });
  } catch (err) {
    console.error('Error fetching payment links:', err);
    res.status(500).json({ error: 'Failed to retrieve payment links' });
  }
});

app.get('/get-payment-links-by-user', async (req, res) => {
  try {
    // Get userId from query parameter
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }
    
    // List all payment links
    const paymentLinks = await stripe.paymentLinks.list({
      limit: 100, // Adjust as needed
    });
    
    // Filter links by user_id in metadata (note the underscore)
    const userPaymentLinks = paymentLinks.data.filter(link => 
      link.metadata && link.metadata.user_id === userId
    );
    
    // Extract relevant data including cart summary
    const metadataCollection = userPaymentLinks.map(link => {
      // Safely handle cart_summary parsing
      let cartSummary = [];
      try {
        if (link.metadata.cart_summary) {
          cartSummary = JSON.parse(link.metadata.cart_summary);
        }
      } catch (e) {
        console.error('Error parsing cart_summary:', e);
        cartSummary = link.metadata.cart_summary; // Keep as string if parsing fails
      }
      
      // Safe date formatting
      let createdDate = null;
      try {
        if (link.created) {
          createdDate = new Date(link.created * 1000).toISOString();
        }
      } catch (e) {
        console.error('Error formatting date:', e);
        createdDate = link.created; // Keep original value if conversion fails
      }
      
      return {
        id: link.id,
        url: link.url,
        active: link.active,
        created: createdDate,
        metadata: link.metadata,
        cart_summary: cartSummary,
        order_date: link.metadata.order_date,
        total_amount: link.metadata.total_amount
      };
    });
    
    res.json({ paymentLinks: metadataCollection });
  } catch (err) {
    console.error('Error retrieving payment links:', err);
    res.status(500).json({ error: 'Failed to retrieve payment links for user', message: err.message });
  }
});

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Log the event to verify it's being called
  console.log('Received event:', event);

  // Handle the event as usual
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Handle the event for successful payment
      console.log('Payment Intent Succeeded:', event.data.object);
      break;
    case 'payment_intent.payment_failed':
      // Handle the event for failed payment
      console.log('Payment Intent Failed:', event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Acknowledge receipt of the event
  res.json({ received: true });
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
