<template>
  <div class="particles" id="particles"></div>
  
  <!-- Schermata Introduttiva -->
  <div v-if="game.currentScreen === 'intro'" class="intro-screen">
    <h1 class="title">🎉 Luca's Birthday Game 🎉</h1>
    
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
    

    
    <div class="message" :class="messageClass" v-html="message"></div>
    
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
        <p class="popup-ps"><em>P.S. - Ora che sei diventato così bravo,<br>
        forse è ora di sfidare qualcuno a Balatro! 😉</em></p>
      </div>
      <button class="popup-close" @click="closeCongratulations">
        🎊 Fantastico!
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
  closeCongratulations
} = useBlackjackGame()
</script>