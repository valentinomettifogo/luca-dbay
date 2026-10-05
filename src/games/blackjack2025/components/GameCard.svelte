<script>
  import { onMount } from 'svelte'

  const DEAL_ANIMATION_MS = 800
  const FLIP_ANIMATION_MS = 1200

  let { card, isHidden = false, delay = 0 } = $props()

  let shouldAnimate = $state(false)
  let shouldFlip = $state(false)
  let isVisible = $state(false)
  let wasHidden = false

  // Animazione quando viene rivelata una carta nascosta
  $effect(() => {
    if (wasHidden && !isHidden) {
      shouldFlip = true
      setTimeout(() => { shouldFlip = false }, FLIP_ANIMATION_MS)
    }
    wasHidden = isHidden
  })

  function onImageError(event) {
    // Nascondi l'immagine e mostra il fallback
    event.target.style.display = 'none'
    event.target.nextElementSibling.style.display = 'flex'
  }

  // La carta compare dopo il suo delay, insieme all'animazione di distribuzione
  function reveal() {
    isVisible = true
    shouldAnimate = true
    setTimeout(() => { shouldAnimate = false }, DEAL_ANIMATION_MS)
  }

  onMount(() => {
    if (delay === 0) {
      reveal()
      return
    }
    const showTimer = setTimeout(reveal, delay)
    return () => clearTimeout(showTimer)
  })
</script>

<div
  class={['card', { 'card-back': isHidden, dealing: shouldAnimate, flipping: shouldFlip, hidden: !isVisible }]}
  style:background={isHidden ? 'linear-gradient(45deg, #ff6b6b, #feca57)' : undefined}
  style:color={isHidden ? 'white' : undefined}
  style:font-size={isHidden ? '2rem' : undefined}
>
  {#if isHidden}
    <div class="card-back-pattern">🎂</div>
  {:else if card.special}
    <!-- Carte speciali con immagine -->
    <div class="card-special">
      <div class="card-special-background">
        <img src={card.image} alt={card.value} class="card-special-bg-image" onerror={onImageError} />
        <div class="card-special-bg-fallback">{card.value}</div>
      </div>

      <div class="card-special-overlay">
        <div class="card-special-header">
          <div class="card-special-title">{card.value}</div>
          <img src={card.suit} alt={card.suitName} class="card-special-suit" />
        </div>
        <div class="card-special-value">{card.numValue[0] > 0 ? '+' : ''}{card.numValue[0]}</div>
      </div>
    </div>
  {:else}
    <!-- Carte normali -->
    <div class="card-content">
      <div class="card-value-top">{card.value}</div>
      <img src={card.suit} alt={card.suitName} class="card-suit-svg" />
    </div>
  {/if}
</div>
