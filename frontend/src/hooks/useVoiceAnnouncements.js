/**
 * useVoiceAnnouncements.js
 * Hook to announce when page loads
 * ✅ Simplifies page load announcements
 */

import { useEffect } from 'react';
import { voiceReaderService } from '../services/VoiceReaderService';

/**
 * Page announcements dictionary
 */
const PAGE_ANNOUNCEMENTS = {
  DASHBOARD: 'Welcome to the dashboard page. You can view your library statistics and recent activity.',
  ACTIVITY_LOGS: 'This is the activity logs page. Here you can see all the actions performed in the library system.',
  BOOKS: 'Welcome to the books page. You can search, browse, and borrow library books.',
  MY_BORROWS: 'This is your borrowed books page. View all books you have currently borrowed and their due dates.',
  USERS: 'You are on the users management page. You can create, edit, or delete users here.',
  SETTINGS: 'You are on the settings page. Here you can adjust accessibility preferences and other settings.',
  LOGIN: 'Welcome to the login page. Please enter your email and password to continue.',
  REGISTER: 'Welcome to the registration page. Create a new account to access the library system.',
  ADMIN_CATEGORIES: 'You are on the categories management page. You can create, edit, or delete book categories.',
  ADMIN_REPORTS: 'You are on the reports page. View library statistics and generate reports.',
  BOOK_CREATE: 'You are on the create book page. Fill in the book information and submit.',
  BOOK_EDIT: 'You are on the edit book page. Update the book information and save changes.'
};

/**
 * Hook to announce page load
 * Usage: useVoiceAnnouncements('BOOKS')
 * @param {string} pageName - Key from PAGE_ANNOUNCEMENTS
 */
export function useVoiceAnnouncements(pageName) {
  useEffect(() => {
    if (!pageName) return;

    const announcement = PAGE_ANNOUNCEMENTS[pageName] || `You are on the ${pageName} page.`;
    voiceReaderService.speak(announcement);
  }, [pageName]);
}

/**
 * Get announcement text for a page
 * Useful if you want the text without speaking
 * @param {string} pageName
 * @returns {string}
 */
export function getPageAnnouncement(pageName) {
  return PAGE_ANNOUNCEMENTS[pageName] || `You are on the ${pageName} page.`;
}

export default useVoiceAnnouncements;
