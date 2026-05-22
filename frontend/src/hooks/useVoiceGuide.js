/**
 * useVoiceGuide.js
 * Refactored to use centralized VoiceReaderService
 * ✅ Maintains backward compatibility
 */

import { voiceReaderService } from '../services/VoiceReaderService';

/**
 * Check if voice reader is enabled
 * ✅ Uses global flag AND service state
 */
export function isVoiceReaderEnabled() {
  return voiceReaderService.getEnabled();
}

/**
 * Announce page load
 * @param {string} pageName - Name of page (e.g., 'DASHBOARD', 'BOOKS')
 */
export function announcePageLoad(pageName) {
  if (!isVoiceReaderEnabled()) return;

  const messages = {
    DASHBOARD: "Welcome to the dashboard page. You can view your library statistics and recent activity.",
    ACTIVITY_LOGS: "This is the activity logs page. Here you can see all the actions performed in the library system.",
    BOOKS: "Welcome to the books page. You can search, browse, and borrow library books.",
    MY_BORROWS: "This is your borrowed books page. You can view all books you have currently borrowed and their due dates.",
    USERS: "You are on the users management page. You can create, edit, or delete users here.",
    SETTINGS: "You are on the settings page. Here you can adjust accessibility preferences and other settings.",
    LOGIN: "Welcome to the login page. Please enter your email and password to continue.",
    REGISTER: "Welcome to the student registration page. Please fill in your information to create an account."
  };

  const text = messages[pageName] || `You are on the ${pageName} page.`;
  voiceReaderService.speak(text);
}

/**
 * Announce user actions
 * @param {string} action - Action type
 * @param {string} details - Additional details
 */
export function announceAction(action, details = "") {
  if (!isVoiceReaderEnabled()) return;

  const messages = {
    USER_CREATED: `User ${details} has been created successfully.`,
    USER_UPDATED: `User ${details} has been updated successfully.`,
    USER_DELETED: `User ${details} has been deleted.`,
    BOOK_BORROWED: `Book ${details} has been borrowed successfully.`,
    BOOK_RETURNED: `Book ${details} has been returned successfully.`,
    BOOK_CREATED: `New book ${details} has been added to the library.`,
    BOOK_UPDATED: `Book ${details} has been updated.`,
    FILTER_APPLIED: `Filter applied. ${details || 'Results are now displayed.'}`,
    SEARCH_PERFORMED: `Search completed. ${details || 'Results displayed.'}`,
    SORT_APPLIED: `Results sorted by ${details}.`,
    PAGE_CHANGED: `Page ${details}.`,
    LOGOUT: "You have been logged out successfully.",
    LOGIN: `Welcome ${details}. You have logged in successfully.`,
    ERROR: `An error occurred: ${details}`,
    SUCCESS: details,
    INFO: details
  };

  const text = messages[action] || details;
  if (!text) return;

  voiceReaderService.speak(text);
}

/**
 * Announce form field focus
 * @param {string} fieldLabel - Label of the field
 * @param {string} helpText - Optional help text
 */
export function announceFormField(fieldLabel, helpText = "") {
  if (!isVoiceReaderEnabled()) return;

  const text = helpText ? `${fieldLabel}. ${helpText}` : `${fieldLabel} field. Please enter the required information.`;
  voiceReaderService.speak(text);
}

/**
 * Announce loading state
 * @param {string} what - What's being loaded
 */
export function announceLoading(what = "data") {
  if (!isVoiceReaderEnabled()) return;

  const text = `Loading ${what}. Please wait.`;
  voiceReaderService.speak(text);
}

/**
 * Announce success message
 * @param {string} message - Success message
 */
export function announceSuccess(message) {
  if (!isVoiceReaderEnabled()) return;

  voiceReaderService.speak(`Success. ${message}`);
}

/**
 * Announce error message
 * @param {string} message - Error message
 */
export function announceError(message) {
  if (!isVoiceReaderEnabled()) return;

  voiceReaderService.speak(`Error. ${message}`);
}

/**
 * Test voice reader
 */
export function testVoiceReader() {
  voiceReaderService.speak("Voice reader test. This is a test announcement.");
}
