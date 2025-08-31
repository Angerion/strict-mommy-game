import { writable } from 'svelte/store';
import { defaultMeters, defaultSettings, getPresetConfig } from './gameConfig.js';

// Game State
export const gameTime = writable(0);
export const gameRunning = writable(false);
export const gameWon = writable(false);
export const isDown = writable(false);
export const isReviving = writable(false);
export const lives = writable(defaultSettings.startingLives);
export const npcStatus = writable('');
export const bossAwake = writable(false);
export const bossEncounterActive = writable(false);

// Current difficulty preset
export const currentPreset = writable('normal');

// Meters - initialized with default configuration
export const meters = writable([...defaultMeters]);

// General game settings - initialized with default configuration
export const settings = writable({...defaultSettings});

// Consumables - track available consumable items per meter
// Initialize with normal preset consumables
const normalConfig = getPresetConfig('normal');
export const consumables = writable(normalConfig.consumables || {});

// Function to apply a preset to the game
export function applyPreset(presetKey) {
  const config = getPresetConfig(presetKey);
  currentPreset.set(presetKey);
  settings.set({...config.settings});
  meters.set([...config.meters]);
  lives.set(config.settings.startingLives);
  // Initialize consumables from preset
  if (config.consumables) {
    consumables.set({...config.consumables});
  }
}