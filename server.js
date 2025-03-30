const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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

// MongoDB connection using mongoose
mongoose.connect('mongodb+srv://blessie999:Mabunda@blessingapi.vbplv.mongodb.net/blessAPI?retryWrites=true&w=majority&appName=BlessingAPI', {})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
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