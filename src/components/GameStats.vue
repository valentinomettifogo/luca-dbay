<template>
  <div class="stats">
    <div class="stat">
      <span class="stat-value">{{ wins }}</span>
      <div>Vittorie</div>
    </div>
    <div class="stat">
      <span class="stat-value">{{ games }}</span>
      <div>Partite</div>
    </div>
    <div class="stat">
      <span class="stat-value">{{ streak }}</span>
      <div>Serie</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  wins: {
    type: Number,
    default: 0
  },
  games: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  }
})
</script>