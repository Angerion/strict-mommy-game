<script>
  export let value = 0;
  export let min = 0;
  export let max = 100;
  export let step = 1;
  export let label = '';
  export let emoji = '';
  export let tooltip = '';
  export let unit = '';
  export let color = '#4CAF50';
  export let showValue = true;
  export let showMinMax = true;

  let sliderElement;
  let showTooltip = false;

  // Format display value based on step
  function formatValue(val) {
    if (step >= 1) {
      return Math.round(val);
    }
    return Number(val).toFixed(2);
  }

  // Calculate percentage for visual styling
  $: percentage = ((value - min) / (max - min)) * 100;

  function handleInput(event) {
    value = Number(event.target.value);
  }

  function showTooltipHandler() {
    if (tooltip) showTooltip = true;
  }

  function hideTooltipHandler() {
    showTooltip = false;
  }
</script>

<div class="slider-container" role="group" on:mouseenter={showTooltipHandler} on:mouseleave={hideTooltipHandler}>
  <div class="slider-header">
    <label for="slider-{label.replace(/\s+/g, '-').toLowerCase()}" class="slider-label">
      {#if emoji}<span class="emoji">{emoji}</span>{/if}
      {label}:
    </label>
    {#if showValue}
      <span class="slider-value" style="color: {color}">
        {formatValue(value)}{unit}
      </span>
    {/if}
  </div>
  
  <div class="slider-wrapper">
    {#if showMinMax}
      <span class="slider-min">{formatValue(min)}{unit}</span>
    {/if}
    
    <div class="slider-track-container">
      <input
        bind:this={sliderElement}
        type="range"
        id="slider-{label.replace(/\s+/g, '-').toLowerCase()}"
        bind:value
        {min}
        {max}
        {step}
        on:input={handleInput}
        class="slider-input"
        style="--slider-color: {color}; --slider-percentage: {percentage}%"
        aria-label="{label}: {formatValue(value)}{unit}"
      />
      <div class="slider-track" style="background: linear-gradient(to right, {color} 0%, {color} {percentage}%, #ddd {percentage}%, #ddd 100%)"></div>
    </div>
    
    {#if showMinMax}
      <span class="slider-max">{formatValue(max)}{unit}</span>
    {/if}
  </div>
  
  {#if tooltip && showTooltip}
    <div class="slider-tooltip">
      {tooltip}
    </div>
  {/if}
</div>

<style>
  .slider-container {
    position: relative;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 8px;
    background: #f9f9f9;
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;
  }

  .slider-container:hover {
    background: #f5f5f5;
    border-color: #ccc;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .slider-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .slider-label {
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
  }

  .emoji {
    font-size: 1.2em;
  }

  .slider-value {
    font-weight: 700;
    font-size: 1.1em;
    padding: 0.2rem 0.5rem;
    background: rgba(255,255,255,0.8);
    border-radius: 4px;
    border: 1px solid #ddd;
  }

  .slider-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .slider-min, .slider-max {
    font-size: 0.8em;
    color: #666;
    min-width: 3em;
    text-align: center;
  }

  .slider-track-container {
    position: relative;
    flex: 1;
    height: 2rem;
    display: flex;
    align-items: center;
  }

  .slider-input {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
    z-index: 2;
  }

  .slider-input::-webkit-slider-track {
    background: transparent;
    height: 8px;
  }

  .slider-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: var(--slider-color);
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .slider-input::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 3px 6px rgba(0,0,0,0.4);
  }

  .slider-input::-webkit-slider-thumb:active {
    transform: scale(1.2);
  }

  .slider-input::-moz-range-track {
    background: transparent;
    height: 8px;
    border: none;
  }

  .slider-input::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: var(--slider-color);
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    cursor: pointer;
    border: none;
  }

  .slider-track {
    position: absolute;
    width: 100%;
    height: 8px;
    border-radius: 4px;
    pointer-events: none;
    z-index: 1;
  }

  .slider-tooltip {
    position: absolute;
    top: -3rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.8em;
    white-space: nowrap;
    z-index: 10;
    pointer-events: none;
  }

  .slider-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.8);
  }

  /* Focus styles for accessibility */
  .slider-input:focus {
    outline: none;
  }

  .slider-input:focus::-webkit-slider-thumb {
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
  }

  .slider-input:focus::-moz-range-thumb {
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
  }

  /* Responsive design */
  @media (max-width: 600px) {
    .slider-wrapper {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .slider-track-container {
      width: 100%;
    }
    
    .slider-min, .slider-max {
      font-size: 0.7em;
    }
  }
</style>