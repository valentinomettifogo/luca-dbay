<template>
  <div 
    class="card" 
    :class="{ 
      'card-back': isHidden,
      dealing: shouldAnimate,
      flipping: shouldFlip,
      hidden: !isVisible
    }"
    :style="cardStyle"
  >
    <template v-if="isHidden">
      🎂
    </template>
    <template v-else>
      <div class="card-suit" :style="{ color: card.suitColor }">
        {{ card.suit }}
      </div>
      <div class="card-value">
        {{ card.value }}
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  delay: {
    type: Number,
    default: 0
  }
})

const shouldAnimate = ref(false)
const shouldFlip = ref(false)
const wasHidden = ref(props.isHidden)
const isVisible = ref(props.delay === 0) // Visibile subito solo se non c'è delay

const cardStyle = computed(() => {
  if (props.isHidden) {
    return {
      background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
      color: 'white',
      fontSize: '2rem'
    }
  }
  return {}
})

// Animazione quando viene rivelata una carta nascosta
watch(() => props.isHidden, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    // La carta era nascosta e ora viene rivelata
    shouldFlip.value = true
    setTimeout(() => {
      shouldFlip.value = false
    }, 1200) // Durata dell'animazione flip
  }
})

onMounted(() => {
  wasHidden.value = props.isHidden
  
  if (props.delay > 0) {
    // Nascondi la carta inizialmente
    isVisible.value = false
    
    setTimeout(() => {
      // Mostra la carta e avvia l'animazione simultaneamente
      isVisible.value = true
      shouldAnimate.value = true
      
      setTimeout(() => {
        shouldAnimate.value = false
      }, 800) // Durata dell'animazione deal
    }, props.delay)
  } else {
    // Nessun delay, mostra subito con animazione
    isVisible.value = true
    shouldAnimate.value = true
    setTimeout(() => {
      shouldAnimate.value = false
    }, 800)
  }
})
</script>