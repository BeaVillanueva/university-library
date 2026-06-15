/**
 * voiceAccessibility.js
 * Helper functions for common voice announcements
 * ✅ Keeps code DRY and reusable across components
 */

import { voiceReaderService } from '../services/VoiceReaderService';

export const voiceAccessibility = {
  /**
   * Announce search completion with results
   * ✅ Uses debounce to prevent repeats
   * @param {string} keyword - What was searched
   * @param {number} resultCount - Number of results found
   */
  announceSearch(keyword, resultCount) {
    const key = `search_${keyword}`;
    if (voiceReaderService.shouldAnnounce(key)) {
      const text = resultCount > 0
        ? `Search for "${keyword}" completed. ${resultCount} results found.`
        : `Search for "${keyword}" completed. No results found.`;
      voiceReaderService.speak(text);
    }
  },

  /**
   * Announce filter application
   * ✅ Uses debounce to prevent repeats
   * @param {string} filterName - Name of filter (e.g., "category", "availability")
   * @param {string} filterValue - Value of filter (e.g., "Fiction", "Available")
   */
  announceFilter(filterName, filterValue) {
    const key = `filter_${filterName}`;
    if (voiceReaderService.shouldAnnounce(key)) {
      voiceReaderService.speak(
        `Filtered by ${filterName}: ${filterValue}. Results updated.`
      );
    }
  },

  /**
   * Announce book details
   * @param {string} title - Book title
   * @param {string} author - Book author
   * @param {number} copies - Available copies
   */
  announceBookDetails(title, author, copies) {
    const text = `Book: ${title} by ${author}. ${copies} ${copies === 1 ? 'copy' : 'copies'} available.`;
    voiceReaderService.speak(text);
  },

  /**
   * Announce borrow action
   * @param {string} bookTitle - Title of borrowed book
   * @param {string} status - Status of borrow (e.g., "pending", "borrowed")
   */
  announceBorrow(bookTitle, status) {
    const statusText = status ? ` Status: ${status}.` : '';
    voiceReaderService.speak(
      `${bookTitle} borrow request submitted.${statusText} Check your borrowed books for details.`
    );
  },

  /**
   * Announce book return
   * @param {string} bookTitle - Title of returned book
   */
  announceReturn(bookTitle) {
    voiceReaderService.speak(
      `${bookTitle} has been returned successfully. Thank you for returning the book.`
    );
  },

  /**
   * Announce error message
   * @param {string} message - Error message
   */
  announceError(message) {
    voiceReaderService.speak(`Error: ${message}`);
  },

  /**
   * Announce success message
   * @param {string} message - Success message
   */
  announceSuccess(message) {
    voiceReaderService.speak(`Success: ${message}`);
  },

  /**
   * Announce loading state
   * @param {string} what - What's being loaded (e.g., "books", "activity logs")
   */
  announceLoading(what = 'data') {
    voiceReaderService.speak(`Loading ${what}. Please wait.`);
  },

  /**
   * Announce pagination
   * @param {number} page - Current page number
   * @param {number} totalPages - Total number of pages
   */
  announcePage(page, totalPages) {
    voiceReaderService.speak(`Showing page ${page} of ${totalPages}.`);
  },

  /**
   * Announce form submission
   */
  announceFormSubmit() {
    voiceReaderService.speak('Form submitted. Processing your request.');
  },

  /**
   * Announce form validation error
   */
  announceFormValidationError() {
    voiceReaderService.speak('Form validation error. Please review and correct the errors before submitting.');
  },

  /**
   * Announce action with custom message
   * Flexible for any action
   * @param {string} action - Action name
   * @param {string} details - Additional details
   */
  announceAction(action, details = '') {
    const messages = {
      USER_CREATED: `User ${details} created successfully.`,
      USER_UPDATED: `User ${details} updated successfully.`,
      USER_DELETED: `User ${details} deleted.`,
      BOOK_CREATED: `Book ${details} added successfully.`,
      BOOK_UPDATED: `Book ${details} updated successfully.`,
      BOOK_DELETED: `Book ${details} deleted.`,
      CATEGORY_CREATED: `Category ${details} created successfully.`,
      CATEGORY_UPDATED: `Category ${details} updated successfully.`,
      CATEGORY_DELETED: `Category ${details} deleted.`,
      IMPORT_STARTED: 'Book import started. Processing your file.',
      IMPORT_COMPLETED: `${details} books imported successfully.`,
    };

    const text = messages[action] || details;
    if (text) {
      voiceReaderService.speak(text);
    }
  },

  /**
   * Stop all speech immediately
   * Useful for cleanup or manual override
   */
  stop() {
    voiceReaderService.stopImmediate();
  },

  /**
   * Check if voice reader is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return voiceReaderService.getEnabled();
  }
};

export default voiceAccessibility;
