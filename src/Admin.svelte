<script>
  import { settings, lives, gameTime, gameRunning, meters, currentPreset, applyPreset, audioSettings, resetToDefaults, saveCurrentSettings } from "./stores.js";
  import { gamePresets, availablePresets, defaultSettings, defaultMeters, defaultAudioSettings } from "./gameConfig.js";
  import Slider from "./Slider.svelte";

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
      consumable: {
        enabled: false,
        name: "",
        icon: "",
        count: 0,
        restoreAmount: 100
      }
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
    // Save settings after applying
    saveCurrentSettings();
    alert("Settings applied and game reset!");
  }

  function handlePresetChange() {
    applyPreset($currentPreset);
    alert(`Applied ${gamePresets[$currentPreset].name} preset!`);
  }

  function handleResetToDefaults() {
    if (confirm("Reset all settings to default values? This will overwrite current settings.")) {
      resetToDefaults();
      alert("Settings reset to defaults!");
    }
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
    <legend>⚙️ General Settings</legend>
    
    <Slider
      bind:value={$settings.startingLives}
      min={1}
      max={10}
      step={1}
      label="Starting Lives"
      emoji="❤️"
      tooltip="Number of lives player starts with. Lose a life when any meter reaches 0."
      color="#f44336"
    />

    <Slider
      bind:value={$settings.doorbellMinTime}
      min={5}
      max={300}
      step={5}
      label="Doorbell Min Time"
      emoji="⏱️"
      unit="s"
      tooltip="Minimum time between doorbell events in seconds."
      color="#2196F3"
    />

    <Slider
      bind:value={$settings.doorbellMaxTime}
      min={5}
      max={300}
      step={5}
      label="Doorbell Max Time"
      emoji="⏱️"
      unit="s"
      tooltip="Maximum time between doorbell events in seconds."
      color="#2196F3"
    />

    <Slider
      bind:value={$settings.gameLengthMinutes}
      min={1}
      max={30}
      step={1}
      label="Game Length"
      emoji="⏲️"
      unit=" min"
      tooltip="Total duration of the game in minutes."
      color="#9C27B0"
    />
  </fieldset>

  <fieldset>
    <legend>🍃 Rustle Settings</legend>
    
    <Slider
      bind:value={$settings.rustleMinPercent}
      min={5}
      max={95}
      step={5}
      label="Rustle Min Percentage"
      emoji="🍃"
      unit="%"
      tooltip="Minimum percentage chance for rustle events."
      color="#8D6E63"
    />

    <Slider
      bind:value={$settings.rustleMaxPercent}
      min={5}
      max={95}
      step={5}
      label="Rustle Max Percentage"
      emoji="🍃"
      unit="%"
      tooltip="Maximum percentage chance for rustle events."
      color="#8D6E63"
    />
  </fieldset>

  <fieldset>
    <legend>🔊 Audio Settings</legend>
    
    <Slider
      bind:value={$audioSettings.masterVolume}
      min={0}
      max={1}
      step={0.1}
      label="Master Volume"
      emoji="🔊"
      unit=""
      tooltip="Overall volume for all game audio."
      color="#4CAF50"
    />

    <Slider
      bind:value={$audioSettings.soundEffectsVolume}
      min={0}
      max={1}
      step={0.1}
      label="Sound Effects Volume"
      emoji="🔔"
      unit=""
      tooltip="Volume for game sound effects (replenish, doorbell, etc.)."
      color="#FF9800"
    />

    <Slider
      bind:value={$audioSettings.musicVolume}
      min={0}
      max={1}
      step={0.1}
      label="Music Volume"
      emoji="🎵"
      unit=""
      tooltip="Volume for background music and chase music."
      color="#9C27B0"
    />

    <div class="setting">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={$audioSettings.muteSounds} />
        <span class="checkmark"></span>
        🔇 Mute Sound Effects
      </label>
    </div>

    <div class="setting">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={$audioSettings.muteMusic} />
        <span class="checkmark"></span>
        🔇 Mute Music
      </label>
    </div>
  </fieldset>

  <fieldset>
    <legend>📊 Meters Configuration</legend>
    {#each $meters as meter (meter.id)}
      <div class="meter-setting" style="border-left: 4px solid {meter.color.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/) ? meter.color.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/)[0] : '#4CAF50'}">
        <div class="meter-header">
          <h4 class="meter-name" style="color: {meter.color.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/) ? meter.color.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/)[0] : '#4CAF50'}">{meter.name}</h4>
          <button class="remove-btn" on:click={() => removeMeter(meter.id)}>
            🗑️
          </button>
        </div>
        
        <div class="meter-sliders">
          <Slider
            bind:value={meter.rate}
            min={0.05}
            max={2.00}
            step={0.05}
            label="Rate"
            emoji="📊"
            unit=" ticks/s"
            tooltip="Rate at which this meter decreases per second."
            color={meter.color.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/) ? meter.color.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/)[0] : '#4CAF50'}
            showMinMax={false}
          />

          <Slider
            bind:value={meter.replenish}
            min={1}
            max={100}
            step={1}
            label="Replenish"
            emoji="🔄"
            unit="%"
            tooltip="Amount this meter replenishes when clicked."
            color={meter.color.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/) ? meter.color.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/)[0] : '#4CAF50'}
            showMinMax={false}
          />

          <!-- Consumable Configuration -->
          <div class="consumable-config">
            <h5 class="consumable-title">🎒 Consumable Configuration</h5>
            <div class="setting">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  bind:checked={meter.consumable.enabled}
                  on:change={() => {
                    if (!meter.consumable.enabled) {
                      meter.consumable.name = "";
                      meter.consumable.icon = "";
                      meter.consumable.count = 0;
                    }
                    $meters = $meters; // Trigger reactivity
                  }}
                />
                <span class="checkmark"></span>
                Enable Consumables
              </label>
            </div>
            
            {#if meter.consumable.enabled}
              <div class="consumable-details">
                <div class="setting">
                  <label for="consumable-name-{meter.id}">📝 Consumable Name:</label>
                  <input 
                    type="text" 
                    id="consumable-name-{meter.id}"
                    bind:value={meter.consumable.name}
                    placeholder="e.g., Oxygen Tank"
                  />
                </div>
                
                <div class="setting">
                  <label for="consumable-icon-{meter.id}">🎭 Icon (emoji):</label>
                  <input 
                    type="text" 
                    id="consumable-icon-{meter.id}"
                    bind:value={meter.consumable.icon}
                    placeholder="e.g., 🫁"
                    maxlength="4"
                  />
                </div>
                
                <Slider
                  bind:value={meter.consumable.count}
                  min={0}
                  max={10}
                  step={1}
                  label="Count"
                  emoji="🔢"
                  tooltip="Number of consumables available for this meter."
                  color={meter.color.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/) ? meter.color.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/)[0] : '#4CAF50'}
                  showMinMax={false}
                />
                
                <Slider
                  bind:value={meter.consumable.restoreAmount}
                  min={50}
                  max={100}
                  step={5}
                  label="Restore Amount"
                  emoji="💯"
                  unit="%"
                  tooltip="How much the consumable restores (usually 100%)."
                  color={meter.color.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/) ? meter.color.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/)[0] : '#4CAF50'}
                  showMinMax={false}
                />
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </fieldset>

  <fieldset>
    <legend>➕ Add New Meter</legend>
    <div class="setting">
      <label for="new-meter-name">📝 Name:</label>
      <input type="text" id="new-meter-name" bind:value={newMeterName} />
    </div>
    
    <Slider
      bind:value={newMeterRate}
      min={0.05}
      max={2.00}
      step={0.05}
      label="Rate"
      emoji="📊"
      unit=" ticks/s"
      tooltip="Rate at which this meter decreases per second."
      color="#4CAF50"
      showMinMax={false}
    />

    <Slider
      bind:value={newMeterReplenish}
      min={1}
      max={100}
      step={1}
      label="Replenish"
      emoji="🔄"
      unit="%"
      tooltip="Amount this meter replenishes when clicked."
      color="#4CAF50"
      showMinMax={false}
    />

    <div class="setting">
      <label for="new-meter-color">🎨 Color:</label>
      <select id="new-meter-color" bind:value={newMeterColor}>
        {#each colorOptions as color}
          <option value={color.value}>{color.name}</option>
        {/each}
      </select>
      <div class="color-preview" style="background: {newMeterColor}"></div>
    </div>
    <button on:click={addMeter} class="add-meter-btn">➕ Add Meter</button>
  </fieldset>

  <div class="admin-actions">
    <button on:click={handleResetToDefaults} class="reset-btn">🔄 Reset to Defaults</button>
    <button on:click={applySettings} class="apply-btn">✅ Apply Settings & Reset Game</button>
  </div>
</div>

<style>
  .preset-description {
    font-style: italic;
    color: #666;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }
  
  .meter-setting {
    margin-bottom: 1.5rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fafafa;
  }

  .meter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .meter-name {
    margin: 0;
    font-size: 1.1em;
    font-weight: 600;
  }

  .meter-sliders {
    display: grid;
    gap: 0.5rem;
  }
  
  .consumable-config {
    margin-top: 1rem;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
  }
  
  .consumable-title {
    margin: 0 0 1rem 0;
    font-size: 1em;
    font-weight: 600;
    color: #555;
  }
  
  .consumable-details {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #ddd;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: 600;
    color: #333;
  }
  
  .checkbox-label input[type="checkbox"] {
    margin-right: 0.5rem;
    transform: scale(1.2);
  }
  
  .checkmark {
    margin-left: 0.25rem;
  }
  
  .remove-btn {
    background: #f44336;
    color: white;
    border: none;
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .remove-btn:hover {
    background: #d32f2f;
    transform: scale(1.1);
  }
  
  .setting {
    margin-bottom: 1rem;
  }
  
  .setting label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }
  
  .setting input, .setting select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
  }

  .setting input:focus, .setting select:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }

  .color-preview {
    width: 100%;
    height: 1.5rem;
    border-radius: 4px;
    margin-top: 0.5rem;
    border: 1px solid #ddd;
  }

  .admin-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    flex-wrap: wrap;
  }

  .reset-btn, .apply-btn, .add-meter-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .reset-btn {
    background: #ff9800;
    color: white;
  }

  .reset-btn:hover {
    background: #f57c00;
    transform: translateY(-2px);
  }

  .apply-btn {
    background: #4CAF50;
    color: white;
    flex: 1;
  }

  .apply-btn:hover {
    background: #45a049;
    transform: translateY(-2px);
  }

  .add-meter-btn {
    background: #2196F3;
    color: white;
    width: 100%;
    justify-content: center;
  }

  .add-meter-btn:hover {
    background: #1976D2;
    transform: translateY(-2px);
  }

  fieldset {
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    padding: 1.5rem;
    background: #fff;
  }

  legend {
    font-weight: 700;
    padding: 0 1rem;
    color: #333;
    font-size: 1.1em;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .admin-actions {
      flex-direction: column;
    }

    .meter-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .remove-btn {
      align-self: flex-end;
    }
  }
</style>