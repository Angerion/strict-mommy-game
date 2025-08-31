<script>
    import { gameRunning, bossAwake, bossEncounterActive, isDown, isReviving, gameWon } from '../stores.js';
    
    export let onStartGame;
    export let onPauseGame;
    export let onRustle;
</script>

<div class="left-column">
    <div class="control-buttons">
        {#if !$gameRunning}
            <button id="play-btn" class="control-btn play-btn" on:click={onStartGame} disabled={$isDown || $isReviving || $gameWon}>
                <i class="fas fa-play"></i>
            </button>
        {/if}
        
        {#if $gameRunning && !$bossAwake && !$bossEncounterActive}
            <button id="rustle-btn" class="control-btn rustle-btn" on:click={onRustle}>
                <i class="fas fa-wind"></i>
            </button>
        {/if}
    </div>
</div>

<style>
    .left-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        min-width: 120px;
        padding: 20px 10px;
    }

    .control-buttons {
        display: flex;
        flex-direction: column;
        gap: 15px;
        align-items: center;
    }

    .control-btn {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        font-size: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        color: white;
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .play-btn {
        background-color: #4CAF50; /* Green */
    }

    .play-btn:hover {
        background-color: #45a049;
        transform: scale(1.05);
    }

    .rustle-btn {
        background-color: #8D6E63; /* Brown Grey */
    }

    .rustle-btn:hover {
        background-color: #795548;
        transform: scale(1.05);
    }

    .control-btn:disabled {
        background-color: #a5a5a5;
        cursor: not-allowed;
        transform: none;
    }

    /* Mobile responsive styles */
    @media (max-width: 768px) {
        .left-column {
            min-width: 80px;
            padding: 10px 5px;
        }

        .control-btn {
            width: 60px;
            height: 60px;
            font-size: 24px;
        }

        .control-buttons {
            gap: 10px;
        }
    }
</style>