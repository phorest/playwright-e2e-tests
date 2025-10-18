// @ts-nocheck
import { test, expect, request } from '@playwright/test';
import { loginLocators } from '../locators/login/login.locators.js';
import { Salon } from '../testData/salonData.js';
import generalCommands from '../support/generalCommands.js';

const staffEmail = process.env.staffEmail;
const staffPassword = process.env.staffPassword;

test('Check login. @login', async ({ page }) => {
  await page.goto('/');
  await page.locator(loginLocators.emailInput).click();
  await page.locator(loginLocators.emailInput).fill(staffEmail);
  await page.locator(loginLocators.passwordInput).click();
  await page.locator(loginLocators.passwordInput).fill(staffPassword);
  await page.locator(loginLocators.signInButton).click();
  await expect(page).toHaveURL('a/' + Salon.ACCOUNT_ID + '/appointments');
});

test('LoginByPass @login', async ({ page, request }) => {

await generalCommands.loginAPI(page, request)
await generalCommands.loadFeatureFlags(page);

});