<script>
    import { lives, gameTime, npcStatus } from '../stores.js';
    
    export let displayHour;
    export let formattedTime;
    export let currentMilliseconds;
    
    // Format time with milliseconds (MM:SS:MS)
    $: formattedTimeWithMs = formattedTime + ':' + Math.floor(currentMilliseconds / 10).toString().padStart(2, '0');
</script>

<div class="center-column">
    <!-- Game Time Clock at Top -->
    <div class="game-clock">
        <div class="clock-frame">
            <div class="clock-hour">{displayHour.hour}</div>
            <div class="clock-period">{displayHour.period}</div>
        </div>
    </div>
    
    <!-- Lives Display (up to 2 rows of 5 hearts each) -->
    <div class="lives-section">
        {#if $lives && $lives > 0}
            {@const livesArray = Array($lives).fill(0)}
            {@const firstRow = livesArray.slice(0, 5)}
            {@const secondRow = livesArray.slice(5, 10)}
            
            <div class="lives-row">
                {#each firstRow as _}
                    <i class="fas fa-heart"></i>
                {/each}
            </div>
            
            {#if secondRow.length > 0}
                <div class="lives-row">
                    {#each secondRow as _}
                        <i class="fas fa-heart"></i>
                    {/each}
                </div>
            {/if}
        {/if}
    </div>
    
    <!-- Timer with milliseconds -->
    <div class="timer-section">
        <div class="timer-display">
            <span class="timer-label">Time:</span>
            <span class="timer-value">{formattedTimeWithMs}</span>
        </div>
    </div>
    
    <!-- Game State Messages -->
    <div class="status-section">
        {#if $npcStatus}
            <div class="game-status">{$npcStatus}</div>
        {/if}
    </div>
</div>

<style>
    .center-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        flex: 1;
        padding: 10px;
        max-width: 300px;
    }

    .game-clock {
        margin-bottom: 20px;
    }

    .clock-frame {
        display: inline-block;
        border: 3px solid #333;
        border-radius: 8px;
        padding: 10px 15px;
        background-color: #f9f9f9;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    .clock-hour {
        font-size: 2.5em;
        font-weight: bold;
        color: #333;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        line-height: 1;
        margin-bottom: 5px;
        text-align: center;
    }

    .clock-period {
        font-size: 1em;
        font-weight: bold;
        color: #666;
        text-align: center;
    }

    .lives-section {
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
    }

    .lives-row {
        display: flex;
        gap: 5px;
        justify-content: center;
    }

    .lives-row .fa-heart {
        font-size: 24px;
        color: #e74c3c;
        margin: 0 2px;
    }

    .timer-section {
        margin-bottom: 15px;
    }

    .timer-display {
        text-align: center;
    }

    .timer-label {
        font-weight: 600;
        color: #555;
        margin-right: 8px;
    }

    .timer-value {
        font-family: 'Courier New', monospace;
        font-size: 1.1em;
        font-weight: 600;
        color: #333;
        background-color: #f8f9fa;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid #dee2e6;
    }

    .status-section {
        text-align: center;
        min-height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .game-status {
        font-weight: 600;
        color: #495057;
        background-color: #e9ecef;
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid #ced4da;
    }

    /* Mobile responsive styles */
    @media (max-width: 768px) {
        .center-column {
            padding: 8px;
            max-width: none;
        }

        .clock-frame {
            padding: 8px 12px;
        }

        .clock-hour {
            font-size: 2em;
            margin-bottom: 3px;
        }

        .clock-period {
            font-size: 0.9em;
        }

        .lives-row .fa-heart {
            font-size: 20px;
            margin: 0 1px;
        }

        .timer-value {
            font-size: 1em;
            padding: 3px 6px;
        }

        .game-status {
            padding: 6px 10px;
            font-size: 0.9em;
        }

        .game-clock,
        .lives-section,
        .timer-section {
            margin-bottom: 15px;
        }
    }
</style>