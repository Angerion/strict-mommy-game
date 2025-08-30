<script>
    import { onMount } from 'svelte';
    import { derived } from 'svelte/store';
    import { gameTime, gameRunning, lives, meters, settings, npcStatus, isDown, isReviving, bossAwake, bossEncounterActive, gameWon } from './stores.js';

    let gameLoop;
    let doorbellTimeout;
    let encounterTimeout;
    let wasRunning = false;
    let chaseMusic; // Will hold the current chase music audio object
    const replenishSound = new Audio('/sounds/replenish.mp3');
    const doorbellSound = new Audio('/sounds/doorbell.mp3');
    const reviveSound = new Audio('/sounds/revive.mp3');
    const clockSound = new Audio('/sounds/grandfather_clock.mp3');

    // --- New Clock Logic ---
    const secondsPerGameHour = derived(settings, $settings => ($settings.gameLengthMinutes * 60) / 6);

    const inGameHour = derived([gameTime, secondsPerGameHour], ([$gameTime, $secondsPerGameHour]) => {
        if (!$secondsPerGameHour || $secondsPerGameHour <= 0) return 0;
        return Math.floor($gameTime / $secondsPerGameHour);
    });

    const displayHour = derived(inGameHour, $inGameHour => {
        if ($inGameHour >= 6) return '6 AM';
        return `${$inGameHour} AM`;
    });

    let previousHour = 0;
    inGameHour.subscribe(hour => {
        if (!$gameRunning || $gameWon) return;

        if (hour >= 6) {
            gameWon.set(true);
            gameRunning.set(false);
            npcStatus.set('You survived the night!');
            if (chaseMusic) chaseMusic.pause();
            clockSound.play();
        } else if (hour > previousHour) {
            clockSound.play();
            previousHour = hour;

            // The hourly chime now also wakes the boss
            clearTimeout(doorbellTimeout); // Cancel any pending random doorbell
            bossAwake.set(true);
            npcStatus.set('The turning of the hour has woken the boss!');
        }
    });
    // --- End New Clock Logic ---

    function downPlayer() {
        if ($lives <= 0 || $isDown || $isReviving || !$bossEncounterActive || $gameWon) return;

        wasRunning = $gameRunning;
        if (wasRunning) {
            gameRunning.set(false);
        }

        lives.update(n => n - 1);
        isDown.set(true);
    }

    function startRevive() {
        if (!$isDown || $isReviving) return;

        isReviving.set(true);
        reviveSound.play();

        setTimeout(() => {
            reviveSound.pause();
            reviveSound.currentTime = 0;

            isReviving.set(false);
            isDown.set(false);

            if (wasRunning) {
                gameRunning.set(true);
            }
            // End the encounter after a successful revive
            dropAggro();
        }, 8000);
    }

    function dropAggro() {
        if (!$bossEncounterActive) return;

        bossEncounterActive.set(false);
        bossAwake.set(false);
        if (chaseMusic) {
            chaseMusic.pause();
            chaseMusic.currentTime = 0;
        }
        npcStatus.set('');
        clearTimeout(encounterTimeout);

        // If player was downed, reset that state too
        if ($isDown) {
            isDown.set(false);
        }
        if ($isReviving) {
            isReviving.set(false);
            reviveSound.pause();
            reviveSound.currentTime = 0;
        }

        // Restart the timer for the next encounter if the game is running
        if ($gameRunning) {
            scheduleDoorbell();
        }
    }

    function startBossEncounter() {
        if (!$bossAwake || $bossEncounterActive) return;
        bossEncounterActive.set(true);

        // Randomly select and play a chase music track
        const trackNumber = Math.floor(Math.random() * 5) + 1;
        chaseMusic = new Audio(`/sounds/zombiechase${trackNumber}.mp3`);
        chaseMusic.loop = true;
        chaseMusic.play();

        encounterTimeout = setTimeout(dropAggro, 20000);
    }

    function replenish(meterId) {
        meters.update(currentMeters => {
            const meter = currentMeters.find(m => m.id === meterId);
            if (meter) {
                meter.value = Math.min(100, meter.value + meter.replenish);
            }
            return currentMeters;
        });
        replenishSound.play();
    }

    function handleKeydown(e, meterId) {
        if (e.key === 'Enter' || e.key === ' ') {
            replenish(meterId);
        }
    }

    function startGame() {
        if ($isDown || $isReviving || $gameWon) return;
        gameRunning.set(true);
    }

    function pauseGame() {
        if ($isDown || $isReviving || $gameWon) return;
        gameRunning.set(false);
    }

    function scheduleDoorbell() {
        if (doorbellTimeout) clearTimeout(doorbellTimeout);
        const timeToDoorbell = (Math.random() * ($settings.doorbellMaxTime - $settings.doorbellMinTime) + $settings.doorbellMinTime) * 1000;

        console.log(`Next doorbell in: ${timeToDoorbell / 1000}s`); // For debugging

        doorbellTimeout = setTimeout(() => {
            doorbellSound.play();
            npcStatus.set('The boss is waking up!');
            bossAwake.set(true);
        }, timeToDoorbell);
    }

    function resetGame() {
        gameWon.set(false);
        previousHour = 0;
        gameTime.set(0);
        gameRunning.set(false);
        lives.set($settings.startingLives);
        npcStatus.set('');
        isDown.set(false);
        isReviving.set(false);
        bossAwake.set(false);
        bossEncounterActive.set(false);
        if (chaseMusic) {
            chaseMusic.pause();
            chaseMusic.currentTime = 0;
        }
        clearTimeout(encounterTimeout);
        meters.update(currentMeters => {
            return currentMeters.map(meter => ({ ...meter, value: 100 }));
        });
    }

    onMount(() => {
        const unsubscribeGameRunning = gameRunning.subscribe(running => {
            if (running && !$isDown && !$isReviving) {
                if ($bossEncounterActive && chaseMusic) chaseMusic.play();
                scheduleDoorbell();
                gameLoop = setInterval(() => {
                    gameTime.update(t => t + 1);
                    meters.update(currentMeters => {
                        if ($lives <= 0) {
                            gameRunning.set(false);
                            npcStatus.set('Game Over!');
                            if (chaseMusic) {
                                chaseMusic.pause();
                                chaseMusic.currentTime = 0;
                            }
                            bossAwake.set(false);
                            bossEncounterActive.set(false);
                            clearTimeout(encounterTimeout);
                            return currentMeters;
                        }
                        return currentMeters.map(meter => {
                            const newValue = Math.max(0, meter.value - meter.rate);
                            if (newValue === 0) {
                                lives.update(l => Math.max(0, l - 1));
                                return { ...meter, value: 100 };
                            }
                            return { ...meter, value: newValue };
                        });
                    });
                }, 1000);
            } else {
                if ($bossEncounterActive && chaseMusic) chaseMusic.pause();
                clearInterval(gameLoop);
                clearTimeout(doorbellTimeout);
                clearTimeout(encounterTimeout);
            }
        });

        return () => {
            unsubscribeGameRunning();
            clearInterval(gameLoop);
            clearTimeout(doorbellTimeout);
            clearTimeout(encounterTimeout);
        };
    });
</script>

{#if $gameWon}
<div class="win-overlay">
    <div class="win-message">
        <h1>You Survived!</h1>
        <p>Congratulations!</p>
        <button on:click={resetGame}>Play Again</button>
    </div>
</div>
{/if}

<div class="game-controls">
    <button id="play-pause-btn" class:paused={!$gameRunning} on:click={$gameRunning ? pauseGame : startGame} disabled={$isDown || $isReviving || $gameWon}>
        <i class="fas fa-{$gameRunning ? 'pause' : 'play'}"></i>
    </button>
    <div class="game-stats">
        <div id="time-elapsed">Time: {$gameTime}s</div>
        <div id="lives-container">
            {#each Array($lives) as _}
                <i class="fas fa-heart"></i>
            {/each}
        </div>
        <div id="npc-status">{$npcStatus}</div>
    </div>
    {#if $bossAwake && !$bossEncounterActive}
        <button id="damage-btn" class="start-encounter" on:click={startBossEncounter} disabled={$gameWon}>
            <i class="fas fa-khanda"></i>
        </button>
    {:else if $bossEncounterActive}
        <div class="encounter-buttons">
            <button id="damage-btn" class:reviving={$isDown} on:click={$isDown ? startRevive : downPlayer} disabled={$isReviving || $gameWon}>
                <i class="fas fa-{$isDown ? 'dove' : 'skull'}"></i>
            </button>
            <button id="drop-aggro-btn" on:click={dropAggro} disabled={$gameWon}>
                <i class="fas fa-shield-alt"></i>
            </button>
        </div>
    {/if}
</div>

<div class="in-game-clock">
    {$displayHour}
</div>

<div class="meters">
    {#each $meters as meter (meter.id)}
    <div class="meter" role="button" tabindex="0" on:click={() => replenish(meter.id)} on:keydown={(e) => handleKeydown(e, meter.id)}>
        <div class="progress-wrapper">
            <progress style="--progress-color: {meter.color}" value={meter.value} max="100"></progress>
            <span class="progress-label">{meter.name}</span>
        </div>
    </div>
    {/each}
</div>

{#if $npcStatus}
    <div id="npc-status">{$npcStatus}</div>
{/if}
