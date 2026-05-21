import { useEffect, useCallback } from 'react';
import { loadA11yPrefs } from '../state/a11yPrefs';

/**
 * Custom hook para sa voice guidance
 * Automatically checks kung enabled ang voice reader at nagsasalita
 */
export function useVoiceGuide() {
  const speak = useCallback((text, options = {}) => {
    // Check kung enabled ang voice reader
    const prefs = loadA11yPrefs();
    if (!prefs.voiceReader || !text) return;

    // Stop any ongoing speech
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = options.lang || 'en-US';

    window.speechSynthesis?.speak(utterance);
  }, []);

  return { speak };
}

/**
 * Announce sa page load
 */
export function announcePageLoad(pageName) {
  const prefs = loadA11yPrefs();
  if (!prefs.voiceReader) return;

  const messages = {
    DASHBOARD: "Welcome to the dashboard page. You can view your library statistics and recent activity.",
    ACTIVITY_LOGS: "This is the activity logs page. Here you can see all the actions performed in the library system.",
    BOOKS: "You are now on the books page. You can search, filter, borrow, or manage books here.",
    MY_BORROWS: "This is your borrowed books page. You can view all books you have borrowed and their due dates.",
    USERS: "You are on the users management page. You can create, edit, or delete users here.",
    SETTINGS: "You are on the settings page. Here you can adjust accessibility preferences and other settings.",
    LOGIN: "Welcome to the login page. Please enter your email and password to continue.",
    REGISTER: "Welcome to the student registration page. Please fill in your information to create an account."
  };

  const text = messages[pageName] || `You are on the ${pageName} page.`;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  window.speechSynthesis?.speak(utterance);
}

/**
 * Announce user actions
 */
export function announceAction(action, details = "") {
  const prefs = loadA11yPrefs();
  if (!prefs.voiceReader) return;

  const messages = {
    USER_CREATED: `User ${details} has been created successfully.`,
    USER_UPDATED: `User ${details} has been updated successfully.`,
    USER_DELETED: `User ${details} has been deleted.`,
    BOOK_BORROWED: `Book ${details} has been borrowed successfully.`,
    BOOK_RETURNED: `Book ${details} has been returned successfully.`,
    BOOK_CREATED: `New book ${details} has been added to the library.`,
    BOOK_UPDATED: `Book ${details} has been updated.`,
    FILTER_APPLIED: `Filter applied. Results are now displayed.`,
    SEARCH_PERFORMED: `Search completed. ${details} results found.`,
    SORT_APPLIED: `Results sorted by ${details}.`,
    PAGE_CHANGED: `Showing page ${details}.`,
    LOGOUT: "You have been logged out successfully.",
    LOGIN: `Welcome ${details}. You have logged in successfully.`,
    ERROR: `An error occurred: ${details}`,
    SUCCESS: details,
    INFO: details
  };

  const text = messages[action] || details;
  if (!text) return;

  if (window.speechSynthesis?.speaking) {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  window.speechSynthesis?.speak(utterance);
}

/**
 * Announce form field focus
 */
export function announceFormField(fieldLabel, helpText = "") {
  const prefs = loadA11yPrefs();
  if (!prefs.voiceReader) return;

  const text = helpText ? `${fieldLabel}. ${helpText}` : `${fieldLabel} field. Please enter the required information.`;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  window.speechSynthesis?.speak(utterance);
}

/**
 * Announce loading state
 */
export function announceLoading(what = "data") {
  const prefs = loadA11yPrefs();
  if (!prefs.voiceReader) return;

  const utterance = new SpeechSynthesisUtterance(`Loading ${what}. Please wait.`);
  utterance.rate = 1;
  window.speechSynthesis?.speak(utterance);
}
