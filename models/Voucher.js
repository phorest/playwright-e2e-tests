/**
 * Voucher model - JavaScript version of models/Voucher.py
 */

export class Voucher {
  constructor(serial, originalBalance, user) {
    this.serial = serial;
    this.originalBalance = originalBalance;
    this.user = user;
  }
}
