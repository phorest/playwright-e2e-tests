// Not wrapping as a class as using at run time seems a bit odd - maybe easier to import the commands individually but open to conversation on that

export async function simulateCardPresentment(request, {
  terminalId,
  stripeKey,
  cardNumber,
  cardType,
  retries = 5,
  interval = 1000
}) {
  console.log(`📢 simulate${cardType}CardPresentment -->`);
  console.log(`💳 Presenting ${cardType} card number to simulated terminal…`);

  const endpoint = `https://api.stripe.com/v1/test_helpers/terminal/readers/${terminalId}/present_payment_method`;

  for (let attempt = 1; attempt <= retries; attempt++) {

    const response = await request.post(endpoint, {
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        type: 'card_present',
        'card_present[number]': cardNumber
      }
    });

    const status = response.status();
    const body = await response.json().catch(() => ({}));

    const paymentIntent =
      body?.action?.process_payment_intent?.payment_intent;

    if (status === 200 && paymentIntent) {
      console.log(`✅ Payment intent processed: ${paymentIntent}`);
      return paymentIntent;
    }

    if (attempt < retries) {
      console.log(`⏳ Attempt ${attempt} failed — retrying in ${interval}ms...`);
      await new Promise(res => setTimeout(res, interval));
    } else {
      throw new Error(
        `❌ Failed to simulate ${cardType} card presentment after ${retries} attempts`
      );
    }
  }
}

export async function simulateVisaCardPresentment(request, options = {}) {
  return simulateCardPresentment(request, {
    ...options,
    cardNumber: '4242424242424242',
    cardType: 'VISA'
  });
}

export async function simulateAmexCardPresentment(request, options = {}) {
  return simulateCardPresentment(request, {
    ...options,
    cardNumber: '378282246310005',
    cardType: 'AMEX'
  });
}