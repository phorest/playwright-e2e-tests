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
import { BookingService } from '../services/booking/booking.service.js';
import { AppointmentsService } from '../services/appointments/appointments.service.js';
import { SettingsService } from '../services/settings/settings.service.js';
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
  const LoginService = (await import('../services/login/login.service.js')).default;
  const loginService = new LoginService(page, DEV.baseUrl);
  await loginService.login(DEV.staffEmail, DEV.staffPassword);
  const bookingLink = await loginService.goToHomepageAfterLogin();

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
    const bookingService = new BookingService(bookingTab);

    await bookingService.verifyContactInfo(contactInfo);
    await bookingService.selectServiceAndBook(category);
    await bookingService.selectStaffAndTime(staff);

    await bookingService.createAccount(user);
    await bookingService.verifyRegistrationSuccess();
    await bookingService.fillCard(card);
    await bookingService.verifyBooking(service.name, staff, service.price);

    await bookingTab.close();
    await page.bringToFront();

    const apptService = new AppointmentsService(page);
    await apptService.goto();
    await apptService.makeCashPaymentByPhone(user.phone);

    // TODO: Add ClientsService when migrated
    // const clientsService = new ClientsService(page);
    // await clientsService.searchForClients(user);
    // await clientsService.verifyHistoryRow(bookingService.appointment, true);
    // await clientsService.verifySpendTotal(bookingService.appointment);

    await apptService.verifyAndUndoPaymentByClientName(user.name);
    await apptService.deleteBookingByPhone(user.phone);

    const settingsService = new SettingsService(page);
    await settingsService.openContactInfo();
    await settingsService.verifyBranchContactDetails(contactInfo);
    await settingsService.openOpeningHours();
    await settingsService.verifyWeeklyHours(contactInfo);

    // TODO: Add ClientsService when migrated
    // await clientsService.searchForClients(user);
    // await clientsService.verifyClientDetails(user);

    bookingService.appointment.setPrice(0);
    // await clientsService.searchForClients(user);
    // await clientsService.verifyHistoryRow(bookingService.appointment, false);
    // await clientsService.verifySpendTotal(bookingService.appointment);

    // await clientsService.searchForClients(user);
    // await clientsService.forgetClient(user);
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
