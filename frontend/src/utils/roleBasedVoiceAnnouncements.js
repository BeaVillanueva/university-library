/**
 * roleBasedVoiceAnnouncements.js
 * Centralized role-based voice announcements
 * ✅ NEW FILE - Copy paste this entire file
 */

/**
 * Get role-based announcement for a page
 * @param {string} pageName - Page identifier
 * @param {string} role - User role (student, librarian, admin, guest)
 * @returns {string} - Announcement text
 */
export function getRoleBasedAnnouncement(pageName, role = 'guest') {
  const roleNormalized = (role || 'guest').toLowerCase();

  // Announcements keyed by: PAGE_NAME:ROLE
  const announcements = {
    // === BOOKS PAGE ===
    'BOOKS:student': 'Welcome to Books. You may browse and borrow available books. Filter by category or search by title, author, or ISBN.',
    'BOOKS:librarian': 'Welcome to Books Management. You can edit book information, manage stock levels, and monitor inventory.',
    'BOOKS:admin': 'Welcome to Books Management. You can manage and monitor book records across the system.',
    'BOOKS:guest': 'Welcome to Books. You may browse available books.',

    // === ADMIN MODULE ===
    'ADMIN_USERS:admin': 'You are on the Users Management page. You can create new users, manage roles, and delete users.',
    'ADMIN_REPORTS:admin': 'You are on the Reports page. Filter reports by date range and report type, then export data to CSV for analysis.',
    'ADMIN_CATEGORIES:admin': 'You are on the Categories Management page. You can create, edit, or delete book categories.',

    // === LIBRARIAN MODULE ===
    'BORROW_PENDING:librarian': 'You are on Pending Approvals. Review and approve or decline student borrow requests. You can bulk approve multiple requests.',
    'BORROW_BORROWED:librarian': 'You are viewing Borrowed Books. See all currently borrowed items and manage borrow records.',
    'BORROW_RETURN:librarian': 'You are on the Return Books page. Process returned books and update their status.',
    'BORROW_OVERDUE:librarian': 'You are viewing Overdue Books. Monitor and manage overdue borrow records.',
    'BORROW_ALL_HISTORY:librarian': 'You are viewing Borrow History. View all historical borrow records.',
    'IMPORT_BOOKS:librarian': 'You are on the Import Books page. Upload and import books in bulk from a file.',
    'LIBRARIAN_OVERDUE:librarian': 'You are on the Overdue Management page. Monitor and manage overdue items.',

    // === SHARED PAGES ===
    'DASHBOARD:student': 'Welcome to the Dashboard. You can view your library statistics, recent activities, and borrowed books summary.',
    'DASHBOARD:librarian': 'Welcome to the Dashboard. View library statistics, manage operations, and monitor system activity.',
    'DASHBOARD:admin': 'Welcome to the Dashboard. Monitor overall system health, user activity, and library statistics.',

    'ACTIVITY_LOGS:admin': 'This is the Activity Logs page. View all system actions and audit trails.',
    'ACTIVITY_LOGS:librarian': 'This is the Activity Logs page. View operational activities and system events.',
    'ACTIVITY_LOGS:student': 'This is the Activity Logs page. View activities from the library system.',

    'SETTINGS:student': 'You are on the Settings page. Adjust accessibility preferences and account settings.',
    'SETTINGS:librarian': 'You are on the Settings page. Adjust accessibility preferences and account settings.',
    'SETTINGS:admin': 'You are on the Settings page. Adjust accessibility preferences and account settings.',

    'MY_BORROWS:student': 'This is your Borrowed Books page. View all books you have currently borrowed and their due dates.',

    // === AUTH PAGES ===
    'LOGIN:guest': 'Welcome to the Login page. Please enter your email and password to continue.',
    'REGISTER:guest': 'Welcome to the Registration page. Create a new account to access the library system.',
  };

  // Try role-specific announcement first
  const roleSpecificKey = `${pageName}:${roleNormalized}`;
  if (announcements[roleSpecificKey]) {
    return announcements[roleSpecificKey];
  }

  // Fallback to guest version
  const guestKey = `${pageName}:guest`;
  if (announcements[guestKey]) {
    return announcements[guestKey];
  }

  // Ultimate fallback
  return `You are on the ${pageName} page.`;
}

/**
 * Get all announcements for a page (for debugging)
 * @param {string} pageName
 * @returns {object}
 */
export function getPageAnnouncementsByRole(pageName) {
  const roles = ['student', 'librarian', 'admin'];
  const result = {};

  for (const role of roles) {
    result[role] = getRoleBasedAnnouncement(pageName, role);
  }

  return result;
}

export default getRoleBasedAnnouncement;
