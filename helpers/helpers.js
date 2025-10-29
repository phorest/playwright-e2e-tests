/**
 * Helper functions - JavaScript version of helpers.py
 */

import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

/**
 * Navigate to a specific page element
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} linkName - Name of the link to click
 * @param {number} timeout - Timeout in milliseconds
 */
export async function navigateTo(page, linkName, timeout = 6000) {
  try {
    await page.waitForFunction("!location.pathname.includes('/login')", { timeout });
  } catch (error) {
    // Ignore timeout
  }

  const toggle = page.locator("button[name='toggle-main-nav-button']");
  if (await toggle.count() > 0 && await toggle.isVisible()) {
    const isOpen = (
      (await toggle.locator("svg.rotate-180").count()) > 0 ||
      (await toggle.locator("span:has-text('Collapse')").count()) > 0
    );
    if (!isOpen) {
      await toggle.click();
    }
  }

  const link = page.getByRole("link", { name: linkName });
  await expect(link).toBeVisible({ timeout });
  await link.click();
}

/**
 * Get random email
 * @param {number} length - Email length
 * @returns {string} Random email
 */
export function getRandomEmail(length) {
  const randomUuid = uuidv4().substring(0, length);
  return `${randomUuid}@example.com`;
}

/**
 * Get random string
 * @param {number} length - String length
 * @returns {string} Random string
 */
export function getRandomString(length) {
  const randomUuid = uuidv4();
  const randomString = randomUuid.split('-').join('');
  return randomString.substring(0, length);
}

/**
 * Get random full name
 * @returns {string} Random full name
 */
export function getRandomFullName() {
  const firstNames = ["John", "Jane", "Alex", "Emily", "Chris", "Anna", "Mike", "Olivia", "David", "Sophia", "Mateusz", "Bruce", "Brad"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Martinez", "Wilson", "Willis", "Pitt"];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const randomNumber = Math.floor(Math.random() * 90000) + 100;

  return `${firstName} ${lastName} ${randomNumber}`;
}

/**
 * Get random phone number
 * @returns {string} Random phone number
 */
export function getRandomPhoneNumber() {
  const prefix = "174";
  const randomDigits = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('');
  return prefix + randomDigits;
}

/**
 * Turn on all feature flags and return to appointment screen
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
export async function turnOnAllFeatureFlagsAndReturnToAppointmentScreen(page) {
  await page.getByRole("link", { name: "Feature Flags" }).click();
  await page.getByRole("checkbox", { name: "flags visible below" }).click();
  await page.getByRole("link", { name: "Appointments" }).click();
}
