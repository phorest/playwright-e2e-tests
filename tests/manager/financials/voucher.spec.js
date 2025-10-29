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
 * Test: Create new client voucher through UI and verify creation
 *
 * This comprehensive test covers the full voucher creation workflow:
 * 1. Navigate to voucher management
 * 2. Create a new voucher with client selection
 * 3. Fill voucher details (serial, dates, balance, notes)
 * 4. Save and verify success messages
 * 5. Navigate to client management
 * 6. Search for the client and verify voucher details
 *
 * Note: This test creates a voucher for an existing test client
 */

test("Create new client voucher UI; use it; archive it; @voucher", async ({
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

  await page.locator("#main-nav-purchase-link").click();
  await page.getByPlaceholder("First name").click();
  await page.getByPlaceholder("First name").fill("TestUser");
  await page.getByRole("button", { name: "TV TestUser Voucher" }).click();
  await page.getByRole("button", { name: "Dean Winchester's profile" }).click();
  await page.getByRole("button", { name: "Services" }).click();
  await page.getByRole("button", { name: "Colour" }).click();
  await page.getByRole("button", { name: "Permanent €60.00 100min" }).click();
  await page.getByRole("button", { name: "Pay" }).click();
  await page.getByRole("button", { name: "Skip" }).click();
  await page
    .getByRole("button", { name: "Select till: No till selected" })
    .click();
  await page.getByText("Till 1").click();
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "Voucher - Balance: €" }).click();
  await page
    .getByRole("button", { name: "Voucher - " + serialNumber + " €" })
    .click();
  await page.getByRole("button", { name: "Ok" }).click();
  await page.getByRole("button", { name: "Complete Payment" }).click();

  await page.getByRole("button", { name: "Close" }).click();
  await page.locator("#main-nav-clients-link").click();
  await page
    .getByRole("searchbox", { name: "First name, ID or Treatcard" })
    .click();
  await page
    .getByRole("searchbox", { name: "First name, ID or Treatcard" })
    .fill("TestUser");
  await page.getByRole("searchbox", { name: "Last name" }).click();
  await page.getByRole("searchbox", { name: "Last name" }).fill("Voucher");

  await page.getByRole("link", { name: "TestUser" }).click();
  await page.getByRole("button", { name: "Vouchers" }).click();
  await page.getByRole("button", { name: "Vouchers" }).click();

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
      console.log("✅ Test cleanup completed successfully");
    } catch (error) {
      console.error("❌ Test cleanup failed:", error);
    }
  } else {
    console.warn("⚠️ No cleanup data available - token or client ID missing");
  }

  // ===== CLEANUP - BULK ARCHIVE VOUCHERS =====
  await apiRequests.bulkArchiveVouchers(request, globalToken);
});
