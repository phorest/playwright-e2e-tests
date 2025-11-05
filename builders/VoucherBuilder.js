/**
 * VoucherBuilder - JavaScript version of builders/VoucherBuilder.py
 */

import { Voucher } from '../models/Voucher.js';

export class VoucherBuilder {
  constructor() {
    this._serial = this._generateSerial();
    this._originalBalance = 999;
    this._user = null;
  }

  /**
   * Generate serial number
   * @param {number} length - Serial length
   * @returns {string} Serial number
   */
  _generateSerial(length = 11) {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  }

  /**
   * Set serial
   * @param {string} serial - Serial number
   * @returns {VoucherBuilder} Builder instance
   */
  withSerial(serial) {
    this._serial = serial;
    return this;
  }

  /**
   * Set original balance
   * @param {number} balance - Original balance
   * @returns {VoucherBuilder} Builder instance
   */
  withOriginalBalance(balance) {
    this._originalBalance = balance;
    return this;
  }

  /**
   * Set user
   * @param {User} user - User
   * @returns {VoucherBuilder} Builder instance
   */
  forUser(user) {
    this._user = user;
    return this;
  }

  /**
   * Build the Voucher instance
   * @returns {Voucher} Voucher instance
   */
  build() {
    if (this._user === null) {
      throw new Error("User must be set for Voucher");
    }
    return new Voucher(
      this._serial,
      this._originalBalance,
      this._user
    );
  }
}
