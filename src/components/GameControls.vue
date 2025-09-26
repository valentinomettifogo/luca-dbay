<template>
  <div class="controls">
    <button 
      class="btn btn-primary" 
      :class="{ hidden: gameState !== 'ready' }"
      @click="$emit('deal')"
    >
      Nuova Mano
    </button>
    
    <button 
      class="btn btn-secondary" 
      :class="{ hidden: gameState !== 'playing' }"
      @click="$emit('hit')"
    >
      Carta
    </button>
    
    <button 
      class="btn btn-success" 
      :class="{ hidden: gameState !== 'playing' }"
      @click="$emit('stand')"
    >
      Stai
    </button>
    
    <button 
      class="btn btn-success" 
      :class="{ hidden: gameState !== 'won' }"
      @click="$emit('continue')"
    >
      🎉 Continua!
    </button>
    
    <button 
      class="btn btn-primary" 
      :class="{ hidden: gameState !== 'lost' }"
      @click="$emit('restart')"
    >
      🔄 Ricomincia
    </button>
    
    <button 
      class="btn btn-secondary" 
      :class="{ hidden: gameState !== 'tie' }"
      @click="$emit('continue')"
    >
      🤝 Prossima Mano
    </button>
  </div>
</template>

<script setup>
defineProps({
  gameState: {
    type: String,
    required: true
  }
})

defineEmits(['deal', 'hit', 'stand', 'next', 'continue', 'restart'])
</script>