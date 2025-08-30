<script>
    import { gameTime, gameRunning, lives, meters, settings, npcStatus, isDown, isReviving } from './stores.js';
    import { onMount } from 'svelte';

    let gameLoop;
    let doorbellTimeout;
    let wasRunning = false;
    const replenishSound = new Audio('/sounds/replenish.mp3');
    const doorbellSound = new Audio('/sounds/doorbell.mp3');
    const reviveSound = new Audio('/sounds/revive.mp3');

    function downPlayer() {
        if ($lives <= 0 || $isDown || $isReviving) return;

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
        }, 8000);
    }


    function startGame() {
        if ($isDown || $isReviving) return;
        gameRunning.set(true);
    }

    function pauseGame() {
        if ($isDown || $isReviving) return;
        gameRunning.set(false);
    }

    onMount(() => {
        const unsubscribeGameRunning = gameRunning.subscribe(running => {
            if (running && !$isDown && !$isReviving) {
                scheduleDoorbell();
                gameLoop = setInterval(() => {
                    gameTime.update(t => t + 1);
                    meters.update(m => {
                        m.forEach(meter => {
                            meter.value = Math.max(0, meter.value - meter.rate);
                        });
                        return m;
                    });
                }, 1000);
            } else {
                clearInterval(gameLoop);
                clearTimeout(doorbellTimeout);
                gameLoop = null;
                doorbellTimeout = null;
            }
        });

        return () => {
            unsubscribeGameRunning();
            clearInterval(gameLoop);
            clearTimeout(doorbellTimeout);
        };
    });

    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    }


    function scheduleDoorbell() {
        const time = Math.random() * ($settings.doorbellMaxTime - $settings.doorbellMinTime) + $settings.doorbellMinTime;
        doorbellTimeout = setTimeout(() => {
            doorbellSound.play();
            npcStatus.set('The bad guy is waking up!');
            setTimeout(() => {
                npcStatus.set('');
            }, 5000);
            if($gameRunning) scheduleDoorbell();
        }, time * 1000);
    }

    function replenish(meterId) {
        replenishSound.play();
        meters.update(m => {
            const meter = m.find(meter => meter.id === meterId);
            if (meter) {
                meter.value = Math.min(100, meter.value + meter.replenish);
            }
            return m;
        });
    }

    function handleKeydown(e, meterId) {
        if (e.key === 'Enter' || e.key === ' ') {
            replenish(meterId);
        }
    }
</script>

<div class="game-controls">
    <button id="play-pause-btn" class:paused={!$gameRunning} on:click={$gameRunning ? pauseGame : startGame} disabled={$isDown || $isReviving}>
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
    <button id="damage-btn" class:reviving={$isDown} on:click={$isDown ? startRevive : downPlayer} disabled={$isReviving}>
        <i class="fas fa-{$isDown ? 'dove' : 'skull'}"></i>
    </button>
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
