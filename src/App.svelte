<script>
  import Blackjack2025 from './games/blackjack2025/Blackjack2025.svelte'
  import Survivor2026 from './games/survivor2026/Survivor2026.svelte'

  const DEFAULT_TITLE = "🎉 Luca's Bday Game 🎉"
  const YEARS = [
    { year: '2025', label: '🃏 Blackjack', isNew: false },
    { year: '2026', label: '🎈 Sopravvivi agli amici', isNew: true },
  ]
  const VALID_YEARS = YEARS.map(option => option.year)

  // L'anno scelto vive nell'hash (#2025 / #2026): così il tasto "indietro" del telefono torna alla scelta
  const readYear = () => {
    const hash = window.location.hash.slice(1)
    return VALID_YEARS.includes(hash) ? hash : null
  }

  let year = $state(readYear())

  function selectYear(next) {
    window.location.hash = next ?? ''
  }

  function onHashChange() {
    year = readYear()
    if (!year) document.title = DEFAULT_TITLE
  }

  const exitToMenu = () => selectYear(null)
</script>

<svelte:window onhashchange={onHashChange} />

{#if year === '2025'}
  <Blackjack2025 onexit={exitToMenu} />
{:else if year === '2026'}
  <Survivor2026 onexit={exitToMenu} />
{:else}
  <div class="intro-screen year-screen">
    <h1 class="title">🎉 Luca's Bday Game 🎉</h1>
    <p class="year-subtitle">Scegli l'edizione</p>
    <div class="year-buttons">
      {#each YEARS as option (option.year)}
        <button
          class="year-button"
          class:year-button--new={option.isNew}
          onclick={() => selectYear(option.year)}
        >
          <span class="year-number">{option.year}</span>
          <span class="year-label">{option.label}</span>
        </button>
      {/each}
    </div>
  </div>
{/if}
