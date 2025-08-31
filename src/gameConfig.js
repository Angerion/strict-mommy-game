// Centralized game configuration and presets
// This eliminates code duplication and provides easy/hard mode presets

// Default meter configurations
export const defaultMeters = [
  {
    id: "hunger",
    name: "Hunger",
    value: 100,
    rate: 0.8,
    replenish: 65,
    color: "linear-gradient(to right, #FF9800, #FFB74D)",
  },
  {
    id: "thirst",
    name: "Thirst", 
    value: 100,
    rate: 1,
    replenish: 45,
    color: "linear-gradient(to right, #2196F3, #03A9F4)",
  },
  {
    id: "cleanliness",
    name: "Cleanliness",
    value: 100,
    rate: 0.4,
    replenish: 100,
    color: "linear-gradient(to right, #795548, #A1887F)",
  },
  {
    id: "oxygen",
    name: "Oxygen",
    value: 100,
    rate: 0.3,
    replenish: 100,
    color: "linear-gradient(to right, #B0C4DE, #87CEEB)",
  },
  {
    id: "energy",
    name: "Energy",
    value: 100,
    rate: 0.5,
    replenish: 50,
    color: "linear-gradient(to right, #f0ff22ff, #a0ab0dff)",
  },
];

// Default game settings
export const defaultSettings = {
  startingLives: 3,
  doorbellMinTime: 60,
  doorbellMaxTime: 90,
  gameLengthMinutes: 15,
  rustleMinPercent: 25,
  rustleMaxPercent: 50
};

// Game difficulty presets
export const gamePresets = {
  easy: {
    name: "Easy Mode",
    description: "More forgiving settings for casual play",
    settings: {
      startingLives: 5,
      doorbellMinTime: 90,
      doorbellMaxTime: 120,
      gameLengthMinutes: 12,
      rustleMinPercent: 15,
      rustleMaxPercent: 30
    },
    meterAdjustments: {
      rateMultiplier: 0.7,  // 30% slower decay
      replenishMultiplier: 1.3  // 30% more replenish
    }
  },
  normal: {
    name: "Normal Mode", 
    description: "Balanced difficulty for standard gameplay",
    settings: defaultSettings,
    meterAdjustments: {
      rateMultiplier: 1.0,
      replenishMultiplier: 1.0
    }
  },
  hard: {
    name: "Hard Mode",
    description: "Challenging settings for experienced players", 
    settings: {
      startingLives: 2,
      doorbellMinTime: 45,
      doorbellMaxTime: 70,
      gameLengthMinutes: 18,
      rustleMinPercent: 35,
      rustleMaxPercent: 60
    },
    meterAdjustments: {
      rateMultiplier: 1.4,  // 40% faster decay
      replenishMultiplier: 0.8  // 20% less replenish
    }
  }
};

// Apply preset to meters
export function applyPresetToMeters(meters, presetKey) {
  const preset = gamePresets[presetKey];
  if (!preset) return meters;
  
  const { rateMultiplier, replenishMultiplier } = preset.meterAdjustments;
  
  return meters.map(meter => ({
    ...meter,
    rate: Math.round(meter.rate * rateMultiplier * 100) / 100,
    replenish: Math.round(meter.replenish * replenishMultiplier)
  }));
}

// Get preset configuration
export function getPresetConfig(presetKey) {
  const preset = gamePresets[presetKey];
  if (!preset) return { settings: defaultSettings, meters: defaultMeters };
  
  return {
    settings: preset.settings,
    meters: applyPresetToMeters(defaultMeters, presetKey)
  };
}

// Available preset keys for UI
export const availablePresets = Object.keys(gamePresets);