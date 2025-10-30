/*
/!**
 * test_service_memberships.spec.js - JavaScript version of tests/test_service_memberships.py
 *!/

import { test, expect } from '@playwright/test';
import { setActiveEnv, getActiveEnv } from '../config/runtime.js';
import {
    getAccessTokenFromLocalStorage,
    createStaffUserRest,
    setStaffWorkSchedule,
    archiveStaff,
    getAppointmentIdByStaffName,
    deleteAppointment,
    freezeClientMembershipByUser,
    cancelClientMembershipByUser,
    unfreezeClientMembershipByUser
} from '../api/folder/auth_and_user_utils.js';

import { CardBuilder } from '../builders/CardBuilder.js';
import { MembershipBuilder } from '../builders/MembershipBuilder.js';
import { UserBuilder } from '../builders/UserBuilder.js';
import { ContactInfoBuilder } from '../builders/ContactInfoBuilder.js';
import { VoucherBuilder } from '../builders/VoucherBuilder.js';

import { BookingService } from '../services/booking/booking.service.js';
import { ClientsService } from '../services/clients/clients.service.js';
import { AppointmentsService } from '../services/appointments/appointments.service.js';
import { MembershipsService } from '../services/memberships/memberships.service.js';
import { VoucherService } from '../services/voucher/voucher.service.js';
import LoginService from '../services/login/login.service.js';

setActiveEnv('dev');

let testContext = {};

test.afterEach(async () => {
    const { staffObject, token } = testContext;

    if (staffObject && token) {
        const appointmentId = await getAppointmentIdByStaffName(staffObject.name, token).catch(() => null);
        if (appointmentId) {
            await deleteAppointment(appointmentId, token).catch(() => {});
        }
        await archiveStaff(token, staffObject.idForStaffDelete).catch(() => {});
    }

    testContext = {};
});

test('test_service_memberships', async ({ browser }) => {
    const context = await browser.newContext({ baseURL: getActiveEnv().baseUrl });
    const page1 = await context.newPage();

    const loginService = new LoginService(page1, getActiveEnv().baseUrl);
    await loginService.login(getActiveEnv().staffEmail, getActiveEnv().staffPassword);
    const bookingLink = await loginService.goToHomepageAfterLogin();

    const token = await getAccessTokenFromLocalStorage(page1);
    const staffObject = await createStaffUserRest(token);
    await setStaffWorkSchedule(token, staffObject.staffId);

    testContext = { staffObject, token };

    const user = new UserBuilder().withTestData().build();
    const card = new CardBuilder().withTestData().build();
    const contact = new ContactInfoBuilder().withTestData().build();
    const voucher = new VoucherBuilder().forUser(user).build();
    const membership = new MembershipBuilder().withServiceData().build();

    let bookingTab = await context.newPage();
    await bookingTab.goto(bookingLink);
    let bookingService = new BookingService(bookingTab);

    await bookingService.verifyContactInfo(contact);
    await bookingService.createAccountFromMyAccount(user);
    await bookingService.verifyRegistrationSuccess();

    await bookingTab.close();
    await page1.bringToFront();

    const voucherService = new VoucherService(page1);
    await voucherService.createVoucherForUser(voucher);

    const membershipsService = new MembershipsService(page1);
    await membershipsService.createServiceMembership(membership);

    bookingTab = await context.newPage();
    await bookingTab.goto(bookingLink);
    bookingService = new BookingService(bookingTab);

    await bookingService.buyMembershipOnline(membership);
    await bookingService.fillCardMembership(card);

    await page1.bringToFront();

    const apptService = new AppointmentsService(page1);
    await apptService.goto();
    await membershipsService.billMembershipPayment(membership, user);

    await apptService.goto();
    await apptService.clickNextSlotByStaffName(staffObject.name, user, membership);

    await membershipsService.archiveMembership(membership);

    await apptService.verifyAndUndoPaymentByClientName(user.name);
    await apptService.deleteBookingByPhone(user.phone);

    await unfreezeClientMembershipByUser(user, token);

    await bookingTab.bringToFront();
    await bookingService.cancelMembershipAndVerify(membership);
    await cancelClientMembershipByUser(user, token);

    await page1.bringToFront();
    const clientsService = new ClientsService(page1);
    await clientsService.searchForClients(user);
    await clientsService.forgetClient(user);
});
*/
