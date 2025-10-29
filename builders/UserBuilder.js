/**
 * UserBuilder - JavaScript version of builders/UserBuilder.py
 */

import { User } from '../models/User.js';
import { getRandomFullName, getRandomPhoneNumber, getRandomEmail } from '../helpers/helpers.js';

export class UserBuilder {
  constructor() {
    this.name = null;
    this.phone = null;
    this.email = null;
    this.password = null;
  }

  /**
   * Set user with test data
   * @returns {UserBuilder} Builder instance
   */
  withTestData() {
    this.name = getRandomFullName();
    this.phone = getRandomPhoneNumber();
    this.email = getRandomEmail(12);
    this.password = "Test123";
    return this;
  }

  /**
   * Set user with custom data
   * @param {string} name - User name
   * @param {string} phone - User phone
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {UserBuilder} Builder instance
   */
  withCustomData(name, phone, email, password) {
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.password = password;
    return this;
  }

  /**
   * Build the User instance
   * @returns {User} User instance
   */
  build() {
    return new User(this.name, this.phone, this.email, this.password);
  }
}
