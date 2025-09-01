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
    consumable: {
      enabled: false,
      name: "",
      icon: "",
      count: 0,
      restoreAmount: 100
    }
  },
  {
    id: "thirst",
    name: "Thirst", 
    value: 100,
    rate: 1,
    replenish: 45,
    color: "linear-gradient(to right, #2196F3, #03A9F4)",
    consumable: {
      enabled: false,
      name: "",
      icon: "",
      count: 0,
      restoreAmount: 100
    }
  },
  {
    id: "cleanliness",
    name: "Cleanliness",
    value: 100,
    rate: 0.4,
    replenish: 100,
    color: "linear-gradient(to right, #795548, #A1887F)",
    consumable: {
      enabled: false,
      name: "",
      icon: "",
      count: 0,
      restoreAmount: 100
    }
  },
  {
    id: "oxygen",
    name: "Oxygen",
    value: 100,
    rate: 0.3,
    replenish: 100,
    color: "linear-gradient(to right, #B0C4DE, #87CEEB)",
    consumable: {
      enabled: true,
      name: "Oxygen Tank",
      icon: "🫁",
      count: 4,
      restoreAmount: 100
    }
  },
  {
    id: "energy",
    name: "Energy",
    value: 100,
    rate: 0.5,
    replenish: 50,
    color: "linear-gradient(to right, #f0ff22ff, #a0ab0dff)",
    consumable: {
      enabled: false,
      name: "",
      icon: "",
      count: 0,
      restoreAmount: 100
    }
  },
];

// Default game settings
export const defaultSettings = {
  startingLives: 3,
  doorbellMinTime: 70,
  doorbellMaxTime: 100,
  gameLengthMinutes: 15,
  rustleMinPercent: 25,
  rustleMaxPercent: 50,
  rustleAbsoluteSecondsModifier: 5
};

// Default audio settings
export const defaultAudioSettings = {
  masterVolume: 0.7,
  soundEffectsVolume: 0.8,
  musicVolume: 0.6,
  muteSounds: false,
  muteMusic: false
};

// Game difficulty presets
export const gamePresets = {
  easy: {
    name: "Easy Mode",
    description: "More forgiving settings for casual play",
    settings: {
      startingLives: 5,
      doorbellMinTime: 100,
      doorbellMaxTime: 130,
      gameLengthMinutes: 12,
      rustleMinPercent: 15,
      rustleMaxPercent: 30,
      rustleAbsoluteSecondsModifier: 5
    },
    meterAdjustments: {
      rateMultiplier: 0.805,  // 30% slower decay
      replenishMultiplier: 1.3  // 30% more replenish
    },
    oxygenConsumableCount: 5
  },
  normal: {
    name: "Normal Mode", 
    description: "Balanced difficulty for standard gameplay",
    settings: defaultSettings,
    meterAdjustments: {
      rateMultiplier: 1.15,
      replenishMultiplier: 1.0
    },
    oxygenConsumableCount: 4
  },
  hard: {
    name: "Hard Mode",
    description: "Challenging settings for experienced players", 
    settings: {
      startingLives: 2,
      doorbellMinTime: 55,
      doorbellMaxTime: 80,
      gameLengthMinutes: 18,
      rustleMinPercent: 35,
      rustleMaxPercent: 60,
      rustleAbsoluteSecondsModifier: 5
    },
    meterAdjustments: {
      rateMultiplier: 1.61,  // 40% faster decay
      replenishMultiplier: 0.8  // 20% less replenish
    },
    oxygenConsumableCount: 3
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
    replenish: Math.round(meter.replenish * replenishMultiplier),
    consumable: meter.id === 'oxygen' ? {
      ...meter.consumable,
      count: preset.oxygenConsumableCount || meter.consumable.count
    } : meter.consumable
  }));
}

// Get preset configuration
export function getPresetConfig(presetKey) {
  const preset = gamePresets[presetKey];
  if (!preset) return { 
    settings: defaultSettings, 
    meters: defaultMeters
  };
  
  return {
    settings: preset.settings,
    meters: applyPresetToMeters(defaultMeters, presetKey)
  };
}

// Available preset keys for UI
export const availablePresets = Object.keys(gamePresets);