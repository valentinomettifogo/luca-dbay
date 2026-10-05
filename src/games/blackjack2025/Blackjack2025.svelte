<script>
  import { createBlackjackGame } from './game.svelte.js'
  import ScoreDisplay from './components/ScoreDisplay.svelte'
  import GameCard from './components/GameCard.svelte'
  import GameControls from './components/GameControls.svelte'

  let { onexit } = $props()

  const blackjack = createBlackjackGame()
  const { game } = blackjack

  // 🚀 Pannello debug solo in sviluppo
  const isDev = import.meta.env.DEV
</script>

<div class="particles" id="particles"></div>

<!-- Schermata Introduttiva -->
{#if game.currentScreen === 'intro'}
  <div class="intro-screen">
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

      <button class="play-button" onclick={blackjack.startFromIntro}>
        🚀 Inizia a Giocare!
      </button>
      <button class="back-button" onclick={onexit}>← Scegli l'anno</button>
    </div>
  </div>
{/if}

<!-- Schermata di Gioco -->
{#if game.currentScreen === 'game'}
  <div class="game-screen">
    <div class="game-header">
      <button class="back-button" onclick={blackjack.goBackHome}>← Menu</button>
      <h2 class="game-title">Partita {game.games + 1}</h2>
      <div class="mini-progress">{game.wins}/5 🏆</div>
    </div>

    <!-- Sezione Dealer -->
    <div class="dealer-section">
      <div class="section-title">🤖 Dealer</div>
      <ScoreDisplay
        score={blackjack.dealerScore}
        isBlackjack={blackjack.isDealerBlackjack}
        isBust={blackjack.isDealerBust}
      />
      <div class="cards-area">
        {#each game.dealerHand as card, index (index)}
          <GameCard {card} isHidden={index === 1 && game.dealerHidden} delay={index * 500} />
        {/each}
      </div>
    </div>

    <!-- Sezione Player -->
    <div class="player-section">
      <div class="section-title">🎈 Player</div>
      <ScoreDisplay
        score={blackjack.playerScore}
        isBlackjack={blackjack.isPlayerBlackjack}
        isBust={blackjack.isPlayerBust}
      />
      <div class="cards-area">
        {#each game.playerHand as card, index (index)}
          <GameCard {card} delay={index * 500} />
        {/each}
      </div>
    </div>

    <GameControls
      gameState={game.gameState}
      ondeal={blackjack.dealNewHand}
      onhit={blackjack.hitPlayer}
      onstand={blackjack.playerStand}
      oncontinue={blackjack.continueGame}
      onrestart={blackjack.backToStart}
    />

    <!-- 🚀 PANNELLO DEBUG - Solo in modalità sviluppo -->
    {#if isDev}
      <div class="debug-panel">
        <details class="debug-details">
          <summary>🔧 Debug</summary>
          <div class="debug-buttons">
            <button onclick={blackjack.debugWin} class="debug-btn debug-win">
              🏆 Vittoria + Effetti
            </button>
            <button onclick={blackjack.debugInstantWin} class="debug-btn debug-instant">
              ⚡ Vittoria Immediata
            </button>
            <button onclick={blackjack.debugTestVideo} class="debug-btn debug-video">
              🎥 Test Video
            </button>
          </div>
        </details>
      </div>
    {/if}
  </div>
{/if}

<!-- Popup Congratulazioni -->
{#if game.showCongratulations}
  <div class="congratulations-popup">
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
      <button class="popup-close" onclick={blackjack.closeCongratulations}>
        🎊 Fantastico!
      </button>
    </div>
  </div>
{/if}

<!-- Popup Video di Vittoria -->
{#if game.showVideoPopup}
  <div class="video-popup-overlay">
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
      <button class="video-close-btn" onclick={blackjack.closeVideoPopup}>
        ✨ Continua a Giocare!
      </button>
    </div>
  </div>
{/if}
