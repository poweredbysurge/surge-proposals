#!/usr/bin/env node
// Usage: node scripts/create-invoice.js <client-name> <client-email> <amount-cents> "<description>"
// Example: node scripts/create-invoice.js accuenviro khalidelashi@hotmail.com 500000 "Website Redesign + Digital Build"

require('dotenv').config({ path: `${__dirname}/../.env` });
// Run this script from the surge-proposals root: node scripts/create-invoice.js ...
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_API_KEY);

const [,, clientSlug, email, amountCents, ...descParts] = process.argv;
const description = descParts.join(' ');

if (!clientSlug || !email || !amountCents || !description) {
  console.error('Usage: node create-invoice.js <client-slug> <email> <amount-cents> "<description>"');
  process.exit(1);
}

async function run() {
  // 1. Create or retrieve customer
  const existing = await stripe.customers.list({ email, limit: 1 });
  let customer;

  if (existing.data.length > 0) {
    customer = existing.data[0];
    console.log(`Found existing customer: ${customer.id}`);
  } else {
    customer = await stripe.customers.create({
      email,
      metadata: { client_slug: clientSlug },
    });
    console.log(`Created customer: ${customer.id}`);
  }

  // 2. Create invoice
  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: 'send_invoice',
    days_until_due: 7,
    metadata: { client_slug: clientSlug },
  });

  // 3. Add line item
  await stripe.invoiceItems.create({
    customer: customer.id,
    invoice: invoice.id,
    amount: parseInt(amountCents, 10),
    currency: 'usd',
    description,
  });

  // 4. Finalize — generates hosted_invoice_url WITHOUT emailing the customer.
  // We never call stripe.invoices.sendInvoice(), so no email is sent.
  // Khalid pays only if he clicks the link in the proposal.
  const finalized = await stripe.invoices.finalizeInvoice(invoice.id, {
    auto_advance: false,
  });

  console.log('\n✓ Invoice finalized (no email sent to customer)');
  console.log(`  Invoice ID:   ${finalized.id}`);
  console.log(`  Customer:     ${email}`);
  console.log(`  Amount:       $${(parseInt(amountCents, 10) / 100).toLocaleString()}`);
  console.log(`  Payment URL:  ${finalized.hosted_invoice_url}`);
  console.log(`\nPaste this into proposal.html as the STRIPE_LINK:\n${finalized.hosted_invoice_url}`);
}

run().catch(err => {
  console.error('Stripe error:', err.message);
  process.exit(1);
});
