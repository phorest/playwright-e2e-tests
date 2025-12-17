// @ts-nocheck
/**
 * Voucher Management Tests
 *
 * This test suite covers voucher creation and management functionality:
 * 1. GraphQL API voucher creation
 * 2. UI-based voucher creation and verification
 *
 * Test data includes client information, date calculations, and voucher details.
 */

import { test, expect, request } from "@playwright/test";
import { testData } from "../../../testData/salonData.js";
import generalCommands from "../../../support/generalCommands.js";
import { voucher } from "../../../support/graphQL/queries/voucher.query.js";
import { client } from "../../../support/graphQL/queries/client.query.js";
import { voucherLocators } from "../../../locators/manager/financials/voucher.locators.js";
import { purchaseLocators } from "../../../locators/purchase/purchase.locators.js";
import apiRequests from "../../../support/requests/api.requests.js";
import {
  generateVoucherTestData,
  getVoucherDates,
} from "../../../support/utils/date.utils.js";

// Test configuration and credentials
const staffEmail = testData.IRELAND_SALON.staff[0].email;
const staffPassword = process.env.staffPassword;

// Pre-calculate dates for voucher creation (using utility functions)
const { issueDate, expiryDate } = getVoucherDates();
// Global variables for test data sharing
let globalToken;
let globalClientId;

/**
 * Test: Complete Voucher Lifecycle - Create, Purchase, Use, and Verify
 *
 * This comprehensive end-to-end test covers the full voucher lifecycle:
 * 1. Create a new test client via GraphQL API
 * 2. Navigate to voucher management and create a new voucher
 * 3. Fill voucher details (serial, dates, balance, notes) and save
 * 4. Verify voucher creation success messages
 * 5. Navigate to client management and verify voucher appears
 * 6. Verify voucher details (balance, serial number)
 * 7. Navigate to purchase system and select the client
 * 8. Purchase a service using the voucher as payment method
 * 9. Complete the payment process with voucher
 * 10. Verify voucher balance reduction after usage
 * 11. Clean up test data (client and vouchers)
 * 
 * Technical improvements:
 * - Centralized locators for maintainability
 * - Dynamic data usage throughout the test
 * - Comprehensive error handling and cleanup
 * - Clear phase separation with documentation
 *
 * This test validates the complete voucher workflow from creation to usage,
 * ensuring proper integration between voucher management and purchase systems.
 */

test("Create new client voucher on the UI; purchase it; use it; archive it; @voucher", async ({
  page,
  request,
}) => {
  // ===== PHASE 1: TEST DATA SETUP =====
  const { serialNumber, issueDate: todayDate } = generateVoucherTestData();

  // ===== PHASE 2: AUTHENTICATION AND SETUP =====
  await generalCommands.loginByPass(page, request, staffEmail, staffPassword);
  await generalCommands.loadFeatureFlags(page);

  // Get authentication token for API requests
  const token = await generalCommands.getAccessToken(page);
  globalToken = token; // Store for cleanup

  // ===== PHASE 2.1: CREATE CLIENT VIA GRAPHQL API =====
  const clientInfo = await apiRequests.createTestClient(
    request,
    token,
    "TestUser",
    "Voucher",
    "test@test.com",
    "0897656433"
  );

  const {
    id: clientId,
    firstName: clientFirstName,
    lastName: clientLastName,
  } = clientInfo;

  globalClientId = clientId; // Store for cleanup

  // ===== PHASE 3: NAVIGATE TO VOUCHER CREATION =====
  await page.locator(voucherLocators.managerLink).click();
  await page.locator(voucherLocators.vouchersLink).click();
  await page.locator(voucherLocators.addVoucherButton).click();

  // ===== PHASE 4: FILL VOUCHER FORM =====
  // Enter serial number
  await page
    .getByRole("textbox", voucherLocators.roleSelectors.serialTextbox)
    .click();
  await page
    .getByRole("textbox", voucherLocators.roleSelectors.serialTextbox)
    .fill(serialNumber);

  // Search and select client using dynamic data
  await page.locator(voucherLocators.searchClientButton).click();
  await page
    .getByPlaceholder(voucherLocators.placeholderSelectors.firstNameInput)
    .fill(clientFirstName); // Use actual client first name
  await page
    .getByPlaceholder(voucherLocators.placeholderSelectors.lastNameInput)
    .fill(clientLastName); // Use actual client last name

  // Wait for client to appear and select dynamically
  const clientButton = page.locator(
    `button:has-text("${clientFirstName} ${clientLastName}")`
  );
  await clientButton.waitFor({ state: "visible", timeout: 10000 });
  await clientButton.click();

  // Set issue date
  await page
    .getByRole("textbox", voucherLocators.roleSelectors.issueDateTextbox)
    .click();
  await page.locator('[data-date="' + todayDate + '"]').click();

  // Set original balance using calculator (€200.00)
  await page
    .locator(voucherLocators.originalBalanceLabel)
    .locator(voucherLocators.calculatorButton)
    .click();
  await page.locator(voucherLocators.calculatorButton2).click(); // Enter "2"
  await page.locator(voucherLocators.calculatorButton0).click(); // Enter "0"
  await page.locator(voucherLocators.calculatorButton0).click(); // Enter "0" (total: 200)
  await page.locator(voucherLocators.calculatorOkButton).click();

  // Add notes
  await page
    .getByRole("textbox", voucherLocators.roleSelectors.notesTextbox)
    .click();
  await page
    .getByRole("textbox", voucherLocators.roleSelectors.notesTextbox)
    .fill("Test voucher notes");

  // Save voucher
  await page.locator(voucherLocators.saveButton).click();

  // ===== PHASE 5: VERIFY SUCCESS MESSAGES =====
  await expect(
    page.getByText(voucherLocators.textSelectors.successMessage)
  ).toBeVisible();
  await expect(
    page.getByText(voucherLocators.textSelectors.voucherAddedMessage)
  ).toBeVisible();

  // ===== PHASE 6: NAVIGATE TO CLIENT MANAGEMENT =====
  await page.locator(voucherLocators.clientsLink).click();

  // ===== PHASE 7: SEARCH FOR CLIENT =====
  await page
    .getByRole("searchbox", voucherLocators.roleSelectors.clientSearchbox)
    .click();
  await page
    .getByRole("searchbox", voucherLocators.roleSelectors.clientSearchbox)
    .fill(clientFirstName); // Use actual client first name
  await page
    .getByRole(
      "searchbox",
      voucherLocators.roleSelectors.clientLastNameSearchbox
    )
    .fill(clientLastName); // Use actual client last name

  // Wait for client to appear and select
  const clientSelectLink = page
    .locator(voucherLocators.clientSelectLink)
    .first();
  await clientSelectLink.waitFor({ state: "visible", timeout: 10000 });
  await clientSelectLink.click();

  // ===== PHASE 8: VERIFY VOUCHER IN CLIENT PROFILE =====
  await page
    .getByRole("button", voucherLocators.roleSelectors.vouchersTabButton)
    .click();

  // Verify voucher serial number is visible
  await expect(page.getByText(serialNumber)).toBeVisible();

  // ===== PHASE 9: VERIFY VOUCHER DETAILS =====
  // Verify original balance (€200.00)
  await expect(
    page.locator(voucherLocators.originalBalanceColumn).first()
  ).toContainText("€200.00");

  // Verify remaining balance (€200.00)
  await expect(
    page.locator(voucherLocators.remainingBalanceColumn).first()
  ).toContainText("€200.00");

  // Verify serial number in table
  await expect(
    page.locator(voucherLocators.serialColumn).first()
  ).toContainText(serialNumber);

  // ===== PHASE 10: PURCHASE SERVICE USING VOUCHER =====
  await page.locator(purchaseLocators.purchaseLink).click();
  await page.getByPlaceholder(purchaseLocators.placeholderSelectors.firstNameInput).click();
  await page.getByPlaceholder(purchaseLocators.placeholderSelectors.firstNameInput).fill(clientFirstName);
  
  // Use dynamic client button selector
  const purchaseClientButton = page.locator(purchaseLocators.getClientButton(clientFirstName, clientLastName));
  await purchaseClientButton.click();
  
  await page.getByRole("button", purchaseLocators.roleSelectors.staffProfileButton).click();
  await page.getByRole("button", purchaseLocators.roleSelectors.servicesButton).click();
  await page.getByRole("button", purchaseLocators.roleSelectors.colourServiceButton).click();
  await page.getByRole("button", purchaseLocators.roleSelectors.permanentServiceButton).click();
  await page.getByRole("button", purchaseLocators.roleSelectors.payButton).click();
  await page.getByRole("button", purchaseLocators.roleSelectors.skipButton).click();
  await page.getByRole("button", purchaseLocators.roleSelectors.tillSelectionButton).click();
  await page.getByText(purchaseLocators.textSelectors.till1Option).click();
  await page.getByRole("button", purchaseLocators.roleSelectors.okButton).click();
  await page.getByRole("button", purchaseLocators.roleSelectors.voucherBalanceButton).click();
  
  // Use dynamic voucher selection button
  const voucherSelectionButton = page.locator(purchaseLocators.getVoucherSelectionButton(serialNumber));
  await voucherSelectionButton.click();
  
  await page.getByRole("button", purchaseLocators.roleSelectors.voucherOkButton).click();
  await page.getByRole("button", purchaseLocators.roleSelectors.completePaymentButton).click();

  // ===== PHASE 11: VERIFY VOUCHER USAGE =====
  await page.getByRole("button", purchaseLocators.roleSelectors.closeButton).click();
  await page.locator(purchaseLocators.clientsLink).click();
  await page
    .getByRole("searchbox", voucherLocators.roleSelectors.clientSearchbox)
    .click();
  await page
    .getByRole("searchbox", voucherLocators.roleSelectors.clientSearchbox)
    .fill(clientFirstName); // Use dynamic client first name
  await page.getByRole("searchbox", voucherLocators.roleSelectors.clientLastNameSearchbox).click();
  await page.getByRole("searchbox", voucherLocators.roleSelectors.clientLastNameSearchbox).fill(clientLastName);

  // Use dynamic client link selector with fallback
  try {
    const clientLink = page.locator(purchaseLocators.getClientLink(clientFirstName));
    await clientLink.waitFor({ state: 'visible', timeout: 5000 });
    await clientLink.click();
  } catch (error) {
    console.log(`⚠️ Client link not found with firstName "${clientFirstName}", trying alternative selector...`);
    // Fallback to the original hardcoded selector
    await page.getByRole("link", { name: clientFirstName }).click();
  }
  
  await page.getByRole("button", purchaseLocators.roleSelectors.vouchersTabButton).click();
  await page.getByRole("button", purchaseLocators.roleSelectors.vouchersTabButton).click();

  // Verify remaining balance (€140.00)
  await expect(
    page.locator(voucherLocators.remainingBalanceColumn).first()
  ).toContainText("€140.00");
});

test.afterAll(async ({ request }) => {
  console.log("🧹 Cleaning up test data...");

  // ===== CLEANUP - FORGET CLIENT =====
  if (globalToken && globalClientId) {
    try {
      await apiRequests.forgetClient(request, globalToken, globalClientId);
      console.log("✅ Client cleanup completed successfully");
    } catch (error) {
      console.error("❌ Client cleanup failed:", error);
    }
  } else {
    console.warn("⚠️ No client cleanup data available - token or client ID missing");
  }

  // ===== CLEANUP - BULK ARCHIVE VOUCHERS =====
  if (globalToken) {
    try {
      await apiRequests.bulkArchiveVouchers(request, globalToken);
      console.log("✅ Vouchers archived successfully");
    } catch (error) {
      console.error("❌ Failed to archive vouchers:", error);
    }
  } else {
    console.warn("⚠️ No token available for voucher cleanup");
  }
  
  console.log("🧹 Test cleanup completed");
});
