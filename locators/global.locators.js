// Global.js
// This class contains selectors for commonly used global elements across the application.

class Global {

  // ------------------------------
  // Flash Messages
  // ------------------------------
  /** Success flash message container */
  get flash_message_success() { return '.max-w-lg > .p-4:visible' }
}

export default new Global()
