const Stripe = require('stripe');


// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async ({ req, res, log, error }) => {
  try {
    // Parse the request body
    const { 
      amount, 
      currency = 'usd',
      orderId,
      customerEmail 
    } = JSON.parse(req.bodyRaw || '{}');

    // Validate the amount
    if (!amount || amount <= 0) {
      return res.json({
        success: false,
        error: 'Invalid amount'
      }, 400);
    }

    log(`Creating payment intent for amount: ${amount} ${currency}, order: ${orderId}`);

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: customerEmail,
      metadata: {
        integration_check: 'accept_a_payment',
        app_name: 'FastFood',
        order_id: orderId || 'unknown'
      }
    });

    log(`Payment intent created: ${paymentIntent.id}`);

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (err) {
    error('Error creating payment intent:', err);
    
    return res.json({
      success: false,
      error: err.message || 'Failed to create payment intent'
    }, 500);
  }
};
