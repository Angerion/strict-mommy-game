<script>
  import Game from './Game.svelte';
  import Admin from './Admin.svelte';

  let activeTab = 'Game';

  function openTab(tabName) {
    activeTab = tabName;
  }
</script>

<div class="wrapper">
  <div class="tabs">
    <button class="tab-link" class:active={activeTab === 'Game'} on:click={() => openTab('Game')}>Game</button>
    <button class="tab-link" class:active={activeTab === 'Admin'} on:click={() => openTab('Admin')}>Game Admin</button>
  </div>

  {#if activeTab === 'Game'}
    <div class="tab-content" style="display: block;">
      <Game />
    </div>
  {/if}

  {#if activeTab === 'Admin'}
    <div class="tab-content" style="display: block;">
      <Admin />
    </div>
  {/if}
</div>
