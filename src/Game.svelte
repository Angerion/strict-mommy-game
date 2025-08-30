<script>
    import { gameTime, gameRunning, lives, meters, settings, npcStatus } from './stores.js';
    import { onMount } from 'svelte';

    let gameInterval;
    let doorbellTimeout;

    onMount(() => {
        const unsubscribe = gameRunning.subscribe(running => {
            if (running) {
                startGame();
            } else {
                pauseGame();
            }
        });

        return () => {
            unsubscribe();
            pauseGame(); // Cleanup on component destroy
        };
    });

    function startGame() {
        // Prevent multiple intervals
        if (gameInterval) clearInterval(gameInterval);
        if (doorbellTimeout) clearTimeout(doorbellTimeout);

        gameInterval = setInterval(() => {
            gameTime.update(t => t + 1);
            meters.update(m => {
                m.forEach(meter => {
                    meter.value = Math.max(0, meter.value - meter.rate);
                });
                return m;
            });
        }, 1000);
        scheduleDoorbell();
    }

    function pauseGame() {
        clearInterval(gameInterval);
        clearTimeout(doorbellTimeout);
        gameInterval = null;
        doorbellTimeout = null;
    }

    function loseLife() {
        lives.update(l => l - 1);
        if ($lives <= 0) {
            alert('Game Over!');
            gameRunning.set(false);
        }
        // Reset meters that hit 0
        meters.update(m => {
            m.forEach(meter => {
                if (meter.value <= 0) {
                    meter.value = 100;
                }
            });
            return m;
        });
    }

    // Watch for any meter hitting zero
    $: {
        if ($meters.some(m => m.value <= 0)) {
            loseLife();
        }
    }

    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    const wakeupSound = new Audio('bad-guy-wakeup.mp3');
    const clickSound = new Audio('button-3.mp3');

    function scheduleDoorbell() {
        const time = Math.random() * ($settings.doorbellMaxTime - $settings.doorbellMinTime) + $settings.doorbellMinTime;
        doorbellTimeout = setTimeout(() => {
            wakeupSound.play();
            npcStatus.set('The bad guy is waking up!');
            setTimeout(() => {
                npcStatus.set('');
            }, 5000);
            if($gameRunning) scheduleDoorbell();
        }, time * 1000);
    }

    function replenish(meterId) {
        clickSound.play();
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
    <button id="play-pause-btn" class:paused={$gameRunning} on:click={() => gameRunning.set(!$gameRunning)}>
        {#if $gameRunning}
            <i class="fas fa-pause"></i>
        {:else}
            <i class="fas fa-play"></i>
        {/if}
    </button>
    <div class="game-stats">
        <p>Game Time: {formatTime($gameTime)}</p>
        <div id="lives-container">
            {#each Array($lives) as _}
                <i class="fas fa-heart"></i>
            {/each}
        </div>
    </div>
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
