/**
 * Membership model
 */

export class Membership {
  constructor(
    name,
    signupFee,
    recurringFee,
    valueOfBenefit,
    discountAfterBenefit,
    productDiscount,
    serviceName,
    serviceNameShort,
    creditAmount,
    discountAmount,
    recurringServicesNumber
  ) {
    this.name = name;
    this.signupFee = signupFee;
    this.recurringFee = recurringFee;
    this.valueOfBenefit = valueOfBenefit;
    this.discountAfterBenefit = discountAfterBenefit;
    this.productDiscount = productDiscount;
    this.serviceName = serviceName;
    this.creditAmount = creditAmount;
    this.discountAmount = discountAmount;
    this.recurringServicesNumber = recurringServicesNumber;
    this.serviceNameShort = serviceNameShort;
  }
}
