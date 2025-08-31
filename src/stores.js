import { writable } from 'svelte/store';
import { defaultMeters, defaultSettings, defaultAudioSettings, getPresetConfig } from './gameConfig.js';
import { loadSettings, saveSettings, hasStoredSettings } from './settingsStorage.js';

// Load saved settings on initialization
let savedSettings = null;
try {
  savedSettings = loadSettings();
} catch (error) {
  console.error('Failed to load settings:', error);
}

// Game State
export const gameTime = writable(0);
export const gameRunning = writable(false);
export const gameWon = writable(false);
export const isDown = writable(false);
export const isReviving = writable(false);
export const lives = writable(savedSettings?.settings?.startingLives ?? defaultSettings.startingLives);
export const npcStatus = writable('');
export const bossAwake = writable(false);
export const bossEncounterActive = writable(false);

// Current difficulty preset - load from saved settings or default to 'normal'
export const currentPreset = writable(savedSettings?.currentPreset ?? 'normal');

// Meters - load from saved settings or use defaults
export const meters = writable(savedSettings?.meters ?? [...defaultMeters]);

// General game settings - load from saved settings or use defaults
export const settings = writable(savedSettings?.settings ?? {...defaultSettings});

// Audio settings - load from saved settings or use defaults
export const audioSettings = writable(savedSettings?.audioSettings ?? {...defaultAudioSettings});

// Function to save current settings to localStorage
export function saveCurrentSettings() {
  let currentSettings, currentMeters, currentAudioSettings, currentPresetValue;
  
  // Get current values from stores
  settings.subscribe(value => currentSettings = value)();
  meters.subscribe(value => currentMeters = value)();
  audioSettings.subscribe(value => currentAudioSettings = value)();
  currentPreset.subscribe(value => currentPresetValue = value)();
  
  const settingsData = {
    settings: currentSettings,
    meters: currentMeters,
    audioSettings: currentAudioSettings,
    currentPreset: currentPresetValue,
    lastSaved: new Date().toISOString()
  };
  
  return saveSettings(settingsData);
}

// Function to reset all settings to defaults
export function resetToDefaults() {
  currentPreset.set('normal');
  settings.set({...defaultSettings});
  meters.set([...defaultMeters]);
  audioSettings.set({...defaultAudioSettings});
  lives.set(defaultSettings.startingLives);
  
  // Save the reset settings
  saveCurrentSettings();
}

// Function to apply a preset to the game
export function applyPreset(presetKey) {
  const config = getPresetConfig(presetKey);
  currentPreset.set(presetKey);
  settings.set({...config.settings});
  meters.set([...config.meters]);
  lives.set(config.settings.startingLives);
  
  // Save settings after applying preset
  saveCurrentSettings();
}

// Subscribe to settings changes and auto-save
let saveTimeout;
function scheduleSettingsSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveCurrentSettings();
  }, 1000); // Debounce saves by 1 second
}

// Auto-save when settings change
settings.subscribe(() => scheduleSettingsSave());
meters.subscribe(() => scheduleSettingsSave());
audioSettings.subscribe(() => scheduleSettingsSave());
currentPreset.subscribe(() => scheduleSettingsSave());