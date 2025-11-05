/**
 * Staff model - JavaScript version of models/Staff.py
 */

export class Staff {
  constructor(name, staffId = null, idForUserDelete = null, idForStaffDelete = null) {
    this.name = name;
    this.staffId = staffId;
    this.idForUserDelete = idForUserDelete;
    this.idForStaffDelete = idForStaffDelete;
  }
}
