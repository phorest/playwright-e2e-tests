/*
/!**
 * Integration test for appointment functionality - JavaScript version
 * Direct conversion from test_appointment.py
 *!/

import { test, expect } from '@playwright/test';
import { setActiveEnv, DEV } from '../config/runtime.js';
import { UserBuilder } from '../builders/UserBuilder.js';
import { CardBuilder } from '../builders/CardBuilder.js';
import { CategoryBuilder } from '../builders/CategoryBuilder.js';
import { ContactInfoBuilder } from '../builders/ContactInfoBuilder.js';
import { BookingPage } from '../pages/BookingPage.js';
import { AppointmentsPage } from '../pages/AppointmentsPage.js';
import { SettingsPage } from '../pages/SettingsPage.js';
import {
  getAccessTokenFromLocalStorage,
  createStaffUserRest,
  setStaffWorkSchedule,
  archiveStaff,
  getAppointmentIdByStaffName,
  deleteAppointment
} from '../api/folder/auth_and_user_utils.js';

// Set test environment
setActiveEnv('dev');

// Fixture equivalent to pytest fixture
async function createStaffTokenAndId(page, context, bookingLink) {
  const token = await getAccessTokenFromLocalStorage(page);
  const staff = await createStaffUserRest(token);
  await setStaffWorkSchedule(token, staff.staffId);
  staff.idForUserDelete = staff.idForStaffDelete;

  const cleanup = async () => {
    const appointmentId = await getAppointmentIdByStaffName(staff.name, token);
    if (appointmentId) {
      await deleteAppointment(appointmentId, token);
    }
    await archiveStaff(token, staff.idForStaffDelete);
  };

  return { token, staff, cleanup };
}

test('test_appointment', async ({ browser }) => {
  // Setup browser context
  const context = await browser.newContext({ baseURL: DEV.baseUrl });
  const page = await context.newPage();

  // Login and get booking link
  const { LoginPage } = await import('../pages/LoginPage.js');
  const loginPage = new LoginPage(page, DEV.baseUrl);
  await loginPage.login(DEV.staffEmail, DEV.staffPassword);
  const bookingLink = await loginPage.goToHomepageAfterLogin();

  // Create staff and get token
  const result = await createStaffTokenAndId(page, context, bookingLink);
  const staffToken = result.token;
  const staff = result.staff;
  const cleanup = result.cleanup;

  try {
    // Create test data (exactly like Python version)
    const contactInfo = new ContactInfoBuilder().withTestData().build();
    const user = new UserBuilder().withTestData().build();
    const category = new CategoryBuilder().withTestExpensiveData().build();
    const card = new CardBuilder().withTestData().build();
    const service = category.services[0];

    // Open booking page
    const bookingTab = await context.newPage();
    await bookingTab.goto(bookingLink);
    const bookingPage = new BookingPage(bookingTab);

    await bookingPage.verifyContactInfo(contactInfo);
    await bookingPage.selectServiceAndBook(category);
    await bookingPage.selectStaffAndTime(staff);

    await bookingPage.createAccount(user);
    await bookingPage.verifyRegistrationSuccess();
    await bookingPage.fillCard(card);
    await bookingPage.verifyBooking(service.name, staff, service.price);

    await bookingTab.close();
    await page.bringToFront();

    const apptPage = new AppointmentsPage(page);
    await apptPage.goto();
    await apptPage.makeCashPaymentByPhone(user.phone);

    // TODO: Add ClientsPage when migrated
    // const clientsPage = new ClientsPage(page);
    // await clientsPage.searchForClients(user);
    // await clientsPage.verifyHistoryRow(bookingPage.appointment, true);
    // await clientsPage.verifySpendTotal(bookingPage.appointment);

    await apptPage.verifyAndUndoPaymentByClientName(user.name);
    await apptPage.deleteBookingByPhone(user.phone);

    const settings = new SettingsPage(page);
    await settings.openContactInfo();
    await settings.verifyBranchContactDetails(contactInfo);
    await settings.openOpeningHours();
    await settings.verifyWeeklyHours(contactInfo);

    // TODO: Add ClientsPage when migrated
    // await clientsPage.searchForClients(user);
    // await clientsPage.verifyClientDetails(user);

    bookingPage.appointment.setPrice(0);
    // await clientsPage.searchForClients(user);
    // await clientsPage.verifyHistoryRow(bookingPage.appointment, false);
    // await clientsPage.verifySpendTotal(bookingPage.appointment);

    // await clientsPage.searchForClients(user);
    // await clientsPage.forgetClient(user);
  } finally {
    // Cleanup
    if (cleanup) {
      await cleanup();
    }
    if (context) {
      await context.close();
    }
  }
});
*/
