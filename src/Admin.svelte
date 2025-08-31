<script>
  import { settings, lives, gameTime, gameRunning, meters, currentPreset, applyPreset } from "./stores.js";
  import { gamePresets, availablePresets } from "./gameConfig.js";

  let newMeterName = '';
  let newMeterRate = 1;
  let newMeterReplenish = 50;
  let newMeterColor = 'linear-gradient(to right, #4CAF50, #8BC34A)'; // Default to Green
  const colorOptions = [
      { name: 'Green', value: 'linear-gradient(to right, #4CAF50, #8BC34A)' },
      { name: 'Blue', value: 'linear-gradient(to right, #2196F3, #03A9F4)' },
      { name: 'Yellow', value: 'linear-gradient(to right, #ffc107, #ffeb3b)' },
      { name: 'Red', value: 'linear-gradient(to right, #f44336, #e57373)' },
      { name: 'Purple', value: 'linear-gradient(to right, #9C27B0, #BA68C8)' },
      { name: 'Brown', value: 'linear-gradient(to right, #795548, #A1887F)' },
      {
          name: 'Light Blue',
          value: 'linear-gradient(to right, #B0C4DE, #87CEEB)',
      },
  ];

  function addMeter() {
    if (!newMeterName.trim()) {
      alert("Please enter a name for the new meter.");
      return;
    }
    const newMeter = {
      id: newMeterName.toLowerCase().replace(/\s+/g, "-"),
      name: newMeterName,
      value: 100,
      rate: newMeterRate,
      replenish: newMeterReplenish,
      color: newMeterColor,
    };
    $meters = [...$meters, newMeter];
    newMeterName = "";
    newMeterRate = 1;
    newMeterReplenish = 50;
  }

  function removeMeter(id) {
    $meters = $meters.filter((m) => m.id !== id);
  }

  function applySettings() {
    $lives = $settings.startingLives;
    $gameTime = 0;
    $meters.forEach((m) => (m.value = 100));
    $meters = $meters;
    if ($gameRunning) {
      $gameRunning = false;
    }
    alert("Settings applied and game reset!");
  }

  function handlePresetChange() {
    applyPreset($currentPreset);
    alert(`Applied ${gamePresets[$currentPreset].name} preset!`);
  }
</script>

<div class="admin-settings">
  <fieldset>
    <legend>Difficulty Presets</legend>
    <div class="setting">
      <label for="difficulty-preset">Select Difficulty:</label>
      <select id="difficulty-preset" bind:value={$currentPreset} on:change={handlePresetChange}>
        {#each availablePresets as presetKey}
          <option value={presetKey}>{gamePresets[presetKey].name}</option>
        {/each}
      </select>
      <p class="preset-description">{gamePresets[$currentPreset].description}</p>
    </div>
  </fieldset>

  <fieldset>
    <legend>General Settings</legend>
    <div class="setting">
      <label for="game-length">
        Game Length (minutes):
        <input type="number" bind:value={$settings.gameLengthMinutes} />
      </label>
    </div>
    <div class="setting">
      <label for="starting-lives">Starting Lives:</label>
      <input
        type="number"
        id="starting-lives"
        bind:value={$settings.startingLives}
        min="1"
        max="6"
      />
    </div>
    <div class="setting">
      <label for="doorbell-min-time">Min Time for Doorbell (seconds):</label>
      <input
        type="number"
        id="doorbell-min-time"
        bind:value={$settings.doorbellMinTime}
      />
    </div>
    <div class="setting">
      <label for="doorbell-max-time">Max Time for Doorbell (seconds):</label>
      <input
        type="number"
        id="doorbell-max-time"
        bind:value={$settings.doorbellMaxTime}
      />
    </div>
  </fieldset>

  <fieldset>
    <legend>Game Rules</legend>
    <label>
      Game Length (minutes):
      <input type="number" bind:value={$settings.gameLengthMinutes} />
    </label>
    <label>
      Rustle Min %:
      <input type="number" bind:value={$settings.rustleMinPercent} />
    </label>
    <label>
      Rustle Max %:
      <input type="number" bind:value={$settings.rustleMaxPercent} />
    </label>
  </fieldset>

  <fieldset>
    <legend>Meters</legend>
    {#each $meters as meter (meter.id)}
      <div class="meter-setting">
        <span class="meter-name">{meter.name}</span>
        <div class="meter-controls">
          <div class="meter-inputs">
            <label
              ><span>Rate:</span>
              <input type="number" bind:value={meter.rate} step="0.1" /></label
            >
            <label
              ><span>Replenish:</span>
              <input type="number" bind:value={meter.replenish} /></label
            >
          </div>
          <button class="remove-btn" on:click={() => removeMeter(meter.id)}
            ><i class="fas fa-trash"></i></button
          >
        </div>
      </div>
    {/each}
  </fieldset>

  <fieldset>
    <legend>Add New Meter</legend>
    <div class="setting">
      <label for="new-meter-name">Name:</label>
      <input type="text" id="new-meter-name" bind:value={newMeterName} />
    </div>
    <div class="setting">
      <label for="new-meter-rate">Rate:</label>
      <input type="number" id="new-meter-rate" bind:value={newMeterRate} step="0.1" />
    </div>
    <div class="setting">
      <label for="new-meter-replenish">Replenish:</label>
      <input
        type="number"
        id="new-meter-replenish"
        bind:value={newMeterReplenish}
      />
    </div>
    <div class="setting">
      <label for="new-meter-color">Color:</label>
      <select id="new-meter-color" bind:value={newMeterColor}>
        {#each colorOptions as color}
          <option value={color.value}>{color.name}</option>
        {/each}
      </select>
    </div>
    <button on:click={addMeter}>Add Meter</button>
  </fieldset>

  <button on:click={applySettings}>Apply Settings & Reset Game</button>
</div>

<style>
  .preset-description {
    font-style: italic;
    color: #666;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }
  
  .meter-setting {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .meter-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .meter-inputs {
    display: flex;
    gap: 0.5rem;
  }
  
  .meter-inputs label {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.8rem;
  }
  
  .meter-inputs input {
    width: 60px;
    margin-top: 0.2rem;
  }
  
  .remove-btn {
    background: #f44336;
    color: white;
    border: none;
    padding: 0.3rem 0.5rem;
    border-radius: 3px;
    cursor: pointer;
  }
  
  .remove-btn:hover {
    background: #d32f2f;
  }
  
  .setting {
    margin-bottom: 1rem;
  }
  
  .setting label {
    display: block;
    margin-bottom: 0.3rem;
    font-weight: bold;
  }
  
  .setting input, .setting select {
    width: 100%;
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 3px;
  }
</style>