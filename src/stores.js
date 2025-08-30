import { writable } from 'svelte/store';

  // Game State
  export const gameTime = writable(0);
  export const gameRunning = writable(false);
  export const lives = writable(3);
  export const npcStatus = writable('');

  // Meters
  export const meters = writable([
    { id: 'hunger', name: 'Hunger', value: 100, rate: 0.8, replenish: 65, color: 'linear-gradient(to right, #FF9800, #FFB74D)' },
    { id: 'thirst', name: 'Thirst', value: 100, rate: 1, replenish: 40, color: 'linear-gradient(to right, #2196F3, #03A9F4)' },
    { id: 'cleanliness', name: 'Cleanliness', value: 100, rate: 0.2, replenish: 100, color: 'linear-gradient(to right, #795548, #A1887F)' },
    { id: 'oxygen', name: 'Oxygen', value: 100, rate: 0.1, replenish: 100, color: 'linear-gradient(to right, #B0C4DE, #87CEEB)' }
  ]);

  // General game settings
  export const settings = writable({
    startingLives: 3,
    doorbellMinTime: 45,
    doorbellMaxTime: 100,
  });