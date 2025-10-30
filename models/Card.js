/**
 * Card model
 */

export class Card {
  constructor(number, expiry, cvc, country, zip) {
    this.number = number;
    this.expiry = expiry;
    this.cvc = cvc;
    this.country = country;
    this.zip = zip;
  }
}
