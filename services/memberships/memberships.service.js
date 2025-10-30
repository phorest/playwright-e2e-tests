import { navigateTo } from '../../helpers/helpers.js';
import { getTimeout } from '../../config/timeouts.js';
import { expect } from "@playwright/test";
import { membershipsLocators } from '../../locators/memberships/memberships.locators.js';

export class MembershipsService {
    constructor(page) {
        this.page = page;
    }

    async goto() {
        await navigateTo(this.page, "Manager");
        await navigateTo(this.page, "Memberships");
    }

    async createCreditMembership(membership) {
        console.log(`Creating credit membership: ${membership.name}`);

        await this.goto();
        await this.page.waitForTimeout(1000);
        console.log('🔍 Clicking add membership button...');
        await membershipsLocators.addMembershipButton(this.page).click();
        await this.page.waitForTimeout(1000);
        console.log('🔍 Clicking credit membership button...');
        await membershipsLocators.creditMembershipButton(this.page).click();
        await this.page.waitForTimeout(1000);

        console.log('🔍 Filling membership name...');
        await membershipsLocators.nameInput(this.page).fill(membership.name);

        const recurringFeeInput = membershipsLocators.recurringFeeInput(this.page);
        await recurringFeeInput.waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        await recurringFeeInput.click();
        await recurringFeeInput.fill(membership.recurringFee.toString());

        const signupFeeInput = membershipsLocators.signupFeeInput(this.page);
        await signupFeeInput.waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        await signupFeeInput.click();
        await signupFeeInput.fill(membership.signupFee.toString());
        await membershipsLocators.benefitsButton(this.page).click();

        console.log('🔍 Clicking new benefit button...');
        await membershipsLocators.newBenefitButton(this.page).click();

        console.log('🔍 Clicking credit button...');
        await membershipsLocators.creditButton(this.page).click();

        console.log('🔍 Filling credit amount...');
        const creditAmountInput = membershipsLocators.creditAmountInput(this.page);
        await creditAmountInput.click();
        await creditAmountInput.fill(membership.creditAmount.toString());
        console.log('🔍 Clicking selected services button...');
        await membershipsLocators.selectedServicesButton(this.page).click();

        console.log('🔍 Clicking select services button...');
        await this.page.waitForTimeout(1000);
        await membershipsLocators.selectServicesButton(this.page).click();

        console.log('🔍 Clicking select all button...');
        await this.page.waitForTimeout(1000);
        await membershipsLocators.selectAllButton(this.page).click();

        console.log('🔍 Clicking done button...');
        await membershipsLocators.doneButton(this.page).click();
        await membershipsLocators.addBenefitButton(this.page).click();
        await membershipsLocators.closeButton(this.page).click();

        await membershipsLocators.newBenefitButton(this.page).click();
        await membershipsLocators.discountButton(this.page).click();
        await membershipsLocators.discountOpenPercentage(this.page).click();
        await membershipsLocators.calculator(this.page).fill(membership.discountAmount.toString());
        await membershipsLocators.okButton(this.page).click();
        await membershipsLocators.addBenefitButton(this.page).click();
        await membershipsLocators.closeButton(this.page).click();
        await membershipsLocators.onlineButton(this.page).click();
        await membershipsLocators.cancelOnlineSwitch(this.page).click();

        await membershipsLocators.termsButton(this.page).click();
        await membershipsLocators.saveMembershipButton(this.page).click();

        await this.page.waitForTimeout(1000);

        let discardModal = membershipsLocators.discardModal(this.page);

        if (await discardModal.isVisible()) {
            await membershipsLocators.discardChangesButton(this.page).click();
        } else {
            await membershipsLocators.saveButton(this.page).waitFor({ state: 'hidden', timeout: 3000 });
        }
    }

    async archiveMembership(membership) {
        await membershipsLocators.managerTab(this.page).click();
        await membershipsLocators.membershipsTab(this.page).click();
        await membershipsLocators.membershipCheckbox(this.page, membership.name).click();
        await membershipsLocators.archiveButton(this.page).click();
        await membershipsLocators.yesButton(this.page).click();
        await membershipsLocators.okButtonConfirm(this.page).click();
        console.log(` Archived membership: ${membership.name}`);
    }

    async billMembershipPayment(membership, user) {
        const billingDate = new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const clientName = user.name;

        await membershipsLocators.managerTab(this.page).click();
        await membershipsLocators.membershipsTab(this.page).click();

        await membershipsLocators.billingLink(this.page).click();
        await membershipsLocators.billingFailedLink(this.page).click();

        const checkboxLocator = membershipsLocators.membershipCheckboxByName(this.page, membership.name);

        for (let attempt = 0; attempt < 5; attempt++) {
            await this.page.waitForTimeout(1000);
            if (await checkboxLocator.count() > 0 && await checkboxLocator.first.isVisible()) {
                await checkboxLocator.first.click();
                console.log(` Selected checkbox for membership '${membership.name}' in Billing failed`);
                await membershipsLocators.moveToBillingDueButton(this.page).click();
                await membershipsLocators.yesButton(this.page).click();

                await membershipsLocators.billingDueLink(this.page).click();
                const dueCheckboxLocator = membershipsLocators.membershipCheckboxByName(this.page, membership.name);

                for (let retry = 0; retry < 15; retry++) {
                    await this.page.waitForTimeout(500);
                    if (await dueCheckboxLocator.count() > 0 && await dueCheckboxLocator.first.isVisible()) {
                        await dueCheckboxLocator.first.click();
                        console.log(` Selected checkbox for membership '${membership.name}' in Billing due`);
                        await membershipsLocators.manuallyBilledButton(this.page).click();
                        await membershipsLocators.yesButton(this.page).click();
                        console.log(` Billed membership payment for ${clientName} on ${billingDate}`);
                        return;
                    }
                    console.log(` Retry ${retry + 1}: membership not yet in Billing due. Refreshing...`);
                    await this.page.waitForTimeout(1000);
                    await this.page.reload();
                    await membershipsLocators.billingDueLink(this.page).click();
                }

                throw new Error(`❌ Could not find membership '${membership.name}' in Billing due.`);
            } else {
                console.log(` Attempt ${attempt + 1}: membership not found in Billing failed. Refreshing...`);
                await this.page.waitForTimeout(1000);
                await this.page.reload();
                await membershipsLocators.billingFailedLink(this.page).click();
            }
        }

        console.log(` Membership '${membership.name}' not found in Billing failed — assuming it's already billed.`);
    }

    async createMembership(membership) {
        console.log(`Creating membership: ${membership.name}`);

        await this.goto();
        await membershipsLocators.addMembershipButton(this.page).click();

        await membershipsLocators.nameInput(this.page).fill(membership.name);

        if (membership.serviceName) {
            await membershipsLocators.serviceMembershipButton(this.page).click();
            await membershipsLocators.selectServiceButton(this.page).click();
            await membershipsLocators.searchForAServicePlaceholder(this.page).fill(membership.serviceName);
            await membershipsLocators.serviceNameButton(this.page, membership.serviceName).click();
            await membershipsLocators.okButton(this.page).click();
        } else {
            await membershipsLocators.creditMembershipButton(this.page).click();
        }

        await membershipsLocators.recurringFeeInput(this.page).fill(membership.recurringFee.toString());
        await membershipsLocators.signupFeeInput(this.page).fill(membership.signupFee.toString());
        await membershipsLocators.valueOfBenefitInput(this.page).fill(membership.valueOfBenefit.toString());
        await membershipsLocators.discountAfterBenefitInput(this.page).fill(membership.discountAfterBenefit.toString());
        await membershipsLocators.productDiscountInput(this.page).fill(membership.productDiscount.toString());

        await membershipsLocators.saveMembershipButton(this.page).click();
        console.log(`Membership created: ${membership.name}`);
    }

    async deleteMembership(membershipName) {
        console.log(`Deleting membership: ${membershipName}`);

        const membershipElement = this.page.locator(`text=${membershipName}`);
        await membershipElement.click();

        await membershipsLocators.deleteButton(this.page).click();
        await membershipsLocators.confirmButton(this.page).click();

        console.log(`Membership deleted: ${membershipName}`);
    }

    async createServiceMembership(membership) {
        console.log(`📋 Creating service membership: ${membership.name}`);

        await this.goto();

        await membershipsLocators.addMembershipButton(this.page).click();
        await membershipsLocators.serviceMembershipButton(this.page).click();
        await membershipsLocators.nameInput(this.page).fill(membership.name);

        const recurringFeeInput = membershipsLocators.recurringFeeInput(this.page);
        await expect(recurringFeeInput).toBeVisible();
        await recurringFeeInput.click();
        await recurringFeeInput.fill(String(membership.recurringFee));

        const signupFeeInput = membershipsLocators.signupFeeInput(this.page);
        await expect(signupFeeInput).toBeVisible();
        await signupFeeInput.click();
        await signupFeeInput.fill(String(membership.signupFee));

        await membershipsLocators.recurringFeeTaxDropdown(this.page).click();
        await membershipsLocators.beautyVatOption(this.page).click();

        await membershipsLocators.signupFeeTaxDropdown(this.page).click();
        await membershipsLocators.hairVatOption(this.page).click();
        await membershipsLocators.benefitsButton(this.page).click();

        await membershipsLocators.newBenefitButton(this.page).click();
        await membershipsLocators.recurringServiceButton(this.page).click();
        await membershipsLocators.selectServiceButton(this.page).click();
        await membershipsLocators.searchForAServicePlaceholder(this.page).click();
        await membershipsLocators.searchForAServicePlaceholder(this.page).fill("Test online");
        await membershipsLocators.serviceNameButton(this.page, membership.serviceName).click();

        await membershipsLocators.numberOfServicesPlaceholder(this.page).click();
        await membershipsLocators.numberOfServicesPlaceholder(this.page).fill(membership.recurringServicesNumber);

        await membershipsLocators.addBenefitButton(this.page).click();
        await membershipsLocators.closeButton(this.page).click();
        await this.page.waitForTimeout(500);
        await membershipsLocators.onlineButton(this.page).click();
        await membershipsLocators.buyOnlineSwitch(this.page).click();
        await membershipsLocators.cancelOnlineSwitch(this.page).click();
        await membershipsLocators.termsButton(this.page).click();
        await membershipsLocators.saveMembershipButton(this.page).click();

        const discardModal = membershipsLocators.discardModal(this.page);
        const isDiscardVisible = await discardModal.isVisible().catch(() => false);
        if (isDiscardVisible) {
            await membershipsLocators.discardChangesButton(this.page).click();
        } else {
            await expect(membershipsLocators.saveButton(this.page)).toBeHidden({ timeout: 3000 });
        }

        console.log(`✅ Service membership created: ${membership.name}`);
    }
}
