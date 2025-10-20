// @ts-nocheck
import { test, expect, request } from "@playwright/test";
import { loginLocators } from "../locators/login/login.locators.js";
import { testData } from "../testData/salonData.js";
import generalCommands from "../support/generalCommands.js";

const staffEmail = testData.IRELAND_SALON.staff[0].email;
const staffPassword = process.env.staffPassword;

test("Check login. @login", async ({ page }) => {
  await page.goto("/");
  await page.locator(loginLocators.emailInput).click();
  await page.locator(loginLocators.emailInput).fill(staffEmail);
  await page.locator(loginLocators.passwordInput).click();
  await page.locator(loginLocators.passwordInput).fill(staffPassword);
  await page.locator(loginLocators.signInButton).click();
  await expect(page).toHaveURL(
    "a/" + testData.IRELAND_SALON.ACCOUNT_ID + "/appointments"
  );
});

test("LoginByPass @login @smoke", async ({ page, request }) => {
  await generalCommands.loginByPass(page, request, staffEmail, staffPassword);
  await generalCommands.loadFeatureFlags(page);
});
