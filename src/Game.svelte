<script>
    import { onMount } from 'svelte';
    import { derived } from 'svelte/store';
    import { gameTime, gameRunning, lives, meters, settings, npcStatus, isDown, isReviving, bossAwake, bossEncounterActive, gameWon, consumables } from './stores.js';

    let gameLoop;
    let doorbellTimeout;
    let doorbellStartTime;
    let doorbellRemainingTime;
    let encounterTimeout;
    let wasRunning = false;
    let chaseMusic; // Will hold the current chase music audio object
    const replenishSound = new Audio('/sounds/replenish.mp3');
    const doorbellSound = new Audio('/sounds/doorbell.mp3');
    const reviveSound = new Audio('/sounds/revive.mp3');
    const clockSound = new Audio('/sounds/grandfather_clock.mp3');
    const rustleSound = new Audio('/sounds/rustle.mp3');

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
        // Check if this meter has consumables and if any are available
        if ($consumables[meterId] && $consumables[meterId].count > 0) {
            // Use consumable for this meter
            consumables.update(currentConsumables => {
                const consumable = { ...currentConsumables[meterId] };
                if (consumable.count > 0) {
                    consumable.count--;
                    return {
                        ...currentConsumables,
                        [meterId]: consumable
                    };
                }
                return currentConsumables;
            });
            
            // Restore meter to full (100%) using consumable
            meters.update(currentMeters => {
                const meter = currentMeters.find(m => m.id === meterId);
                if (meter) {
                    meter.value = 100; // Full restoration with consumable
                }
                return currentMeters;
            });
            replenishSound.play();
        } else if (!$consumables[meterId]) {
            // Use normal replenish for meters without consumables
            meters.update(currentMeters => {
                const meter = currentMeters.find(m => m.id === meterId);
                if (meter) {
                    meter.value = Math.min(100, meter.value + meter.replenish);
                }
                return currentMeters;
            });
            replenishSound.play();
        }
        // If meter has consumables but none are left, do nothing (no sound/effect)
    }

    function handleKeydown(e, meterId) {
        if (e.key === 'Enter' || e.key === ' ') {
            replenish(meterId);
        }
    }

    function rustle() {
        if (!$gameRunning || !doorbellRemainingTime || !doorbellStartTime) return;

        rustleSound.play();

        // First, calculate the actual time left at this very moment
        const elapsedSinceTimerStart = Date.now() - doorbellStartTime;
        const actualCurrentRemainingTime = doorbellRemainingTime - elapsedSinceTimerStart;

        if (actualCurrentRemainingTime <= 0) return; // Can't rustle a timer that's already due

        const rustlePercent = (Math.random() * ($settings.rustleMaxPercent - $settings.rustleMinPercent) + $settings.rustleMinPercent) / 100;

        const timeBefore = actualCurrentRemainingTime; // Log the correct current time
        const timeToReduce = timeBefore * rustlePercent;
        const newRemainingTime = timeBefore - timeToReduce;

        console.log(`Rustle triggered!`);
        console.log(`Time before: ${(timeBefore / 1000).toFixed(2)}s`);
        console.log(`Time reduced by: ${(timeToReduce / 1000).toFixed(2)}s (${(rustlePercent * 100).toFixed(0)}%)`);
        console.log(`New time until doorbell: ${(newRemainingTime / 1000).toFixed(2)}s`);

        // Reschedule the doorbell with the new, shorter time
        clearTimeout(doorbellTimeout);
        doorbellRemainingTime = newRemainingTime; // This is now the new total duration
        doorbellStartTime = Date.now(); // Reset the start time for the new timer
        doorbellTimeout = setTimeout(triggerDoorbell, doorbellRemainingTime);
    }

    function startGame() {
        if ($isDown || $isReviving || $gameWon) return;
        gameRunning.set(true);
    }

    function pauseGame() {
        if ($isDown || $isReviving || $gameWon) return;
        gameRunning.set(false);
    }

    function triggerDoorbell() {
        doorbellSound.play();
        npcStatus.set('The boss is waking up!');
        bossAwake.set(true);
        doorbellRemainingTime = null; // Timer has fired
    }

    function scheduleDoorbell(resumeTime = null) {
        if (doorbellTimeout) clearTimeout(doorbellTimeout);

        // On pause/resume, resumeTime will be the updated remaining time.
        // Otherwise, calculate a new random time.
        const duration = resumeTime || (Math.random() * ($settings.doorbellMaxTime - $settings.doorbellMinTime) + $settings.doorbellMinTime) * 1000;

        console.log(`Next doorbell in: ${(duration / 1000).toFixed(2)}s`);

        doorbellStartTime = Date.now();
        doorbellRemainingTime = duration; // Store the full duration of this timer
        doorbellTimeout = setTimeout(triggerDoorbell, doorbellRemainingTime);
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
        clearTimeout(doorbellTimeout);
        doorbellRemainingTime = null;
        meters.update(currentMeters => {
            return currentMeters.map(meter => ({ ...meter, value: 100 }));
        });
    }

    onMount(() => {
        const unsubscribeGameRunning = gameRunning.subscribe(running => {
            if (running && !$isDown && !$isReviving) {
                if ($bossEncounterActive && chaseMusic) chaseMusic.play();

                // If resuming, use remaining time, otherwise schedule a new one
                scheduleDoorbell(doorbellRemainingTime);

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

                // Pause the doorbell timer
                if (doorbellTimeout) {
                    clearTimeout(doorbellTimeout);
                    // Update remaining time by subtracting the time that has passed since the timer started
                    doorbellRemainingTime -= (Date.now() - doorbellStartTime);
                }
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
    {#if $gameRunning && !$bossAwake && !$bossEncounterActive}
        <button id="rustle-btn" on:click={rustle}>
            <i class="fas fa-wind"></i>
        </button>
    {/if}
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
            <span class="progress-label">
                {meter.name}
                {#if $consumables[meter.id]}
                    <span class="consumable-count">
                        {$consumables[meter.id].icon} {$consumables[meter.id].count}
                    </span>
                {/if}
            </span>
        </div>
    </div>
    {/each}
</div>

{#if $npcStatus}
    <div id="npc-status">{$npcStatus}</div>
{/if}
