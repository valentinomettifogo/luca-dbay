<template>
  <div class="progress-bar">
    <div 
      class="progress-fill" 
      :style="{ width: percentage + '%', background: progressBackground }"
    >
      {{ progressText }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: {
    type: Number,
    default: 0
  }
})

const percentage = computed(() => Math.min(props.progress, 5) / 5 * 100)

const progressText = computed(() => {
  if (props.progress >= 5) {
    return '🎉 SORPRESA SBLOCCATA! 🎉'
  }
  return `${Math.min(props.progress, 5)}/5 per la sorpresa!`
})

const progressBackground = computed(() => {
  if (props.progress >= 5) {
    return 'linear-gradient(45deg, #55a3ff, #003d82)'
  }
  return 'linear-gradient(45deg, #ff6b6b, #feca57)'
})
</script>