<script>
    import { onMount } from 'svelte';
    import { derived } from 'svelte/store';
    import { gameTime, gameRunning, lives, meters, settings, npcStatus, isDown, isReviving, bossAwake, bossEncounterActive, gameWon, audioSettings, gameHasBeenReset } from './stores.js';
    import LeftColumn from './components/LeftColumn.svelte';
    import CenterColumn from './components/CenterColumn.svelte';
    import RightColumn from './components/RightColumn.svelte';
    import MetersPanel from './components/MetersPanel.svelte';

    export let isPausedFromAdmin = false;

    let gameLoop;
    let millisecondLoop;
    let doorbellTimeout;
    let doorbellStartTime;
    let doorbellRemainingTime;
    let encounterTimeout;
    let wasRunning = false;
    let chaseMusic; // Will hold the current chase music audio object
    let gameStartTime = 0;
    let currentMilliseconds = 0;
    let refillInterval = null;
    let refillingMeterId = null;
    const replenishSound = new Audio('/sounds/replenish.mp3');
    const refillHoldSound = new Audio('/sounds/refill-hold.mp3');
    const doorbellSound = new Audio('/sounds/doorbell.mp3');
    const reviveSound = new Audio('/sounds/revive.mp3');
    const clockSound = new Audio('/sounds/grandfather_clock.mp3');
    const rustleSound = new Audio('/sounds/rustle.mp3');

    // Function to apply audio settings to sound effects
    function applyAudioSettings() {
        if (!$audioSettings) return;

        const soundVolume = $audioSettings.muteSounds ? 0 :
            $audioSettings.masterVolume * $audioSettings.soundEffectsVolume;

        replenishSound.volume = soundVolume;
        refillHoldSound.volume = soundVolume;
        doorbellSound.volume = soundVolume;
        reviveSound.volume = soundVolume;
        clockSound.volume = soundVolume;
        rustleSound.volume = soundVolume;

        // Also update chase music volume if it exists
        if (chaseMusic) {
            const musicVolume = $audioSettings.muteMusic ? 0 :
                $audioSettings.masterVolume * $audioSettings.musicVolume;
            chaseMusic.volume = musicVolume;
        }
    }

    // Apply audio settings whenever they change
    $: if ($audioSettings) {
        applyAudioSettings();
    }

    // --- New Clock Logic ---
    const secondsPerGameHour = derived(settings, $settings => ($settings.gameLengthMinutes * 60) / 6);

    const inGameHour = derived([gameTime, secondsPerGameHour], ([$gameTime, $secondsPerGameHour]) => {
        if (!$secondsPerGameHour || $secondsPerGameHour <= 0) return 0;
        return Math.floor($gameTime / $secondsPerGameHour);
    });

    const displayHour = derived(inGameHour, $inGameHour => {
        if ($inGameHour >= 6) return { hour: '6', period: 'AM' };
        return { hour: $inGameHour.toString().padStart(2, '0'), period: 'AM' };
    });

    // Create formatted time display ({MM}m {SS}s {MS}ms format)
    let formattedTime = '00m 00s 00ms';
    $: {
        const minutes = Math.floor($gameTime / 60);
        const seconds = $gameTime % 60;
        const milliseconds = Math.floor(currentMilliseconds / 10); // Convert to centiseconds (0-99)
        formattedTime = `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s ${milliseconds.toString().padStart(2, '0')}ms`;
    }

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

        // Apply audio settings to chase music
        const musicVolume = $audioSettings.muteMusic ? 0 :
            $audioSettings.masterVolume * $audioSettings.musicVolume;
        chaseMusic.volume = musicVolume;

        chaseMusic.play();

        encounterTimeout = setTimeout(dropAggro, 20000);
    }

    function startRefill(meterId) {
        const meter = $meters.find(m => m.id === meterId);
        if (!meter) return;

        // If not hold-to-refill, use the old replenish logic
        if (!meter.holdToRefill) {
            replenish(meterId);
            return;
        }

        // Logic for hold-to-refill
        if (refillingMeterId) return; // Already refilling another meter

        refillingMeterId = meterId;
        refillHoldSound.loop = true;
        refillHoldSound.play();

        // The formula: replenish amount over 5 seconds, ticked every 0.1s
        const ticksPerFiveSeconds = 50; // 5s / 0.1s
        const refillAmountPerTick = meter.replenish / ticksPerFiveSeconds;

        refillInterval = setInterval(() => {
            meters.update(currentMeters => {
                const m = currentMeters.find(m => m.id === meterId);
                if (m) {
                    m.value = Math.min(100, m.value + refillAmountPerTick);
                    if (m.value >= 100) {
                        stopRefill();
                    }
                }
                return currentMeters;
            });
        }, 100);
    }

    function stopRefill() {
        if (!refillingMeterId) return;

        clearInterval(refillInterval);
        refillInterval = null;
        refillingMeterId = null;

        refillHoldSound.pause();
        refillHoldSound.currentTime = 0;
    }

    function replenish(meterId) {
        // This function is now only for click-to-replenish and consumables
        meters.update(currentMeters => {
            const meter = currentMeters.find(m => m.id === meterId);
            if (!meter) return currentMeters;

            // Check if this meter has consumables enabled and available
            if (meter.consumable.enabled && meter.consumable.count > 0) {
                // Use consumable - restore to full and decrement count
                meter.value = 100;
                meter.consumable.count--;
                replenishSound.play();
            } else if (!meter.consumable.enabled && !meter.holdToRefill) {
                // Use normal replenish for meters without consumables and not hold-to-refill
                meter.value = Math.min(100, meter.value + meter.replenish);
                replenishSound.play();
            }
            // If meter has consumables enabled but none are left, do nothing
            // If meter is holdToRefill, do nothing on a single click

            return currentMeters;
        });
    }

    function handleKeydown(e, meterId) {
        if (e.key === 'Enter' || e.key === ' ') {
            const meter = $meters.find(m => m.id === meterId);
            if (meter && meter.holdToRefill) {
                startRefill(meterId);
            } else {
                replenish(meterId);
            }
        }
    }

    function handleKeyup(e, meterId) {
        if (e.key === 'Enter' || e.key === ' ') {
            const meter = $meters.find(m => m.id === meterId);
            if (meter && meter.holdToRefill) {
                stopRefill();
            }
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
        const absoluteSecondsModifier = ($settings.rustleAbsoluteSecondsModifier || 0) * 1000; // Convert to milliseconds

        // New formula: TIMER - (percentage reduction) - absolute seconds modifier
        const newRemainingTime = timeBefore - timeToReduce - absoluteSecondsModifier;

        console.log(`Rustle triggered!`);
        console.log(`Time before: ${(timeBefore / 1000).toFixed(2)}s`);
        console.log(`Time reduced by: ${(timeToReduce / 1000).toFixed(2)}s (${(rustlePercent * 100).toFixed(0)}%)`);
        console.log(`Additional time reduced by absolute modifier: ${(absoluteSecondsModifier / 1000).toFixed(2)}s`);
        console.log(`New time until doorbell: ${(newRemainingTime / 1000).toFixed(2)}s`);

        // Reschedule the doorbell with the new time
        clearTimeout(doorbellTimeout);
        doorbellRemainingTime = Math.max(newRemainingTime, 0); // Ensure we don't have negative time
        doorbellStartTime = Date.now(); // Reset the start time for the new timer
        doorbellTimeout = setTimeout(triggerDoorbell, doorbellRemainingTime);
    }

    function startGame() {
        if ($isDown || $isReviving || $gameWon) return;
        gameRunning.set(true);
        gameHasBeenReset.set(false); // Hide play button until next reset
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
        gameHasBeenReset.set(true); // Allow play button to be shown again
        gameStartTime = 0;
        currentMilliseconds = 0;
        if (chaseMusic) {
            chaseMusic.pause();
            chaseMusic.currentTime = 0;
        }
        clearTimeout(encounterTimeout);
        clearTimeout(doorbellTimeout);
        clearInterval(millisecondLoop);
        clearInterval(refillInterval); // Also clear refill interval on reset
        refillHoldSound.pause();
        refillHoldSound.currentTime = 0;
        refillingMeterId = null;
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

                // Set the game start time for millisecond tracking
                if (gameStartTime === 0) {
                    gameStartTime = Date.now();
                }

                // Start millisecond counter
                millisecondLoop = setInterval(() => {
                    currentMilliseconds = (Date.now() - gameStartTime) % 1000;
                }, 10); // Update every 10ms for smooth animation

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
                            // Do not decay the meter that is currently being refilled
                            if (meter.id === refillingMeterId) {
                                return meter;
                            }

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
                clearInterval(millisecondLoop);

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
            clearInterval(millisecondLoop);
            clearTimeout(doorbellTimeout);
            clearTimeout(encounterTimeout);
            clearInterval(refillInterval);
        };
    });
</script>

{#if $gameWon}
<div class="win-overlay">
      <!-- Game Time Clock at Top -->
    <div class="game-clock">
        <div class="clock-frame">
            <div class="clock-hour">{displayHour.hour}</div>
            <div class="clock-period">{displayHour.period}</div>
        </div>
    </div>
    <div class="win-message">
        <h1>You Survived!</h1>
        <p>Congratulations!</p>
        <button on:click={resetGame}>Play Again</button>
    </div>
</div>
{/if}

<div class="game-container">
    <!-- Three Column Layout -->
    <div class="game-layout">
        <LeftColumn
            onStartGame={startGame}
            onPauseGame={pauseGame}
            onRustle={rustle}
        />

        <CenterColumn
            displayHour={$displayHour}
            formattedTime={formattedTime}
        />

        <RightColumn
            onStartBossEncounter={startBossEncounter}
            onDownPlayer={downPlayer}
            onStartRevive={startRevive}
            onDropAggro={dropAggro}
        />
    </div>

    <!-- Meters Panel with Scrolling -->
    <div class="meters-wrapper">
        <MetersPanel
            onStartRefill={startRefill}
            onStopRefill={stopRefill}
            onHandleKeydown={handleKeydown}
            onHandleKeyup={handleKeyup}
        />
    </div>
</div>

<style>
    .game-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 15px;
        box-sizing: border-box;
    }
    .meters-wrapper {
        flex: 1;
        min-height: 0; /* Prevent flex item from overflowing its container */
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }
</style>
