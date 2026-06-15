/**
 * Voice Guide Utility
 * Provides voice announcements for page navigation and user actions
 * Integrates with the accessibility settings (voiceReader preference)
 */

/**
 * Global voice guide announcements dictionary
 */
export const VOICE_ANNOUNCEMENTS = {
  // Page Navigation
  DASHBOARD: "Welcome to the dashboard page. Here you can view your library statistics and recent activity.",
  USERS: "You are now on the users page. You can create new users, edit existing users, or delete users from here.",
  ACTIVITY_LOGS: "This is the activity logs page. Here you can see all the actions performed in the library system.",
  BOOKS: "Welcome to the books page. You can browse, search, create, and manage library books here.",
  MY_BORROWS: "This is your borrowed books page. View all books you have currently borrowed and their due dates.",
  SETTINGS: "You are now in the settings page. Adjust your accessibility preferences and personal settings here.",
  LOGIN: "You have navigated to the login page. Enter your credentials to access the library system.",
  REGISTER: "Welcome to the registration page. Create a new account to access the library system.",

  // User Actions
  USER_CREATED: "User has been created successfully.",
  USER_UPDATED: "User information has been updated successfully.",
  USER_DELETED: "User has been deleted from the system.",
  BOOK_CREATED: "Book has been added to the library successfully.",
  BOOK_UPDATED: "Book information has been updated successfully.",
  BOOK_DELETED: "Book has been deleted from the library.",
  BOOK_BORROWED: "Book has been borrowed successfully. Remember to return it by the due date.",
  BOOK_RETURNED: "Thank you for returning the book. Your account has been updated.",

  // Form Actions
  FORM_SUBMIT_START: "Form is being submitted. Please wait.",
  FORM_VALIDATION_ERROR: "There are errors in the form. Please review and correct them before submitting.",
  FORM_SUCCESS: "Form submitted successfully.",

  // Loading States
  LOADING: "Loading. Please wait.",
  DATA_LOADING: "Data is being loaded. Please wait.",

  // Errors
  ERROR_OCCURRED: "An error occurred. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",

  // Search and Filter
  SEARCH_STARTED: "Search started. Please wait for results.",
  SEARCH_COMPLETED: "Search completed.",
  FILTER_APPLIED: "Filter has been applied.",
};

/**
 * Main Voice Guide Class
 */
class VoiceGuideManager {
  constructor() {
    this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.isSpeaking = false;
    this.queue = [];
    this.isEnabled = false;
  }

  /**
   * Initialize voice guide with user preferences
   * @param {boolean} voiceReaderEnabled - Whether voice reader is enabled
   */
  init(voiceReaderEnabled = false) {
    this.isEnabled = voiceReaderEnabled;
  }

  /**
   * Set voice guide enabled/disabled
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Speak text
   * @param {string} text - Text to speak
   * @param {object} options - Speech options (rate, pitch, volume, lang)
   * @returns {Promise}
   */
  speak(text, options = {}) {
    return new Promise((resolve) => {
      if (!this.isEnabled || !this.synth) {
        resolve();
        return;
      }

      // Stop any ongoing speech
      if (this.synth.speaking) {
        this.synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      utterance.lang = options.lang || "en-US";

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
        this.processQueue();
      };

      utterance.onerror = (error) => {
        console.warn("Speech synthesis error:", error);
        this.isSpeaking = false;
        resolve();
        this.processQueue();
      };

      this.isSpeaking = true;
      this.synth.speak(utterance);
    });
  }

  /**
   * Queue multiple announcements
   * @param {string} text
   * @param {object} options
   */
  queue(text, options = {}) {
    if (!this.isEnabled) return;
    this.queue.push({ text, options });
    if (!this.isSpeaking && this.queue.length > 0) {
      this.processQueue();
    }
  }

  /**
   * Process queued announcements
   */
  processQueue() {
    if (this.queue.length > 0 && !this.isSpeaking) {
      const { text, options } = this.queue.shift();
      this.speak(text, options);
    }
  }

  /**
   * Stop all speech
   */
  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.queue = [];
  }

  /**
   * Announce page navigation
   * @param {string} pageName
   */
  announcePage(pageName) {
    const announcement = VOICE_ANNOUNCEMENTS[pageName];
    if (announcement) {
      this.queue(announcement);
    }
  }

  /**
   * Announce user action
   * @param {string} actionName
   * @param {string} customMessage - Optional custom message
   */
  announceAction(actionName, customMessage = null) {
    const announcement = customMessage || VOICE_ANNOUNCEMENTS[actionName];
    if (announcement) {
      this.queue(announcement);
    }
  }

  /**
   * Announce form field focus
   * @param {string} fieldLabel
   * @param {string} fieldHelpText
   */
  announceFormField(fieldLabel, fieldHelpText = "") {
    const message = fieldHelpText
      ? `${fieldLabel}. ${fieldHelpText}`
      : `${fieldLabel}. Please enter the required information.`;
    this.queue(message);
  }

  /**
   * Announce error
   * @param {string} errorMessage
   */
  announceError(errorMessage) {
    const message = `Error: ${errorMessage}`;
    this.queue(message);
  }

  /**
   * Announce success
   * @param {string} successMessage
   */
  announceSuccess(successMessage) {
    const message = `Success: ${successMessage}`;
    this.queue(message);
  }
}

// Export singleton instance
export const voiceGuide = new VoiceGuideManager();

export default voiceGuide;
