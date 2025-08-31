<script>
    import { bossAwake, bossEncounterActive, isDown, isReviving, gameWon } from '../stores.js';
    
    export let onStartBossEncounter;
    export let onDownPlayer;
    export let onStartRevive;
    export let onDropAggro;
</script>

<div class="right-column">
    <div class="boss-actions">
        {#if $bossAwake && !$bossEncounterActive}
            <button id="damage-btn" class="boss-btn start-encounter" on:click={onStartBossEncounter} disabled={$gameWon}>
                <i class="fas fa-khanda"></i>
            </button>
        {:else if $bossEncounterActive}
            <div class="encounter-buttons">
                <button id="damage-btn" class="boss-btn" class:reviving={$isDown} on:click={$isDown ? onStartRevive : onDownPlayer} disabled={$isReviving || $gameWon}>
                    <i class="fas fa-{$isDown ? 'dove' : 'skull'}"></i>
                </button>
                <button id="drop-aggro-btn" class="boss-btn" on:click={onDropAggro} disabled={$gameWon}>
                    <i class="fas fa-shield-alt"></i>
                </button>
            </div>
        {/if}
    </div>
</div>

<style>
    .right-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        min-width: 120px;
        padding: 20px 10px;
        /* Fixed positioning to prevent layout shifts */
        min-height: 120px;
    }

    .boss-actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        /* Fixed container to prevent jumping */
        min-height: 100px;
        width: 100%;
        justify-content: flex-start;
    }

    .encounter-buttons {
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
    }

    .boss-btn {
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
        /* Prevent layout shift */
        flex-shrink: 0;
    }

    .boss-btn.start-encounter {
        background-color: #4a148c; /* Deep Purple */
    }

    .boss-btn.start-encounter:hover {
        background-color: #6a1b9a;
        transform: scale(1.05);
    }

    #damage-btn:not(.start-encounter) {
        background-color: #f44336; /* Red */
    }

    #damage-btn:not(.start-encounter):hover {
        background-color: #d32f2f;
        transform: scale(1.05);
    }

    #damage-btn.reviving {
        background-color: #B0E0E6; /* PowderBlue */
    }

    #damage-btn.reviving:hover {
        background-color: #87CEEB;
        transform: scale(1.05);
    }

    #drop-aggro-btn {
        background-color: #607D8B; /* Blue Grey */
    }

    #drop-aggro-btn:hover {
        background-color: #546e7a;
        transform: scale(1.05);
    }

    .boss-btn:disabled {
        background-color: #a5a5a5;
        cursor: not-allowed;
        transform: none;
    }

    .boss-btn:disabled:hover {
        transform: none;
    }

    /* Mobile responsive styles */
    @media (max-width: 768px) {
        .right-column {
            min-width: 80px;
            padding: 10px 5px;
            min-height: 100px;
        }

        .boss-btn {
            width: 60px;
            height: 60px;
            font-size: 24px;
        }

        .boss-actions {
            min-height: 80px;
        }

        .encounter-buttons {
            gap: 8px;
        }
    }
</style>