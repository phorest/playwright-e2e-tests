// Not wrapping as a class as using at run time seems a bit odd - maybe easier to import the commands individually but open to conversation on that

export async function retrievePaymentIntent(request, {
  paymentIntentId,
  stripeKey,
  retries = 5,
  interval = 1000
}) {
  console.log(`📢 retrievePaymentIntentBody -->`);
  console.log(`💰 Retrieving details for payment intent ${paymentIntentId}…`);

  const endpoint = `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`;

  for (let attempt = 1; attempt <= retries; attempt++) {

    const response = await request.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
      }
    });

    const status = response.status();
    const paymentIntentResponseBody = await response.json().catch(() => ({}));

    const transferGroup =
      paymentIntentResponseBody?.transfer_group;

    // Checking the transfer group is present to ensure we are able to validate transfers to connected accounts
    // Sometimes the payment intent can be returned too fast and this field is null, which then causes attempts to check transfers to fail

    if (status === 200 && transferGroup) {
      console.log(`✅ Payment intent details retrieved for ${paymentIntentId}`);
      return paymentIntentResponseBody;
    }

    if (attempt < retries) {
      console.log(`⏳ Attempt ${attempt} failed — retrying in ${interval}ms...`);
      await new Promise(res => setTimeout(res, interval));
    } else {
      throw new Error(
        `❌ Failed to retrieve payment intent details for ${paymentIntentId}`
      );
    }
  }
}