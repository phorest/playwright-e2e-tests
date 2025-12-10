// @ts-nocheck
import { test, expect } from "@playwright/test";
import { loginLocators } from "../../locators/login/login.locators.js";
import { paySlideoverLocators } from "../../locators/purchase_slideover.locators.js";
import { testData } from "../../testData/nonTippingUkSalon.js";
import generalCommands from "../../support/generalCommands.js";
import purchasesRequests from "../../support/requests/purchases.requests.js";
import { submitVirtualTerminalCardDetails, submitVisaCardDetails } from "../../support/stripe commands/virtualTerminalCommands.js";

const staffEmail = testData.PAY_SALON.staff[0].email;
const staffPassword = process.env.staffPassword;
const stripeKey = process.env.UK_STRIPE_KEY;

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
  await page.goto('/');
  await page.locator(loginLocators.emailInput).click();
  await page.locator(loginLocators.emailInput).fill(staffEmail);
  await page.locator(loginLocators.passwordInput).click();
  await page.locator(loginLocators.passwordInput).fill(staffPassword);
  await page.locator(loginLocators.signInButton).click();
  await page.waitForURL('**/appointments', { timeout: 15000 });
  await expect(page).toHaveURL(
    "a/" + testData.PAY_SALON.ACCOUNT_ID + "/appointments",
    { timeout: 15000 }
  );
  await page.getByRole('link', { name: 'Purchase' }).click();
  await page.getByPlaceholder('First name').fill('aoife');
  await page.getByRole('button', { name: 'AT Aoife Test' }).click();
  await page.getByRole('button', { name: 'JR Jamie Regressionson' }).click();
  await page.getByRole('button', { name: 'Services' }).click();
  await page.getByRole('button', { name: 'Massage' }).click();
  await page.getByRole('button', { name: 'Neck and Head £65.17 10min' }).click();
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
  console.log(purchaseTotal);
  console.log(purchaseClient);
  console.log(paymentMethodCode);
  console.log(paymentMethodAmount);
  console.log(paymentMethodTransactionId);

  // Validate sales screen data - taken from 
  await page.getByRole('link', { name: 'Manager' }).click();
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
  console.log(paymentText);
  console.log(expected);

  expect(paymentText).toBe(expected);

  // Query the payment intent via Stripe API
  const paymentIntentId = paymentMethodTransactionId
  const paymentIntentResponse = await request.get(
  `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`,
  {
    headers: {
      authorization: `Bearer ${stripeKey}`,
    },
  }
 );

  expect(paymentIntentResponse.ok()).toBeTruthy();
  expect(paymentIntentResponse.status()).toBe(200);

  // Verify the payment intent is at a completed state
  const paymentIntentResponseBody = await paymentIntentResponse.json();
  const paymentIntentStatus = paymentIntentResponseBody.status;
  expect(paymentIntentStatus).toBe('succeeded');
})