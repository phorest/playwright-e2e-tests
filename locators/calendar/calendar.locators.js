class Calendar {

  // ------------------------------
  // Calendar Slots
  // ------------------------------
  get button_calendar_slot() { return '[data-calendar-appointment][name*="calendar-appointment-"]'; }
  get button_add_break() { return '[name="create-break-button"]'; }

  // ------------------------------
  // Month / Week / Day Navigation
  // ------------------------------
  get button_next_week() { return '[name="appointment-calendar-next-week-button"]:visible'; }

  // ------------------------------
  // Bottom Nav Quick Buttons
  // ------------------------------
  get button_remove_break() { return '[name="remove-break"]'; }
}

export default new Calendar();
