/**
 * useVoiceAnnouncements.js
 * UPDATED: Now supports role-based announcements
 * ✏️ REPLACE ENTIRE FILE with this code
 */

import { useEffect } from 'react';
import { useAuth } from '../state/AuthContext';
import { voiceReaderService } from '../services/VoiceReaderService';
import { getRoleBasedAnnouncement } from '../utils/roleBasedVoiceAnnouncements';

/**
 * Hook to announce page load with role awareness
 * Usage: useVoiceAnnouncements('BOOKS')  // Uses auth context for role
 * @param {string} pageName - Page identifier
 */
export function useVoiceAnnouncements(pageName) {
  const auth = useAuth();
  const userRole = auth?.user?.role || 'guest';

  useEffect(() => {
    if (!pageName) return;

    const announcement = getRoleBasedAnnouncement(pageName, userRole);
    voiceReaderService.speak(announcement);
  }, [pageName, userRole]);
}

/**
 * Get announcement text without speaking
 * @param {string} pageName
 * @param {string} role - Optional, defaults to guest
 * @returns {string}
 */
export function getPageAnnouncement(pageName, role = 'guest') {
  return getRoleBasedAnnouncement(pageName, role);
}

export default useVoiceAnnouncements;
