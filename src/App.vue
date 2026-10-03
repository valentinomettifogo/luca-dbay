<template>
  <Blackjack2025 v-if="year === '2025'" @exit="selectYear(null)" />
  <Survivor2026 v-else-if="year === '2026'" @exit="selectYear(null)" />

  <div v-else class="intro-screen year-screen">
    <h1 class="title">🎉 Luca's Bday Game 🎉</h1>
    <p class="year-subtitle">Scegli l'edizione</p>
    <div class="year-buttons">
      <button
        v-for="option in YEARS"
        :key="option.year"
        class="year-button"
        :class="{ 'year-button--new': option.isNew }"
        @click="selectYear(option.year)"
      >
        <span class="year-number">{{ option.year }}</span>
        <span class="year-label">{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Blackjack2025 from './games/Blackjack2025.vue'
import Survivor2026 from './games/survivor2026/Survivor2026.vue'

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

const year = ref(readYear())

function selectYear(next) {
  window.location.hash = next ?? ''
}

function onHashChange() {
  year.value = readYear()
  if (!year.value) document.title = DEFAULT_TITLE
}

onMounted(() => window.addEventListener('hashchange', onHashChange))
onBeforeUnmount(() => window.removeEventListener('hashchange', onHashChange))
</script>
