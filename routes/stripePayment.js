const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent() {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // amount in cents
      currency: 'usd',
      payment_method_types: ['card'],
    });

    console.log(paymentIntent);
  } catch (err) {
    console.error(err);
  }
}

createPaymentIntent();