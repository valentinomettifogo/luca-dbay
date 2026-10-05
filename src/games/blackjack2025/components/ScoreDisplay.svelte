<script>
  let { score, isBlackjack = false, isBust = false } = $props()

  const suffix = $derived(isBlackjack ? ' - BLACKJACK! 🎯' : isBust ? ' - BUST! 💥' : '')
</script>

<div class="score-display" class:bust={isBust} class:blackjack={isBlackjack}>
  {score}{suffix}
</div>
