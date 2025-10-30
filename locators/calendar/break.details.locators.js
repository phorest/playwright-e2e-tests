// BreakDetails.js
// This class contains locators and getters for elements within the Break Details UI.
// It centralizes all selectors for easy maintenance and reusability in Playwright tests.

class BreakDetails {

  // ------------------------------
  // Break Input Fields
  // ------------------------------

  // Input field for the break label (name)
  get input_break_label() { 
    return '[name*="ui-text-input-default-name-"]' 
  }

  // Input field for the break duration
  get input_break_duration() { 
    return '[name*="break-duration-"]' 
  }

  // ------------------------------
  // Action Buttons
  // ------------------------------

  // Button to save the break
  get button_save() { 
    return '[name="create-break"]' 
  }

  // ------------------------------
  // Break List / Options
  // ------------------------------

  // Listbox element for selecting break duration
  get break_listbox() { 
    return '[name="break-duration"]' 
  }

  // Option in the listbox to select a custom duration
  get break_listbox_option_other() { 
    return 'Other' 
  }

}

export default new BreakDetails()
