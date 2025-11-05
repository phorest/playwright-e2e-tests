/**
 * MembershipsPage - JavaScript version of pages/MembershipsPage.py
 */

import { navigateTo } from '../helpers/helpers.js';
import { getTimeout } from '../config/timeouts.js';
import {  expect } from "@playwright/test";


export class MembershipsPage {
    constructor(page) {
        this.page = page;
        this._managerTab = page.getByRole("link", { name: "Manager" });
        this._membershipsTab = page.getByRole("link", { name: "memberships-icon Memberships" });
        this._addMembershipButton = page.getByRole("button", { name: "Add Membership" });

        this._nameInput = page.getByRole("textbox", { name: "Name of membership" });
        this._creditMembershipButton = page.locator('button[name="new-credit-membership"]');
        this._serviceMembershipButton = page.locator('button[name="new-service-membership"]');
        this._selectServiceButton = page.getByRole("button", { name: "Select a service" });
        this._searchForAServicePlaceholder = page.getByPlaceholder("Search for a service");
        this._numberOfServicesPlaceholder = page.getByPlaceholder("Unlimited");

        this._recurringFeeInput = page.getByRole("textbox", { name: "Recurring fee Open currency" });
        this._signupFeeInput = page.getByRole("textbox", { name: "Signup fee Open currency" });
        this._valueOfBenefitInput = page.getByRole("textbox", { name: "Value of benefit Open" });
        this._discountAfterBenefitInput = page.getByRole("textbox", { name: "Discount after benefit Open" });
        this._productDiscountInput = page.getByRole("textbox", { name: "Product discount Open" });
        this._okButton = page.getByRole("button", { name: "Ok" });
        this._saveButton = page.getByRole("button", { name: "Save changes" });
        this._saveMembershipButton = page.locator('button[name="save-membership"]');

        this._newBenefitButton = page.getByRole("button", { name: "New Benefit" });
        this._benefitsButton = page.locator('button[name="step-next"]');

        this._creditButton = page.locator("div.bg-white", { hasText: "Credit" });
        this._recurringServiceButton = page.locator("div.bg-white", { hasText: "Recurring Service" });
        this._discountButton = page.locator("div.bg-white", { hasText: "Service Discount" });
        this._discountOpenPercentage = page.getByRole("textbox", { name: "Discount Open percentage" });

        this.cancelOnlineSwitch = page.locator('div[name="cancellable-online"] button[role="switch"]');
        this.buyOnlineSwitch = page.locator('div[name="available-online"] button[role="switch"]');

        this._backButton = page.getByRole("button", { name: "Back" });
        this._addBenefitButton = page.getByRole("button", { name: "Add Benefit" });
        this._addBenefitButton2 = page.getByRole("button", { name: "Add Benefit" });
        this._creditAmountInput = page.getByRole("textbox", { name: "Credit Amount" });
        this._calculator = page.getByRole("textbox", { name: "0" });
        this._closeButton = page.getByRole("button", { name: "Close" });
        this._onlineButton = page.locator('button[name="step-next"]:has-text("Online")');
        this._termsButton = page.locator('button[name="step-next"]:has-text("Terms")');

        this._selectedServicesButton = page.getByRole("radio", { name: "SELECTED_SERVICES" });
        this._selectServicesButton = page.getByRole("button", { name: "Select services" });
        this._selectAllButton = page.getByRole("button", { name: "Select all", exact: true });
        this._doneButton = page.getByRole("button", { name: "Done" });
        this.recurringFeeTaxDropdown = page.getByRole("button", { name: "No Tax Rate", exact: true });
        this.signupFeeTaxDropdown = page.getByLabel("Signup fee tax");
        this.beautyVatOptionByText = page.getByText("Beauty VAT");
        this.hairVatOption = page.locator(
            "//label[normalize-space(.)='Signup fee tax']/following::ul[@role='listbox'][1]//span[normalize-space(.)='Hair VAT']"
        );
        this._selectServiceButton = page.getByRole("button", { name: "Select a service" });
        this._searchForAServicePlaceholder = page.getByPlaceholder("Search for a service");
        this._numberOfServicesPlaceholder = page.getByPlaceholder("Unlimited");

    }

    /**
     * Go to memberships page
     */
    async goto() {
        await navigateTo(this.page, "Manager");
        await navigateTo(this.page, "Memberships");
    }

    /**
     * Create credit membership
     * @param {Membership} membership - Membership to create
     */
    async createCreditMembership(membership) {
        console.log(`Creating credit membership: ${membership.name}`);

        await this.goto();
        await this.page.waitForTimeout(1000); // Wait 1 second
        console.log('🔍 Clicking add membership button...');
        await this._addMembershipButton.click();
        await this.page.waitForTimeout(1000); // Wait 1 second
        console.log('🔍 Clicking credit membership button...');
        await this._creditMembershipButton.click();
        await this.page.waitForTimeout(1000); // Wait 1 second

        console.log('🔍 Filling membership name...');
        await this._nameInput.fill(membership.name);

        await this._recurringFeeInput.waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        await this._recurringFeeInput.click();
        await this._recurringFeeInput.fill(membership.recurringFee.toString());

        await this._signupFeeInput.waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        await this._signupFeeInput.click();
        await this._signupFeeInput.fill(membership.signupFee.toString());
        await this._benefitsButton.click();

        console.log('🔍 Clicking new benefit button...');
        await this._newBenefitButton.click();

        console.log('🔍 Clicking credit button...');
        await this._creditButton.click();

        console.log('🔍 Filling credit amount...');
        await this._creditAmountInput.click();
        await this._creditAmountInput.fill(membership.creditAmount.toString());
        console.log('🔍 Clicking selected services button...');
        await this._selectedServicesButton.click();

        console.log('🔍 Clicking select services button...');
        await this.page.waitForTimeout(1000); // Wait 1 second
        await this._selectServicesButton.click();

        console.log('🔍 Clicking select all button...');
        await this.page.waitForTimeout(1000); // Wait 1 second
        await this._selectAllButton.click();

        console.log('🔍 Clicking done button...');
        await this._doneButton.click();
        await this._addBenefitButton2.click();
        await this._closeButton.click();

        await this._newBenefitButton.click();
        await this._discountButton.click();
        await this._discountOpenPercentage.click();
        await this._calculator.fill(membership.discountAmount.toString());
        await this._okButton.click();
        await this._addBenefitButton.click();
        await this._closeButton.click();
        await this._onlineButton.click();
        await this.cancelOnlineSwitch.click();

        await this._termsButton.click();
        await this._saveMembershipButton.click();

        // Wait for save to complete
        await this.page.waitForTimeout(1000);

        // Handle discard modal if it appears
        let discardModal = this.page.locator("h2", { hasText: "Discard all unsaved changes" });

        if (await discardModal.isVisible()) {
            await this.page.getByRole("button", { name: "Discard changes" }).click();
        } else {
            await this._saveButton.waitFor({ state: 'hidden', timeout: 3000 });
        }
    }

    /**
     * Archive membership
     * @param {Membership} membership - Membership to archive
     */
    async archiveMembership(membership) {
        await this.page.getByRole("link", { name: "Manager" }).click();
        await this.page.getByRole("link", { name: "memberships-icon Memberships" }).click();
        await this.page.locator("tr", { hasText: membership.name }).locator('button[role="checkbox"]').click();
        await this.page.getByRole("button", { name: "Archive" }).click();
        await this.page.getByRole("button", { name: "Yes" }).click();
        await this.page.getByRole("button", { name: "OK" }).click();
        console.log(` Archived membership: ${membership.name}`);
    }

    /**
     * Bill membership payment
     * @param {Membership} membership - Membership to bill
     * @param {User} user - User to bill
     */
    async billMembershipPayment(membership, user) {
        const billingDate = new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const clientName = user.name;

        await this._managerTab.click();
        await this._membershipsTab.click();

        await this.page.getByRole("link", { name: "Billing" }).click();
        await this.page.getByRole("link", { name: "Billing failed" }).click();

        const locatorStr = `//tr[td//div[contains(normalize-space(), '${membership.name}')]]//button[@role='checkbox']`;
        const checkboxLocator = this.page.locator(locatorStr);

        for (let attempt = 0; attempt < 5; attempt++) {
            await this.page.waitForTimeout(1000);
            if (await checkboxLocator.count() > 0 && await checkboxLocator.first.isVisible()) {
                await checkboxLocator.first.click();
                console.log(` Selected checkbox for membership '${membership.name}' in Billing failed`);
                await this.page.getByRole("button", { name: "Move to Billing Due Tab" }).click();
                await this.page.getByRole("button", { name: "Yes" }).click();

                await this.page.getByRole("link", { name: "Billing due" }).click();
                const dueCheckboxLocator = this.page.locator(locatorStr);

                for (let retry = 0; retry < 15; retry++) {
                    await this.page.waitForTimeout(500);
                    if (await dueCheckboxLocator.count() > 0 && await dueCheckboxLocator.first.isVisible()) {
                        await dueCheckboxLocator.first.click();
                        console.log(` Selected checkbox for membership '${membership.name}' in Billing due`);
                        await this.page.getByRole("button", { name: "Manually Billed" }).click();
                        await this.page.getByRole("button", { name: "Yes" }).click();
                        console.log(` Billed membership payment for ${clientName} on ${billingDate}`);
                        return;
                    }
                    console.log(` Retry ${retry + 1}: membership not yet in Billing due. Refreshing...`);
                    await this.page.waitForTimeout(1000);
                    await this.page.reload();
                    await this.page.getByRole("link", { name: "Billing due" }).click();
                }

                throw new Error(`❌ Could not find membership '${membership.name}' in Billing due.`);
            } else {
                console.log(` Attempt ${attempt + 1}: membership not found in Billing failed. Refreshing...`);
                await this.page.waitForTimeout(1000);
                await this.page.reload();
                await this.page.getByRole("link", { name: "Billing failed" }).click();
            }
        }

        // If not found after retries, we assume it was billed already
        console.log(` Membership '${membership.name}' not found in Billing failed — assuming it's already billed.`);
    }

    /**
     * Create membership
     * @param {Membership} membership - Membership to create
     */
    async createMembership(membership) {
        console.log(`Creating membership: ${membership.name}`);

        await this.goto();
        await this._addMembershipButton.click();

        await this._nameInput.fill(membership.name);

        // Select membership type based on service name
        if (membership.serviceName) {
            await this._serviceMembershipButton.click();
            await this._selectServiceButton.click();
            await this._searchForAServicePlaceholder.fill(membership.serviceName);
            await this.page.getByRole("button", { name: membership.serviceName }).click();
            await this._okButton.click();
        } else {
            await this._creditMembershipButton.click();
        }

        await this._recurringFeeInput.fill(membership.recurringFee.toString());
        await this._signupFeeInput.fill(membership.signupFee.toString());
        await this._valueOfBenefitInput.fill(membership.valueOfBenefit.toString());
        await this._discountAfterBenefitInput.fill(membership.discountAfterBenefit.toString());
        await this._productDiscountInput.fill(membership.productDiscount.toString());

        await this._saveMembershipButton.click();
        console.log(`Membership created: ${membership.name}`);
    }

    /**
     * Delete membership
     * @param {string} membershipName - Membership name to delete
     */
    async deleteMembership(membershipName) {
        console.log(`Deleting membership: ${membershipName}`);

        // Find and click on the membership
        const membershipElement = this.page.locator(`text=${membershipName}`);
        await membershipElement.click();

        // Click delete button
        const deleteButton = this.page.getByRole("button", { name: "Delete" });
        await deleteButton.click();

        // Confirm deletion
        const confirmButton = this.page.getByRole("button", { name: "Yes" });
        await confirmButton.click();

        console.log(`Membership deleted: ${membershipName}`);
    }

    /**
     * Create service membership
     * @param {Membership} membership - Membership to create
     */
    async createServiceMembership(membership) {
        console.log(`📋 Creating service membership: ${membership.name}`);

        await this.goto();

        await this._addMembershipButton.click();
        await this._serviceMembershipButton.click();
        await this._nameInput.fill(membership.name);

        await expect(this._recurringFeeInput).toBeVisible();
        await this._recurringFeeInput.click();
        await this._recurringFeeInput.fill(String(membership.recurringFee));

        await expect(this._signupFeeInput).toBeVisible();
        await this._signupFeeInput.click();
        await this._signupFeeInput.fill(String(membership.signupFee));

        await this.recurringFeeTaxDropdown.click();
        await this.beautyVatOptionByText.click();

        await this.signupFeeTaxDropdown.click();
        await this.hairVatOption.click();
        await this._benefitsButton.click();

        await this._newBenefitButton.click();
        await this._recurringServiceButton.click();
        await this._selectServiceButton.click();
        await this._searchForAServicePlaceholder.click();
        await this._searchForAServicePlaceholder.fill("Test online");
        await this.page.getByRole("button", { name: membership.serviceName }).click();

        await this._numberOfServicesPlaceholder.click();
        await this._numberOfServicesPlaceholder.fill(membership.recurringServicesNumber);

        await this._addBenefitButton2.click();
        await this._closeButton.click();
        await this.page.waitForTimeout(500);
        await this._onlineButton.click();
        await this.buyOnlineSwitch.click();
        await this.cancelOnlineSwitch.click();
        await this._termsButton.click();
        await this._saveMembershipButton.click();

        const discardModal = this.page.locator("h2", { hasText: "Discard all unsaved changes" });
        const isDiscardVisible = await discardModal.isVisible().catch(() => false);
        if (isDiscardVisible) {
            await this.page.getByRole("button", { name: "Discard changes" }).click();
        } else {
            await expect(this._saveButton).toBeHidden({ timeout: 3000 });
        }

        console.log(`✅ Service membership created: ${membership.name}`);
    }
}
