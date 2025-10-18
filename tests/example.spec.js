// @ts-nocheck
import { test, expect } from '@playwright/test';
const staffEmail = process.env.staffEmail
const staffPassword = process.env.staffPassword

test('Check login', async ({ page }) => {
  await page.goto('/');
  await page.locator("[name='email']").click()
  await page.locator("[name='email']").fill(staffEmail);
  await page.locator("[name='password']").click()
  await page.locator("[name='password']").fill(staffPassword)
  await page.locator("[name='sign-in-button']").click()
});