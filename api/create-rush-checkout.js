import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_API_KEY) {
    return res.status(500).json({ error: 'Payment is not configured' });
  }

  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const origin = `${proto}://${host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      client_reference_id: 'rush-delivery',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 400000,
            recurring: { interval: 'month' },
            product_data: {
              name: 'Rush & Delivery Growth Partnership',
              description: 'Website, local SEO, content, and paid media management. Advertising spend is separate.',
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          client: 'Rush & Delivery Attorney Services',
          signed_by: name,
          initial_commitment_months: '3',
        },
      },
      allow_promotion_codes: false,
      billing_address_collection: 'auto',
      success_url: `${origin}/rush-delivery?payment=success`,
      cancel_url: `${origin}/rush-delivery?payment=cancelled`,
      metadata: {
        proposal: 'Rush & Delivery Growth Partnership',
        signed_by: name,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout error:', error);
    return res.status(500).json({ error: 'Could not start secure payment' });
  }
}

