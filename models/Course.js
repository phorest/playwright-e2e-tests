/**
 * Course model
 */

export class Course {
  constructor(name, categoryName, serviceName, totalUnits, totalPrice) {
    this.name = name;
    this.categoryName = categoryName;
    this.serviceName = serviceName;
    this.totalUnits = totalUnits;
    this.totalPrice = totalPrice;
  }
}
