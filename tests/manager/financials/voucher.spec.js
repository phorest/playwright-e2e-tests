// @ts-nocheck
import { test, expect, request } from "@playwright/test";
import { testData } from "../../../testData/salonData.js";
import generalCommands from "../../../support/generalCommands.js";
import { voucher } from "../../../support/graphQL/queries/voucher.query.js";

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
  const futureDate = String(getFutureDate());
  //Create new client

  // Setup
  await generalCommands.loginByPass(
    page,
    request,
    staffEmail,
    staffPassword
  );
  
  await generalCommands.loadFeatureFlags(page);

  await page.locator("#main-nav-manager-link").click();
  await page.getByRole("link", { name: "vouchers-icon Vouchers" }).click();
  await page.getByRole("button", { name: "Add Voucher" }).click();
  await page.getByRole("textbox", { name: "Serial" }).click();
  await page.getByRole("textbox", { name: "Serial" }).fill(serialNumber);
  await page.getByRole("button", { name: "Search for a client" }).click();
  await page.getByPlaceholder("First name, ID or Treatcard").fill("test");
  await page.getByPlaceholder("Last name").fill("voucher");
  await page
    .getByRole("button", { name: "Test Voucher 0891231243 test@" })
    .click();
  await page.getByRole("textbox", { name: "Issue Date Open calendar" }).click();
  await page.locator('[data-date="' + todayDate + '"]').click();
  await page
    .locator("label")
    .filter({ hasText: "Original Balance Open" })
    .locator('button[name="calculator-button"]')
    .click();
  await page.getByRole("button", { name: "2" }).click();
  await page.getByRole("button", { name: "0" }).click();
  await page.getByRole("button", { name: "0" }).click();
  await page.getByRole("button", { name: "Ok" }).click();
  await page.getByRole("textbox", { name: "Notes" }).click();
  await page.getByRole("textbox", { name: "Notes" }).fill("Test voucher notes");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Successfully saved!")).toBeVisible();
  await expect(page.getByText("New voucher has been added.")).toBeVisible();

  await page.locator("#main-nav-clients-link").click();
  await page
    .getByRole("searchbox", { name: "First name, ID or Treatcard" })
    .click();
  await page
    .getByRole("searchbox", { name: "First name, ID or Treatcard" })
    .fill("Test");
  await page.getByRole("searchbox", { name: "Last name" }).fill("Voucher");
  await page.locator(".text-primary.text-sm").first().click();
  await page.getByRole("button", { name: "Vouchers" }).click();
  await expect(page.getByText(serialNumber)).toBeVisible();

  await expect(
    page.locator('[data-column-name="Original Balance"]').first()
  ).toContainText("€200.00");
  await expect(
    page.locator('[data-column-name="Remaining Balance"]').first()
  ).toContainText("€200.00");
  await expect(
    page.locator('[data-column-name="Serial"]').first()
  ).toContainText(serialNumber);
  

  //Forgot client
});

