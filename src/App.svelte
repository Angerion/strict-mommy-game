<script>
  import Game from './Game.svelte';
  import Admin from './Admin.svelte';
  import { gameRunning } from './stores.js';

  let activeTab = 'Game';
  let isPausedFromAdmin = false;

  function openTab(tabName) {
    activeTab = tabName;
    // Auto-pause game when switching to Admin tab
    if (tabName === 'Admin' && $gameRunning) {
      isPausedFromAdmin = true;
      // This will be handled by Admin component - we just set the flag
    }
  }

  function switchToGameTab() {
    activeTab = 'Game';
  }

  function handlePauseFromAdmin() {
    if ($gameRunning) {
      isPausedFromAdmin = true;
      // This will be handled by Admin component
    }
  }

  // Update tab title to show pause icon when paused from admin
  $: gameTabTitle = isPausedFromAdmin && !$gameRunning ? 'Game ⏸️' : 'Game';
</script>

<div class="app-container">
  <!-- Sticky tabs at top -->
  <div class="tabs-sticky">
    <button class="tab-link" class:active={activeTab === 'Game'} on:click={() => openTab('Game')}>
      {gameTabTitle}
    </button>
    <button class="tab-link" class:active={activeTab === 'Admin'} on:click={() => openTab('Admin')}>
      Game Admin
    </button>
  </div>

  <!-- Scrollable main content area -->
  <div class="main-content">
    {#if activeTab === 'Game'}
      <div class="tab-content">
        <Game bind:isPausedFromAdmin />
      </div>
    {/if}

    {#if activeTab === 'Admin'}
      <div class="tab-content">
        <Admin bind:isPausedFromAdmin onSwitchToGame={switchToGameTab} />
      </div>
    {/if}
  </div>
</div>

<style>
  .app-container {
    height: 95vh;
    display: flex;
    flex-direction: column;
    max-width: 800px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    overflow: hidden;
  }

  .tabs-sticky {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    width: 100%;
    border-bottom: 1px solid #ccc;
    background-color: #fff;
    border-radius: 8px 8px 0 0;
  }

  .tab-link {
    background-color: inherit;
    flex: 1;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 14px 16px;
    transition: 0.3s;
    font-size: 17px;
    text-align: center;
    font-weight: 500;
  }

  .tab-link:hover {
    background-color: #ddd;
  }

  .tab-link.active {
    background-color: #ccc;
    font-weight: 600;
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0;
  }

  .tab-content {
    padding: 15px;
    height: auto;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Custom scrollbar */
  .main-content::-webkit-scrollbar {
    width: 8px;
  }

  .main-content::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .main-content::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  .main-content::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
</style>
