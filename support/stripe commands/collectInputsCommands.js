// Not wrapping as a class as using at run time seems a bit odd - maybe easier to import the commands individually but open to conversation on that

export async function simulateDirectTippingInputs(request, {
  terminalId,
  stripeKey,
  retries = 5,
  interval = 1000
}) {
  console.log(`📢 simulateDirectTippingInputs -->`);
  console.log(`👇 Simulate successful customer interaction with terminal for direct tipping prompt`);

  const endpoint = `https://api.stripe.com/v1/test_helpers/terminal/readers/${terminalId}/succeed_input_collection`;

  for (let attempt = 1; attempt <= retries; attempt++) {

    const response = await request.post(endpoint, {
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
      }
    });

    const status = response.status();
    const body = await response.json().catch(() => ({}));

    const action = body?.action;
    const input = action?.collect_inputs?.inputs?.[0];

    const clientChoice = input?.selection?.value;
    const feeToggleStatus = input?.toggles?.[0]?.value;

    // Even in Cypress, there looked to be something causing the clientChoice to fail being read from the API response, will revisit
    if (status === 200 && input) {
      console.log(`✅ Input collection successful: Client chose to tip ${clientChoice} with fee covered toggle set to ${feeToggleStatus}`);
      return
    }

    if (attempt < retries) {
      console.log(`⏳ Attempt ${attempt} failed — retrying in ${interval}ms...`);
      await new Promise(res => setTimeout(res, interval));
    }
      throw new Error(
        `❌ Failed to simulate successful input collection after ${retries} attempts`
      );
    }
}
