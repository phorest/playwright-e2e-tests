// @ts-nocheck
import { test, expect, request } from "@playwright/test";
import { testData } from "../../../testData/salonData.js";
import generalCommands from "../../../support/generalCommands.js";
import { voucher } from "../../../support/graphQL/queries/voucher.query.js";
import { voucherLocators } from "../../../locators/manager/financials/voucher.locators.js";

const staffEmail = testData.IRELAND_SALON.staff[0].email;
const staffPassword = process.env.staffPassword;
const testAutomationClientID = "LZEAhkK0pRZZPJ7agub91A";
const getCurrentDate = () => {
  return new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  )
    .toJSON()
    .slice(0, 10);
};

const getCurrentDatePlusOne = () => {
  return new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate() + 1
  )
    .toJSON()
    .slice(0, 10);
};

const getFutureDate = () => {
  return new Date(
    new Date().getFullYear() + 1,
    new Date().getMonth(),
    new Date().getDate()
  )
    .toJSON()
    .slice(0, 10);
};

const issueDate = getCurrentDate();
const expiryDate = getFutureDate();

test("Create new voucher with GraphQL @voucher", async ({ page, request }) => {
  await generalCommands.loginByPass(page, request, staffEmail, staffPassword);
  await generalCommands.loadFeatureFlags(page);

  const createVoucherInput = {
    input: {
      clientId: testAutomationClientID,
      issueDate: String(issueDate),
      expiryDate: String(expiryDate),
      serial: String(Date.now()),
      originalBalance: "500",
      remainingBalance: "500",
      notes: "Test Notes",
    },
  };

  const token = await generalCommands.getAccessToken(page);

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
  await expect(voucherCreationResponse.ok()).toBeTruthy();
  await expect(voucherCreationResponse.status()).toBe(200);
});

test("Create new client voucher UI; use it; archive it; @voucher", async ({
  page,
  request,
}) => {
  const serialNumber = String(Date.now());
  const todayDate = String(getCurrentDatePlusOne());
  //Create new client

  // Setup
  await generalCommands.loginByPass(page, request, staffEmail, staffPassword);

  await generalCommands.loadFeatureFlags(page);

  await page.locator(voucherLocators.managerLink).click();
  await page.locator(voucherLocators.vouchersLink).click();
  await page.locator(voucherLocators.addVoucherButton).click();
  await page.getByRole("textbox", voucherLocators.roleSelectors.serialTextbox).click();
  await page.getByRole("textbox", voucherLocators.roleSelectors.serialTextbox).fill(serialNumber);
  await page.locator(voucherLocators.searchClientButton).click();
  await page.getByPlaceholder(voucherLocators.placeholderSelectors.firstNameInput).fill("test");
  await page.getByPlaceholder(voucherLocators.placeholderSelectors.lastNameInput).fill("voucher");
  await page.locator(voucherLocators.clientSelectButton).click();
  await page.getByRole("textbox", voucherLocators.roleSelectors.issueDateTextbox).click();
  await page.locator('[data-date="' + todayDate + '"]').click();
  await page
    .locator(voucherLocators.originalBalanceLabel)
    .locator(voucherLocators.calculatorButton)
    .click();
  await page.locator(voucherLocators.calculatorButton2).click();
  await page.locator(voucherLocators.calculatorButton0).click();
  await page.locator(voucherLocators.calculatorButton0).click();
  await page.locator(voucherLocators.calculatorOkButton).click();
  await page.getByRole("textbox", voucherLocators.roleSelectors.notesTextbox).click();
  await page.getByRole("textbox", voucherLocators.roleSelectors.notesTextbox).fill("Test voucher notes");
  await page.locator(voucherLocators.saveButton).click();
  await expect(page.getByText(voucherLocators.textSelectors.successMessage)).toBeVisible();
  await expect(page.getByText(voucherLocators.textSelectors.voucherAddedMessage)).toBeVisible();

  await page.locator(voucherLocators.clientsLink).click();
  await page
    .getByRole("searchbox", voucherLocators.roleSelectors.clientSearchbox)
    .click();
  await page
    .getByRole("searchbox", voucherLocators.roleSelectors.clientSearchbox)
    .fill("Test");
  await page.getByRole("searchbox", voucherLocators.roleSelectors.clientLastNameSearchbox).fill("Voucher");
  await page.locator(voucherLocators.clientSelectLink).first().click();
  await page.getByRole("button", voucherLocators.roleSelectors.vouchersTabButton).click();
  await expect(page.getByText(serialNumber)).toBeVisible();

  await expect(
    page.locator(voucherLocators.originalBalanceColumn).first()
  ).toContainText("€200.00");
  await expect(
    page.locator(voucherLocators.remainingBalanceColumn).first()
  ).toContainText("€200.00");
  await expect(
    page.locator(voucherLocators.serialColumn).first()
  ).toContainText(serialNumber);

  //Forgot client
});
