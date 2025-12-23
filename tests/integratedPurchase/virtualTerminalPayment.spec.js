// @ts-nocheck
import { test, expect } from "@playwright/test";
import { loginLocators } from "../../locators/login/login.locators.js";
import { paySlideoverLocators } from "../../locators/purchase_slideover.locators.js";
import { testData } from "../../testData/ukNonTippingSalon.js";
import generalCommands from "../../support/generalCommands.js";
import purchasesRequests from "../../support/requests/purchases.requests.js";
import { submitVirtualTerminalCardDetails, submitVisaCardDetails } from "../../support/stripe commands/virtualTerminalCommands.js";
import { retrievePaymentIntent } from "../../support/stripe commands/paymentIntent.js";

const staffEmail = testData.PAY_SALON.staff[0].email;
const staffPassword = process.env.staffPassword;
const stripeKey = testData.PAY_SALON.STRIPE_KEY;
const salonConnectedAccountId = testData.PAY_SALON.SALON_CONNECTED_ACCOUNT_ID
const storedCardPercentageFee = testData.PAY_SALON.STORED_CARD_PERCENTAGE_FEE
const storedCardFlatFee = testData.PAY_SALON.STORED_CARD_FLAT_FEE
const vatRate = testData.PAY_SALON.SALON_VAT_RATE

// Helper function
const getCurrentDate = () => {
  return new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  )
    .toJSON()
    .slice(0, 10);
};

test("Process virtual terminal sale. @integratedPurchase", async ({ page, request }) => {
  // await page.goto('/');

  // Below steps will be updated once custom commands for login bypass, random staff, random client, random service are ported over to Playwright
  // await page.locator(loginLocators.emailInput).click();
  // await page.locator(loginLocators.emailInput).fill(staffEmail);
  // await page.locator(loginLocators.passwordInput).click();
  // await page.locator(loginLocators.passwordInput).fill(staffPassword);
  // await page.locator(loginLocators.signInButton).click();
  // await page.waitForURL('**/appointments', { timeout: 15000 });
  // await expect(page).toHaveURL(
  //   "a/" + testData.PAY_SALON.ACCOUNT_ID + "/appointments",
  //   { timeout: 15000 }
  // );
  await generalCommands.loginByPass(page, request, staffEmail, staffPassword);
  await generalCommands.loadFeatureFlags(page);
  await page.locator('#main-nav-purchase-link').click();
  await page.getByPlaceholder('First name').fill('aoife');
  await page.getByRole('button', { name: 'AT Aoife Test' }).click();
  await page.getByRole('button', { name: 'JR Jamie Regressionson' }).click();
  await page.getByRole('button', { name: 'Services' }).click();
  await page.getByRole('button', { name: 'Massage' }).click();
  await page.getByRole('button', { name: 'Neck and Head £65.17 30min' }).click();
  await page.getByRole('button', { name: 'Pay', exact: true }).click();
  await page.locator(paySlideoverLocators.cardPresentButton).click();

  // Enter payment details on Stripe iFrame
  await page.locator(paySlideoverLocators.virtualTerminalPayment).click();

  await submitVisaCardDetails(page, {})
  
  await expect(page.getByText('Sale complete!')).toBeVisible();
  await page.locator(paySlideoverLocators.closePaymentButton).click();

  const token = await generalCommands.getAccessToken(page);
  const filterDate = String(getCurrentDate())

  // Execute request to retrieve purchase data for today
  const purchasesResponse = await purchasesRequests.retrieveMostRecentPurchase(request, token, filterDate);
  
  // Assert data has been returned
  expect(purchasesResponse.ok()).toBeTruthy();
  expect(purchasesResponse.status()).toBe(200);

  // Purchase data extraction to be used for validations (just commented out logging to avoid congestion in console)
  const todaysPurchases = await purchasesResponse.json();
  // console.log(todaysPurchases);
  const mostRecentPurchase = todaysPurchases.data.purchases.edges[0].node
  // console.log(mostRecentPurchase);
  const purchaseTotal = Number(mostRecentPurchase.totalAmount)
  const purchaseClient = mostRecentPurchase.clientName
  const paymentMethodCode = mostRecentPurchase.payments[0].code
  const paymentMethodAmount =  Number(mostRecentPurchase.payments[0].amount)
  const paymentMethodTransactionId =  mostRecentPurchase.payments[0].cardTransactions[0].transactionId
  
  // Printing required validation data to console
  console.log('The purchase total is '+ purchaseTotal);
  console.log('The purchase client is '+ purchaseClient);
  console.log('The payment method code is '+ paymentMethodCode);
  console.log('The payment method amount is '+ paymentMethodAmount);
  console.log('The payment method transaction ID is '+ paymentMethodTransactionId);

  // Validate sales screen data - taken from 
  await page.locator('#main-nav-manager-link').click();
  await page.locator("#sales").click();
  const table = page.locator('table');
  await expect(table).toBeVisible(); // Putting await so that table validation doesn't fire prior to table actually being visible
  const headers = table.locator('thead tr th');

  const headerCount = await headers.count();
  let paymentIndex = -1;

  for (let i = 0; i < headerCount; i++) {
    const text = (await headers.nth(i).innerText()).trim();
    if (text === 'Payment') {
      paymentIndex = i;
      break;
    }
  };

  if (paymentIndex === -1) {
    throw new Error('Could not find "Payment" column in the table header');
  };

  const clientRow = table.locator('tbody tr', {
    has: page.locator('td', { hasText: purchaseClient }),
  });

  const paymentText = (await clientRow.locator('td').nth(paymentIndex).innerText()).trim();
  const expected = `${paymentMethodCode}(${Number(paymentMethodAmount).toFixed(2)})`;
  console.log('The displayed purchase screen payment details are '+ paymentText);
  console.log('The expected purchase screen payment details are '+ expected);
  expect(paymentText).toBe(expected);


  // Uses Stripe simulated terminal to simulate card presentment via Stripe API
  const paymentIntentId = paymentMethodTransactionId
  const paymentIntentResponseBody = await retrievePaymentIntent(request, {
    paymentIntentId: paymentIntentId,
    stripeKey: stripeKey,
    retries: 5,
    interval: 1000
  });

  // Verify the payment intent details
  expect(paymentIntentResponseBody.status).toBe('succeeded');
  const transferGroup = paymentIntentResponseBody.transfer_group;
  const paymentTotal = Number(paymentIntentResponseBody.amount);


  // Query the transfer data via Stripe API
  const connectedAccountTransferData = await request.get(
  `https://api.stripe.com/v1/transfers`,
  {
    params:{
    "destination": salonConnectedAccountId,
    "transfer_group": transferGroup
    },
    headers: {
      authorization: `Bearer ${stripeKey}`,
    }
  }
 );

  // Capture transfer data returned from Stripe
  expect(connectedAccountTransferData.ok()).toBeTruthy();
  expect(connectedAccountTransferData.status()).toBe(200);
  const connectedAccountTransferResponseBody = await connectedAccountTransferData.json();
  const transferAmount = Number(connectedAccountTransferResponseBody.data[0].amount);
  const grossPaymentProcessingFee = Number(connectedAccountTransferResponseBody.data[0].metadata.grossPaymentProcessingFee);
  const netPaymentProcessingFee = Number(connectedAccountTransferResponseBody.data[0].metadata.netPaymentProcessingFee);


  // Manually calculate fees using purchase total retrieved from purchase data query
  const calculatedPercentageProcessingFee = Math.round(((purchaseTotal / 100) * storedCardPercentageFee) * 100) / 100;
  const calculatedNetPaymentProcessingFee = Math.round((calculatedPercentageProcessingFee + storedCardFlatFee) * 100) / 100;
  const calculatedGrossPaymentProcessingFee = Math.round((((calculatedNetPaymentProcessingFee / 100) * vatRate) + calculatedNetPaymentProcessingFee) * 100) / 100;

  // Verify manually calculated fees equal Stripe calculated fees
  expect(netPaymentProcessingFee).toEqual(calculatedNetPaymentProcessingFee);
  expect(grossPaymentProcessingFee).toEqual(calculatedGrossPaymentProcessingFee);
  console.log('The manually calculated gross payment processing fee is ' + calculatedGrossPaymentProcessingFee);
  console.log('The Stripe calculated gross payment processing fee is ' + grossPaymentProcessingFee);

  // Manually calculate transfer amount
  const calculatedTransferAmount = Number(purchaseTotal - calculatedGrossPaymentProcessingFee)
  const roundedTransferAmount = Number(Math.round(calculatedTransferAmount * 100) / 100).toFixed(2)
  const adjustedCalculatedTransferAmount = Number(String(roundedTransferAmount).replace(/['.]/g, ''))

  // Verify manually calculated transfer amount equals Stripe calculated transfer amount
  expect(adjustedCalculatedTransferAmount).toEqual(transferAmount)
  console.log('The manually calculated transfer amount is ' + adjustedCalculatedTransferAmount);
  console.log('The Stripe calculated transfer amount is ' + transferAmount);
})