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
      <div class="card-back-pattern">🎂</div>
    </template>
    <template v-else-if="card.special">
      <!-- Carte speciali con immagine -->
      <div class="card-special">
        <!-- Immagine di sfondo -->
        <div class="card-special-background">
          <img 
            :src="card.image" 
            :alt="card.value" 
            class="card-special-bg-image"
            @error="onImageError"
          />
          <div class="card-special-bg-fallback">{{ card.value }}</div>
        </div>
        
        <!-- Contenuto sovrapposto -->
        <div class="card-special-overlay">
          <div class="card-special-header">
            <div class="card-special-title">{{ card.value }}</div>
            <img 
              :src="card.suit" 
              :alt="card.suitName" 
              class="card-special-suit"
            />
          </div>
          <div class="card-special-value">{{ card.numValue[0] > 0 ? '+' : '' }}{{ card.numValue[0] }}</div>
        </div>
      </div>
    </template>
    <template v-else>
      <!-- Carte normali -->
      <div class="card-content">
        <div class="card-value-top">{{ card.value }}</div>
        <img 
          :src="card.suit" 
          :alt="card.suitName" 
          class="card-suit-svg"
        />
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

function onImageError(event) {
  // Nascondi l'immagine e mostra il fallback
  event.target.style.display = 'none'
  event.target.nextElementSibling.style.display = 'flex'
}

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