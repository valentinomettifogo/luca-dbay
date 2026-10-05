<script>
  let { gameState, ondeal, onhit, onstand, oncontinue, onrestart } = $props()
</script>

<div class="controls">
  <button class="btn btn-primary" class:hidden={gameState !== 'ready'} onclick={ondeal}>
    Nuova Mano
  </button>

  <button class="btn btn-secondary" class:hidden={gameState !== 'playing'} onclick={onhit}>
    Carta
  </button>

  <button class="btn btn-success" class:hidden={gameState !== 'playing'} onclick={onstand}>
    Stai
  </button>

  <button class="btn btn-success" class:hidden={gameState !== 'won'} onclick={oncontinue}>
    🎉 Continua!
  </button>

  <button class="btn btn-primary" class:hidden={gameState !== 'lost'} onclick={onrestart}>
    🔄 Ricomincia
  </button>

  <button class="btn btn-secondary" class:hidden={gameState !== 'tie'} onclick={oncontinue}>
    🤝 Prossima Mano
  </button>
</div>
