/**
 * useDebounceAnnounce.js
 * Hook for debounced announcements (search, filter)
 * ✅ KEY FIX: Prevents repeated announcements during user input
 * Usage: const announceSearch = useDebounceAnnounce('Search started', 500)
 */

import { useCallback, useEffect, useRef } from 'react';
import { voiceReaderService } from '../services/VoiceReaderService';

/**
 * Hook for debounced announcements
 * Perfect for search/filter actions that fire multiple times
 * @param {string} defaultMessage - Default announcement text
 * @param {number} delay - Debounce delay in ms (default 500)
 * @returns {Function} - Function to call announcement with optional override text
 */
export function useDebounceAnnounce(defaultMessage = '', delay = 500) {
  const timeoutRef = useRef(null);

  /**
   * Announce after debounce
   * @param {string} text - Optional override text (uses defaultMessage if not provided)
   */
  const announce = useCallback(
    (text) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        const messageToSpeak = text || defaultMessage;
        if (messageToSpeak) {
          voiceReaderService.speak(messageToSpeak);
        }
      }, delay);
    },
    [defaultMessage, delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return announce;
}

export default useDebounceAnnounce;
