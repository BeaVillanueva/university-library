/**
 * VoiceReaderService.js
 * Centralized Voice Reader Service
 * Provides:
 * - Single source of truth for voice state
 * - Immediate stop/cancel functionality
 * - Debounced announcements (prevent repeats)
 * - FIFO queue for speech synthesis
 */

class VoiceReaderService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isEnabled = false;
    this.queue = [];
    this.isSpeaking = false;
    this.lastAnnouncementTime = {};
    this.MIN_REPEAT_INTERVAL = 1000; // Minimum ms between same announcement type
  }

  /**
   * Initialize service with enabled state
   * @param {boolean} isEnabled - Whether voice reader is enabled
   */
  init(isEnabled) {
    this.isEnabled = isEnabled;
  }

  /**
   * Set enabled/disabled - immediately stops all speech
   * ✅ KEY FIX: Stops everything when disabled
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopImmediate();
    }
  }

  /**
   * Check if voice reader is currently enabled
   * @returns {boolean}
   */
  getEnabled() {
    return this.isEnabled;
  }

  /**
   * Immediately cancel all ongoing speech
   * ✅ Used when turning off voice reader
   */
  stopImmediate() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.queue = [];
  }

  /**
   * Check if announcement should be made (debounce)
   * ✅ KEY FIX: Prevents repeated announcements for same action
   * @param {string} announceKey - Unique key for announcement type
   * @returns {boolean}
   */
  shouldAnnounce(announceKey) {
    const now = Date.now();
    const lastTime = this.lastAnnouncementTime[announceKey] || 0;
    if (now - lastTime < this.MIN_REPEAT_INTERVAL) {
      return false; // Too soon, skip
    }
    this.lastAnnouncementTime[announceKey] = now;
    return true;
  }

  /**
   * Reset debounce for specific key
   * Useful for testing or manual reset
   * @param {string} announceKey
   */
  resetDebounce(announceKey) {
    delete this.lastAnnouncementTime[announceKey];
  }

  /**
   * Main speak method with state check
   * ✅ Checks if enabled before speaking
   * @param {string} text - Text to speak
   * @param {object} options - Speech options (rate, pitch, volume, lang)
   * @returns {Promise}
   */
  speak(text, options = {}) {
    return new Promise((resolve) => {
      if (!this.isEnabled || !text || !this.synth) {
        resolve();
        return;
      }

      // Cancel any ongoing speech to play new one immediately
      if (this.synth.speaking) {
        this.synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      utterance.lang = options.lang || 'en-US';

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
        this.processQueue();
      };

      utterance.onerror = (error) => {
        console.warn('Speech synthesis error:', error);
        this.isSpeaking = false;
        resolve();
        this.processQueue();
      };

      this.isSpeaking = true;
      this.synth.speak(utterance);
    });
  }

  /**
   * Queue announcement (prevents speech overlap)
   * ✅ Queues multiple announcements to play sequentially
   * @param {string} text - Text to announce
   * @param {object} options - Speech options
   */
  queueAnnouncement(text, options = {}) {
    if (!this.isEnabled || !text) return;
    this.queue.push({ text, options });
    if (!this.isSpeaking && this.queue.length > 0) {
      this.processQueue();
    }
  }

  /**
   * Process next announcement from queue
   * ✅ Ensures announcements don't overlap
   */
  processQueue() {
    if (this.queue.length > 0 && !this.isSpeaking && this.isEnabled) {
      const { text, options } = this.queue.shift();
      this.speak(text, options);
    }
  }

  /**
   * Get queue length for debugging
   * @returns {number}
   */
  getQueueLength() {
    return this.queue.length;
  }

  /**
   * Get if currently speaking
   * @returns {boolean}
   */
  isSpeakingNow() {
    return this.isSpeaking;
  }
}

// Export singleton instance
export const voiceReaderService = new VoiceReaderService();
export default voiceReaderService;
