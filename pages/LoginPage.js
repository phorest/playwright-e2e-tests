/**
 * LoginPage - JavaScript version of pages/LoginPage.py
 */

import { getActiveEnv } from '../config/runtime.js';
import { turnOnAllFeatureFlagsAndReturnToAppointmentScreen } from '../helpers/helpers.js';
import { SettingsPage } from './SettingsPage.js';

export class LoginPage {
  constructor(page, baseUrl) {
    this.page = page;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.emailInput = 'input[name="email"]';
    this.passwordInput = 'input[name="password"]';
    this.signInButton = 'button[name="sign-in-button"]';
  }

  /**
   * Login with email and password
   * @param {string} email - Email
   * @param {string} password - Password
   */
  async login(email, password) {
    await this.page.goto("/");
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.signInButton);
  }

  /**
   * Go to homepage after login and return booking link
   * @returns {string} Booking link
   */
  async goToHomepageAfterLogin() {
    const env = getActiveEnv();
    if (env.enableFeatureFlags || env.name === "dev") {
      try {
        await turnOnAllFeatureFlagsAndReturnToAppointmentScreen(this.page);
      } catch (error) {
        console.log(`[${env.name.toUpperCase()}][feature-flags] (reason: ${error.message})`);
      }
    } else {
      console.log(`[${env.name.toUpperCase()}] feature flags disabled.`);
    }

    const settingsPage = new SettingsPage(this.page);
    return await settingsPage.copyOnlineBookingLink();
  }
}
