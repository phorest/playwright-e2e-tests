// @ts-nocheck
import { test, expect, request  } from "@playwright/test";
import { loginLocators } from "../../locators/login/login.locators.js";
import { paySlideoverLocators } from "../../locators/purchase_slideover.locators.js";
import { testData } from "../../testData/colmPaySalonData.js";
import generalCommands from "../../support/generalCommands.js";
import { simulateVisaCardPresentment, simulateCardPresentment } from "../../support/stripe commands/cardPresentmentCommands.js";

const staffEmail = testData.PAY_SALON.staff[0].email;;
const staffPassword = process.env.staffPassword;
const terminalId = testData.PAY_SALON.TERMINAL_ID;
const stripeKey = testData.PAY_SALON.STRIPE_KEY

test("Process card present sale. @integratedPurchase", async ({ page, request }) => {
  await page.goto('/');
  await page.locator(loginLocators.emailInput).click();
  await page.locator(loginLocators.emailInput).fill(staffEmail);
  await page.locator(loginLocators.passwordInput).click();
  await page.locator(loginLocators.passwordInput).fill(staffPassword);
  await page.locator(loginLocators.signInButton).click();
  await expect(page).toHaveURL(
    "a/" + testData.PAY_SALON.ACCOUNT_ID + "/appointments"
  );
  await page.getByRole('link', { name: 'Purchase' }).click();
  await page.getByRole('button', { name: 'Walk in' }).click();
  await page.getByRole('button', { name: 'JR Jamie Regressionson' }).click();
  await page.getByRole('button', { name: 'Services' }).click();
  await page.getByRole('button', { name: 'Massage' }).click();
  await page.getByRole('button', { name: 'Deep Tissue £89.49 30min' }).click();
  await page.getByRole('button', { name: 'Pay', exact: true }).click();
  await page.locator(paySlideoverLocators.cardPresentButton).click();
  await page.locator(paySlideoverLocators.completePaymentButton).click();
  await expect(page.getByText('Follow the instructions on the terminal')).toBeVisible();
  
  // Uses Stripe simulated terminal to simulate card presentment via Stripe API
const paymentIntentId = await simulateVisaCardPresentment(request, {
    terminalId: terminalId,
    stripeKey: stripeKey,
    retries: 5,
    interval: 1000
  });

 await expect(page.getByText('Sale complete!')).toBeVisible();

  // Query the payment intent via Stripe API
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