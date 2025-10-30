/**
 * Appointment model
 */

export class Appointment {
  constructor(date, time, staff, service, price) {
    this.date = date;
    this.time = time;
    this.staff = staff;
    this.service = service;
    this.price = price;
  }

  /**
   * Set appointment price
   * @param {number} newPrice - New price
   */
  setPrice(newPrice) {
    console.log(` Overriding appointment price: ${this.price.toFixed(2)} → ${newPrice.toFixed(2)}`);
    this.price = newPrice;
  }
}
