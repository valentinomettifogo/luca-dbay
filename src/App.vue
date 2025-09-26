<template>
  <div class="particles" id="particles"></div>
  
  <!-- Schermata Introduttiva -->
  <div v-if="game.currentScreen === 'intro'" class="intro-screen">
    <h1 class="title">🎉 Luca's Bday Game 🎉</h1>
    
    <div class="intro-content">
      <div class="game-explanation">
        <p><strong>Obiettivo:</strong> Batti il dealer <span class="highlight">5 volte consecutive</span> per sbloccare una sorpresa!</p>
        
        <div class="rules-compact">
          <div class="rule">🎯 Avvicinati a 21 senza sballare</div>
          <div class="rule">🤖 Il dealer si ferma a 17+</div>
          <div class="rule">🎂 Carte speciali di compleanno</div>
          <div class="rule spicy">🌶️ <strong>Carte spicy nascoste!</strong> 😏</div>
        </div>
      </div>
      
      <button class="play-button" @click="startFromIntro">
        🚀 Inizia a Giocare!
      </button>
    </div>
  </div>
  


  <!-- Schermata di Gioco -->
  <div v-if="game.currentScreen === 'game'" class="game-screen">
    <div class="game-header">
      <button class="back-button" @click="goBackHome">← Menu</button>
      <h2 class="game-title">Partita {{ game.games + 1 }}</h2>
      <div class="mini-progress">{{ game.wins }}/5 🏆</div>
    </div>
    
    <!-- Sezione Dealer -->
    <div class="dealer-section">
      <div class="section-title">🤖 Dealer</div>
      <ScoreDisplay 
        :score="dealerDisplayScore" 
        :is-blackjack="isDealerBlackjack"
        :is-bust="isDealerBust"
      />
      <div class="cards-area">
        <GameCard 
          v-for="(card, index) in dealerHand"
          :key="`dealer-${index}`"
          :card="card"
          :is-hidden="index === 1 && game.dealerHidden"
          :delay="index * 500"
        />
      </div>
    </div>
    
    <!-- Sezione Player -->
    <div class="player-section">
      <div class="section-title">🎈 Player</div>
      <ScoreDisplay 
        :score="playerScore" 
        :is-blackjack="isPlayerBlackjack"
        :is-bust="isPlayerBust"
      />
      <div class="cards-area">
        <GameCard 
          v-for="(card, index) in game.playerHand"
          :key="`player-${index}`"
          :card="card"
          :delay="index * 500"
        />
      </div>
    </div>
    
    <GameControls 
      :game-state="game.gameState"
      @deal="dealNewHand"
      @hit="hitPlayer" 
      @stand="playerStand"
      @continue="continueGame"
      @restart="backToStart"
    />
    
    <!-- 🚀 PANNELLO DEBUG - Solo in modalità sviluppo -->
    <div v-if="isDev" class="debug-panel">
      <details class="debug-details">
        <summary>🔧 Debug</summary>
        <div class="debug-buttons">
          <button @click="debugWin" class="debug-btn debug-win">
            🏆 Vittoria + Effetti
          </button>
          <button @click="debugInstantWin" class="debug-btn debug-instant">
            ⚡ Vittoria Immediata
          </button>
          <button @click="debugTestVideo" class="debug-btn debug-video">
            🎥 Test Video
          </button>
        </div>
      </details>
    </div>
  </div>

  <!-- Popup Congratulazioni -->
  <div v-if="game.showCongratulations" class="congratulations-popup">
    <div class="popup-content">
      <div class="popup-header">🎉 TANTI AUGURI LUCA! 🎉</div>
      <div class="popup-body">
        <p>Hai battuto il dealer <strong>5 volte consecutive!</strong></p>
        <p>Sei un vero asso del blackjack! 🃏</p>
        <br>
        <p>Che questo nuovo anno ti porti sempre<br>
        le carte giuste al momento giusto! 🎂🎈</p>
        <br>
        <p>I tuoi amici (e Dado che puzza)</p>
      </div>
      <button class="popup-close" @click="closeCongratulations">
        🎊 Fantastico!
      </button>
    </div>
  </div>

  <!-- Popup Video di Vittoria -->
  <div v-if="game.showVideoPopup" class="video-popup-overlay">
    <div class="video-popup-content">
      <div class="video-header">
        <h2>🎉 HAI VINTO! 🎉</h2>
        <p>Goditi questo momento epico!</p>
      </div>
      <div class="video-container">
        <iframe
          src="https://www.youtube.com/embed/3kyn9Es4HoY?autoplay=1&rel=0&modestbranding=1"
          title="Victory Video"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>
      <button class="video-close-btn" @click="closeVideoPopup">
        ✨ Continua a Giocare!
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBlackjackGame } from './composables/useBlackjackGame'
import GameStats from './components/GameStats.vue'
import ProgressBar from './components/ProgressBar.vue'
import ScoreDisplay from './components/ScoreDisplay.vue'
import GameCard from './components/GameCard.vue'
import GameControls from './components/GameControls.vue'

const gameComposable = useBlackjackGame()

const {
  game,
  message,
  messageClass,
  dealerHand,
  playerScore,
  dealerDisplayScore,
  isPlayerBlackjack,
  isPlayerBust,
  isDealerBlackjack,
  isDealerBust,
  startFromIntro,
  dealNewHand,
  hitPlayer,
  playerStand,
  continueGame,
  backToStart,
  goBackHome,
  closeCongratulations,
  closeVideoPopup
} = gameComposable

// 🚀 Funzioni debug disponibili solo in dev
const debugWin = gameComposable.debugWin || (() => {})
const debugInstantWin = gameComposable.debugInstantWin || (() => {})
const debugTestVideo = gameComposable.debugTestVideo || (() => {})

// 🚀 Controllo ambiente di sviluppo
const isDev = import.meta.env.DEV
</script>