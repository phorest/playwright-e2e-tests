// @ts-nocheck
import { test, expect, request  } from "@playwright/test";
import { loginLocators } from "../../locators/login/login.locators.js";
import { paySlideoverLocators } from "../../locators/purchase_slideover.locators.js";
import { testData } from "../../testData/colmPaySalonData.js";
import generalCommands from "../../support/generalCommands.js";

const staffEmail = testData.PAY_SALON.staff[0].email;;
const staffPassword = process.env.staffPassword;

test("Process virtual terminal sale. @integratedPurchase", async ({ page, request }) => {
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

  // Enter payment details on Stripe iFrame
  await page.locator(paySlideoverLocators.virtualTerminalPayment).click();
  const cardNumberEntry = page.locator(paySlideoverLocators.stripeIframe).contentFrame().locator(paySlideoverLocators.cardNumberInput);
  await cardNumberEntry.type('4242424242424242');
  const expiryDateEntry = page.locator(paySlideoverLocators.stripeIframe).contentFrame().locator(paySlideoverLocators.expiryDateInput);
  await expiryDateEntry.type('09/29');
  const cvcEntry = page.locator(paySlideoverLocators.stripeIframe).contentFrame().locator(paySlideoverLocators.cvcInputField);
  await cvcEntry.type('600');


  await page.locator(paySlideoverLocators.completePaymentButton).click();
  await expect(page.getByText('Sale complete!')).toBeVisible();
})