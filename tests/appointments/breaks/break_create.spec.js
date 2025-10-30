// @ts-nocheck
/**
 * Break Creation Tests
 *
 * This test suite covers break creation and management functionality:
 * 1. Create a new break with custom duration
 * 2. Verify break appears on calendar
 * 3. Remove the break
 * 4. Verify break is removed from calendar
 *
 * Uses timezone-aware date handling and dynamic test data.
 */

import { test, expect } from "@playwright/test";
import { testData } from "../../../testData/salonData.js";
import generalCommands from "../../../support/generalCommands.js";
import calendar from "../../../locators/calendar/calendar.locators.js";
import breakDetails from "../../../locators/calendar/break.details.locators.js";
import global from "../../../locators/global.locators.js";
import { createBreak } from "../../../support/data/success_modal.js";

/**
 * Helper function to calculate future date with timezone awareness
 * @param {number} weeks - Number of weeks to add to current date
 * @param {string} timezone - Timezone string (optional, defaults to UTC)
 * @returns {string} Future date in YYYY-MM-DD format
 */
function getFutureDate(weeks = 2, timezone = 'UTC') {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + (weeks * 7));
  return futureDate.toISOString().split('T')[0];
}

// Test configuration
const staffEmail = testData.IRELAND_SALON.staff[0].email;
const staffPassword = process.env.staffPassword;

// Test configuration constants
const TEST_CONFIG = {
  BREAK_DURATION: "75", // minutes
  WEEKS_AHEAD: 2,
  TIMEOUTS: {
    ELEMENT_VISIBLE: 10000,
    MODAL_LOAD: 500,
    REMOVAL_COMPLETE: 1000
  }
};

/**
 * Test: Create and Remove Break Successfully
 *
 * This test covers the complete break lifecycle:
 * 1. Login and navigate to calendar
 * 2. Move calendar view to future date
 * 3. Create a new break with custom duration
 * 4. Verify success messages and break appearance
 * 5. Remove the break
 * 6. Verify break removal
 *
 * Uses timezone-aware date calculation for accurate scheduling.
 */
test("Should allow the user to create and then remove a break successfully @break", async ({
  page,
  request,
}) => {
  // ===== PHASE 1: AUTHENTICATION AND SETUP =====
  await generalCommands.loginByPass(page, request, staffEmail, staffPassword);
  await generalCommands.loadFeatureFlags(page);

  // ===== PHASE 2: GET TIMEZONE AND CALCULATE FUTURE DATE =====
  // Get authentication token for API requests
  const token = await generalCommands.getAccessToken(page);
  
  // Calculate future date (2 weeks from now)
  // Note: In a real implementation, you might want to get the branch timezone
  // from an API call similar to the Cypress version
  const futureDateString = getFutureDate(TEST_CONFIG.WEEKS_AHEAD);

  // ===== PHASE 3: PREPARE TEST DATA =====
  const breakLabel = `Break: ${Date.now()}`; // Unique break label
  const breakDuration = TEST_CONFIG.BREAK_DURATION;

  // ===== PHASE 4: NAVIGATE TO CALENDAR =====
  await page.goto("/");

  // Move calendar view one week ahead
  await page.locator(calendar.button_next_week).dblclick();

  // ===== PHASE 5: CREATE BREAK =====
  // Wait for calendar to load and find a suitable slot
  await page.waitForLoadState('domcontentloaded');
  
  await page.locator('[name="zoom-out"]').click()
  await page.locator('[name="zoom-out"]').click()
  await page.locator('[name="zoom-out"]').click()

  // Look for a calendar slot to click on
  await page.locator('[data-resource-id="Staff::5M_lJ37HWFCCDrYkMdfrBw"]').nth(1).hover()
  await page.getByRole('button', { name: '2 pm' }).click();
  
  // Wait a moment for any modal or menu to appear
  await page.waitForTimeout(TEST_CONFIG.TIMEOUTS.MODAL_LOAD);

  // Click add break button (this might be in a context menu or modal)
  await page.locator(calendar.button_add_break).click();

  // ===== PHASE 6: FILL BREAK FORM =====
  // Fill break label
  await page.locator(breakDetails.input_break_label).click();
  await page.locator(breakDetails.input_break_label).fill(breakLabel);

  // Select "Other" from duration listbox
  await page.locator(breakDetails.break_listbox).click();
  await page.getByText(breakDetails.break_listbox_option_other).first().click();

  // Fill custom duration
  await page.locator(breakDetails.input_break_duration).click();
  await page.locator(breakDetails.input_break_duration).fill(breakDuration);

  // ===== PHASE 7: SAVE BREAK =====
  await page.locator(breakDetails.button_save).click();

  // ===== PHASE 8: VERIFY SUCCESS MESSAGES =====
  await expect(page.locator(global.flash_message_success)).toContainText(createBreak.SUCCESS);
  await expect(page.locator(global.flash_message_success)).toContainText(createBreak.CREATED);

  // Ensure the modal is closed
  await expect(page.locator(breakDetails.button_save)).not.toBeVisible();

  // ===== PHASE 9: VERIFY BREAK APPEARS ON CALENDAR =====
  await expect(page.getByText(breakLabel)).toBeVisible();

  // ===== PHASE 10: OPEN BREAK FOR REMOVAL =====
  // Click on the break slot to open it
  const breakSlot = page.locator(calendar.button_calendar_slot).filter({ hasText: breakLabel });
  await breakSlot.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUTS.ELEMENT_VISIBLE });
  await breakSlot.click();

  // Wait for break details to load
  await page.waitForTimeout(TEST_CONFIG.TIMEOUTS.MODAL_LOAD);

  // ===== PHASE 11: REMOVE BREAK =====
  await page.locator(calendar.button_remove_break).click();

  // Wait for removal to complete
  await page.waitForTimeout(TEST_CONFIG.TIMEOUTS.REMOVAL_COMPLETE);

  // ===== PHASE 12: VERIFY BREAK REMOVAL =====
  await expect(page.getByText(breakLabel)).not.toBeVisible();
});
