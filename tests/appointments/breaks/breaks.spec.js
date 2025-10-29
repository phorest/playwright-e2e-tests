// @ts-nocheck
import { test, expect, request } from "@playwright/test";
import { loginLocators } from "../../../locators/login/login.locators.js";
import { testData } from "../../../testData/salonData.js";
import generalCommands from "../../../support/generalCommands.js";

const staffEmail = testData.IRELAND_SALON.staff[0].email;
const staffPassword = process.env.staffPassword;

test("Create a break @break", async ({ page, request }) => {
  await generalCommands.loginByPass(page, request, staffEmail, staffPassword);
  await generalCommands.loadFeatureFlags(page);
});
