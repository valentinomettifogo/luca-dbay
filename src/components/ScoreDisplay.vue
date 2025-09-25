<template>
  <div 
    class="score-display" 
    :class="{ 
      bust: isBust, 
      blackjack: isBlackjack 
    }"
  >
    {{ displayText }}
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: {
    type: [String, Number],
    required: true
  },
  isBlackjack: {
    type: Boolean,
    default: false
  },
  isBust: {
    type: Boolean,
    default: false
  }
})

const displayText = computed(() => {
  let text = props.score.toString()
  
  if (props.isBlackjack) {
    text += ' - BLACKJACK! 🎯'
  } else if (props.isBust) {
    text += ' - BUST! 💥'
  }
  
  return text
})
</script>