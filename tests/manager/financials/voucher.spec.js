// @ts-nocheck
import { test, expect, request } from "@playwright/test";
import { testData } from "../../../testData/salonData.js";
import generalCommands from "../../../support/generalCommands.js";
import { voucher } from "../../../support/graphQL/queries/voucher.query.js";

const staffEmail = testData.IRELAND_SALON.staff[0].email;
const staffPassword = process.env.staffPassword;
const testAutomationClientID = "LZEAhkK0pRZZPJ7agub91A";
const issueDate = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  new Date().getDate()
)
  .toJSON()
  .slice(0, 10);
const expiryDate = new Date(
  new Date().getFullYear() + 1,
  new Date().getMonth(),
  new Date().getDate()
)
  .toJSON()
  .slice(0, 10);

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
