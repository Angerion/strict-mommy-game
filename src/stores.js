import { writable } from 'svelte/store';

  // Game State
  export const gameTime = writable(0);
  export const gameRunning = writable(false);
  export const isDown = writable(false);
  export const isReviving = writable(false);
  export const lives = writable(3);
  export const npcStatus = writable('');
  export const bossAwake = writable(false);
  export const bossEncounterActive = writable(false);

  // Meters
  export const meters = writable([
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
      replenish: 40,
      color: "linear-gradient(to right, #2196F3, #03A9F4)",
    },
    {
      id: "cleanliness",
      name: "Cleanliness",
      value: 100,
      rate: 0.2,
      replenish: 100,
      color: "linear-gradient(to right, #795548, #A1887F)",
    },
    {
      id: "oxygen",
      name: "Oxygen",
      value: 100,
      rate: 0.1,
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
  ]);

  // General game settings
  export const settings = writable({
    startingLives: 3,
    doorbellMinTime: 45,
    doorbellMaxTime: 80
  });