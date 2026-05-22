import { useEffect } from 'react';

/**
 * ✅ Hook to track idle time and warn/logout user
 * Resets on user activity (click, keypress, scroll, etc.)
 */
export function useIdleTimer(onIdle, timeoutMs = 30 * 60 * 1000) {
  useEffect(() => {
    let timeoutId = null;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        console.log('[IDLE] User has been idle for 30 minutes');
        if (onIdle) onIdle();
      }, timeoutMs);
    };

    // Events to track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    // Add listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer, true);
    });

    // Start timer initially
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer, true);
      });
    };
  }, [onIdle, timeoutMs]);
}