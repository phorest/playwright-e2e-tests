/**
 * ContactInfo model - JavaScript version of models/ContactInfo.py
 */

export class ContactInfo {
  constructor(address, phone, email, openingHours) {
    this.address = address;
    this.phone = phone;
    this.email = email;
    this.openingHours = openingHours;

    this._parts = address.split(",").map(part => part.trim());

    if (this._parts.length < 6) {
      throw new Error(
        "ContactInfo.address must contain six comma-separated parts:\n" +
        "line1, line2, city, state / county, postcode, country"
      );
    }
  }

  /**
   * Get address line 1
   * @returns {string} Address line 1
   */
  get addressLine1() {
    return this._parts[0];
  }

  /**
   * Get address line 2
   * @returns {string} Address line 2
   */
  get addressLine2() {
    return this._parts[1];
  }

  /**
   * Get city
   * @returns {string} City
   */
  get city() {
    return this._parts[2];
  }

  /**
   * Get state
   * @returns {string} State
   */
  get state() {
    return this._parts[3];
  }

  /**
   * Get postcode
   * @returns {string} Postcode
   */
  get postcode() {
    return this._parts[4];
  }

  /**
   * Get country
   * @returns {string} Country
   */
  get country() {
    return this._parts[5];
  }

  /**
   * Debug representation
   * @returns {string} Debug representation
   */
  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `ContactInfo(${this.addressLine1}, ${this.addressLine2}, ${this.city}, ${this.state}, ${this.postcode}, ${this.country}, phone=${this.phone}, email=${this.email})`;
  }
}
