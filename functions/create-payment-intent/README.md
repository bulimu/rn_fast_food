# Stripe Payment Intent Function

This Appwrite function creates a Stripe PaymentIntent for processing payments.

## Setup

1. **Environment Variables**
   Set the following environment variable in your Appwrite function:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with `sk_`)

2. **Deploy the function**
   ```bash
   # Install dependencies
   cd functions/create-payment-intent
   npm install
   
   # Deploy using Appwrite CLI
   appwrite functions deploy --function-id=create-payment-intent
   ```

3. **Function Configuration**
   - Runtime: `node-18.0`
   - Entrypoint: `src/main.js`
   - Execute Access: `users` (authenticated users only)

## Usage

This function expects a JSON payload with:
- `amount`: The payment amount in cents (e.g., 1000 for $10.00)
- `currency`: The currency code (default: 'usd')

Returns:
- `success`: Boolean indicating success
- `clientSecret`: Stripe client secret for frontend payment processing
- `id`: PaymentIntent ID for tracking

## Testing

You can test this function using the Appwrite Console or by calling it from your app:

```javascript
const result = await functions.createExecution(
  'create-payment-intent',
  JSON.stringify({ amount: 1000, currency: 'usd' })
);
```
