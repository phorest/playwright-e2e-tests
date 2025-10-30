/**
 * Voucher model
 */

export class Voucher {
  constructor(serial, originalBalance, user) {
    this.serial = serial;
    this.originalBalance = originalBalance;
    this.user = user;
  }
}
