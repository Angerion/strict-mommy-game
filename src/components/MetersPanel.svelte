<script>
    import { meters } from '../stores.js';

    export let onReplenish;
    export let onHandleKeydown;
</script>

<div class="meters-container">
    <div class="meters-scroll">
        {#each $meters as meter (meter.id)}
        <div class="meter" role="button" tabindex="0" on:click={() => onReplenish(meter.id)} on:keydown={(e) => onHandleKeydown(e, meter.id)}>
            <div class="meter-icon">{meter.icon}</div>
            <div class="progress-wrapper">
                <div class="progress-label-container">
                    <span class="progress-label-centered">
                        {meter.name}
                    </span>

                    {#if meter.consumable.enabled}
                        <span class="consumable-icons">
                            {#each Array(meter.consumable.count).fill(0) as _}
                                <span class="consumable-icon">{meter.consumable.icon}</span>
                            {/each}
                        </span>
                    {/if}
                </div>
                <progress 
                    style="--progress-color: {meter.consumable.enabled && meter.consumable.count === 0 ? 'linear-gradient(to right, #808080, #a0a0a0)' : meter.color}" 
                    value={meter.value} 
                    max="100">
                </progress>
            </div>
        </div>
        {/each}
    </div>
</div>

<style>
    .meters-container {
        width: 100%;
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .meters-scroll {
        /* Allow scrolling when content overflows */
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 20px 5px 0 0; /* Top padding moved here, right padding for scrollbar */
    }

    /* Remove the height restriction on larger screens since we now use flex */

    .meter {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        padding: 10px;
        border-radius: 8px;
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .meter:hover {
        background-color: #e9ecef;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .meter:focus {
        outline: 2px solid #007bff;
        outline-offset: 2px;
    }

    .meter-icon {
        font-size: 24px;
        margin-right: 15px;
        min-width: 30px;
        text-align: center;
    }

    .progress-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .progress-label-container {
        position: relative;
        width: 100%;
        margin-bottom: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .progress-label-centered {
        font-size: 14px;
        font-weight: 600;
        color: #495057;
    }

    .progress-value-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: none;
    }

    .progress-value {
        font-size: 12px;
        font-weight: bold;
        color: #fff;
        text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
    }

    .consumable-icons {
        position: absolute;
        top: 50%;
        right: 5px;
        transform: translateY(-50%);
        display: flex;
        gap: 2px;
    }

    .consumable-icon {
        font-size: 12px;
        opacity: 0.9;
    }

    progress {
        width: 100%;
        height: 28px;
        border-radius: 12px;
        border: none;
        background-color: #e9ecef;
        overflow: hidden;
    }

    progress::-webkit-progress-bar {
        background-color: #e9ecef;
        border-radius: 12px;
    }

    progress::-webkit-progress-value {
        background-color: var(--progress-color, #007bff);
        border-radius: 12px;
        transition: width 0.3s ease;
    }

    progress::-moz-progress-bar {
        background-color: var(--progress-color, #007bff);
        border-radius: 12px;
    }

    /* Custom scrollbar for meters */
    .meters-scroll::-webkit-scrollbar {
        width: 6px;
    }

    .meters-scroll::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }

    .meters-scroll::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
    }

    .meters-scroll::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
</style>