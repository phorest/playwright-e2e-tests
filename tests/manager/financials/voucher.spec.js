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

// Test configuration and credentials
const staffEmail = testData.IRELAND_SALON.staff[0].email;
const staffPassword = process.env.staffPassword;
const testAutomationClientID = "LZEAhkK0pRZZPJ7agub91A";

/**
 * Date utility functions for voucher creation
 * These functions generate dates in YYYY-MM-DD format for voucher issue and expiry dates
 */

// Get current date (today)
const getCurrentDate = () => {
  return new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  )
    .toJSON()
    .slice(0, 10);
};

// Get current date plus one day (tomorrow)
const getCurrentDatePlusOne = () => {
  return new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate() + 1
  )
    .toJSON()
    .slice(0, 10);
};

// Get future date (one year from now)
const getFutureDate = () => {
  return new Date(
    new Date().getFullYear() + 1,
    new Date().getMonth(),
    new Date().getDate()
  )
    .toJSON()
    .slice(0, 10);
};

// Pre-calculate dates for voucher creation
const issueDate = getCurrentDate();
const expiryDate = getFutureDate();

/**
 * Test: Create new voucher using GraphQL API
 *
 * This test validates voucher creation through the GraphQL API endpoint.
 * It creates a voucher with predefined values and verifies the response.
 */
test("Create new voucher with GraphQL @voucher", async ({ page, request }) => {
  // Step 1: Authentication and setup
  await generalCommands.loginByPass(page, request, staffEmail, staffPassword);
  await generalCommands.loadFeatureFlags(page);

  // Step 2: Prepare voucher creation data
  const createVoucherInput = {
    input: {
      clientId: testAutomationClientID,
      issueDate: String(issueDate),
      expiryDate: String(expiryDate),
      serial: String(Date.now()), // Unique serial number using timestamp
      originalBalance: "500",
      remainingBalance: "500",
      notes: "Test Notes",
    },
  };

  // Step 3: Get authentication token
  const token = await generalCommands.getAccessToken(page);

  // Step 4: Execute GraphQL mutation to create voucher
  const voucherCreationResponse = await request.post(testData.URL.GRAPHQL_URL, {
    headers: {
      authorization: `Bearer ${token}`,
      "x-memento-security-context":
        testData.IRELAND_SALON.BUSINESS_ID +
        "|" +
        testData.IRELAND_SALON.BRANCH_ID +
        "|" +
        testData.IRELAND_SALON.staff[0].id,
    },
    data: {
      query: voucher.createVoucher,
      variables: createVoucherInput,
    },
  });

  // Step 5: Verify successful voucher creation
  await expect(voucherCreationResponse.ok()).toBeTruthy();
  await expect(voucherCreationResponse.status()).toBe(200);
});

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
  const serialNumber = String(Date.now()); // Unique serial number
  const todayDate = String(getCurrentDatePlusOne()); // Issue date (tomorrow)
  const futureDate = String(getFutureDate()); // Expiry date (one year from now)

  const createClientInput = {
    input: {
      firstName: "TestUser",
      lastName: "Voucher",
      email: "test@test.com",
      mobile: "0897656433",
      marketingEmailOptout: true,
      marketingSmsOptout: true,
      referringClientId: null,
      clientSourceId: null,
      preferredStaffId: null,
      linkedClientId: null,
      awardReferralPoints: false,
      address: {},
      marketingOptinAnswered: false,
    },
  };
  await generalCommands.loginByPass(page, request, staffEmail, staffPassword);
  await generalCommands.loadFeatureFlags(page);
  // Step 3: Get authentication token
  const token = await generalCommands.getAccessToken(page);

  // Step 4: Execute GraphQL mutation to create voucher
  const clientCreationResponse = await request.post(testData.URL.GRAPHQL_URL, {
    headers: {
      authorization: `Bearer ${token}`,
      "x-memento-security-context":
        testData.IRELAND_SALON.BUSINESS_ID +
        "|" +
        testData.IRELAND_SALON.BRANCH_ID +
        "|" +
        testData.IRELAND_SALON.staff[0].id,
    },
    data: {
      query: client.createClient,
      variables: createClientInput,
    },
  });
  await expect(clientCreationResponse.ok()).toBeTruthy();
  await expect(clientCreationResponse.status()).toBe(200);

  // Parse the response JSON to access the data
  const responseData = await clientCreationResponse.json();
  const clientId = responseData.data.createClient.client.id;

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

  // Search and select client
  await page.locator(voucherLocators.searchClientButton).click();
  await page
    .getByPlaceholder(voucherLocators.placeholderSelectors.firstNameInput)
    .fill("TestUser");
  await page
    .getByPlaceholder(voucherLocators.placeholderSelectors.lastNameInput)
    .fill("Voucher");
  await page.locator(voucherLocators.clientSelectButton).click();

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
    .fill("Test");
  await page
    .getByRole(
      "searchbox",
      voucherLocators.roleSelectors.clientLastNameSearchbox
    )
    .fill("Voucher");
  await page.locator(voucherLocators.clientSelectLink).first().click();

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

  const forgetClientResponse = await request.post(testData.URL.GRAPHQL_URL, {
    headers: {
      authorization: `Bearer ${token}`,
      "x-memento-security-context":
        testData.IRELAND_SALON.BUSINESS_ID +
        "|" +
        testData.IRELAND_SALON.BRANCH_ID +
        "|" +
        testData.IRELAND_SALON.staff[0].id,
    },
    data: {
      query: client.forgetClient,
      variables: {
        clientId: clientId,
      },
    },
  });
  await expect(forgetClientResponse.ok()).toBeTruthy();
  await expect(forgetClientResponse.status()).toBe(200);
});
