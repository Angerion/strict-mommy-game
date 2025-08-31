// Settings storage service for localStorage persistence
// Handles reading, writing, and migration of user settings

const STORAGE_KEY = 'strict-mommy-game-settings';
const STORAGE_VERSION = 1;

// Default volume settings
export const defaultAudioSettings = {
  masterVolume: 0.7,
  soundEffectsVolume: 0.8,
  musicVolume: 0.6,
  muteSounds: false,
  muteMusic: false
};

/**
 * Check if localStorage is available
 * @returns {boolean} true if localStorage is available
 */
function isLocalStorageAvailable() {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn('localStorage is not available:', e);
    return false;
  }
}

/**
 * Load settings from localStorage
 * @returns {Object|null} saved settings or null if not available
 */
export function loadSettings() {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, using default settings');
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      console.log('No saved settings found, using defaults');
      return null;
    }

    const parsed = JSON.parse(stored);
    
    // Check version for future migration support
    if (parsed.version !== STORAGE_VERSION) {
      console.log(`Settings version mismatch (stored: ${parsed.version}, current: ${STORAGE_VERSION}), migrating...`);
      return migrateSettings(parsed);
    }

    console.log('Loaded settings from localStorage');
    return parsed.data;
  } catch (error) {
    console.error('Error loading settings from localStorage:', error);
    // Corrupted data, remove it
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove corrupted settings:', e);
    }
    return null;
  }
}

/**
 * Save settings to localStorage
 * @param {Object} settingsData - settings object to save
 * @returns {boolean} true if successful
 */
export function saveSettings(settingsData) {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, cannot save settings');
    return false;
  }

  try {
    const dataToStore = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      data: settingsData
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    console.log('Settings saved to localStorage');
    return true;
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
    
    // If quota exceeded, try to clear old data and retry
    if (error.name === 'QuotaExceededError') {
      try {
        console.log('Storage quota exceeded, clearing old settings and retrying...');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          version: STORAGE_VERSION,
          timestamp: Date.now(),
          data: settingsData
        }));
        console.log('Settings saved successfully after clearing old data');
        return true;
      } catch (retryError) {
        console.error('Failed to save settings even after clearing:', retryError);
      }
    }
    
    return false;
  }
}

/**
 * Remove all saved settings from localStorage
 * @returns {boolean} true if successful
 */
export function clearSettings() {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, cannot clear settings');
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Settings cleared from localStorage');
    return true;
  } catch (error) {
    console.error('Error clearing settings from localStorage:', error);
    return false;
  }
}

/**
 * Migrate settings from older versions (future-proofing)
 * @param {Object} oldSettings - settings from previous version
 * @returns {Object|null} migrated settings or null if migration fails
 */
function migrateSettings(oldSettings) {
  try {
    // For version 1 (initial), no migration needed yet
    // Future versions can add migration logic here
    
    console.log('Settings migration completed');
    return oldSettings.data || null;
  } catch (error) {
    console.error('Settings migration failed:', error);
    return null;
  }
}

/**
 * Get last saved timestamp
 * @returns {number|null} timestamp of last save or null
 */
export function getLastSaveTime() {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return parsed.timestamp || null;
  } catch (error) {
    console.error('Error getting last save time:', error);
    return null;
  }
}

/**
 * Check if settings exist in localStorage
 * @returns {boolean} true if settings exist
 */
export function hasStoredSettings() {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    console.error('Error checking for stored settings:', error);
    return false;
  }
}