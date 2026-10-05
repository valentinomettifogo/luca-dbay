import { createDeck, shuffleDeck, getHandValue } from './rules'

const WINS_FOR_SURPRISE = 5
const MIN_DECK_SIZE = 20
const DEALER_STANDS_AT = 17
const EFFECT_CLASSES = ['win-effect', 'lose-effect', 'tie-effect']
const PARTICLE_COLORS = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3']
const HIDDEN_DEALER_SCORE = 'Score: ? + ?'

export function createBlackjackGame() {
  // Stato reattivo del gioco
  const game = $state({
    deck: shuffleDeck(createDeck()),
    playerHand: [],
    dealerHand: [],
    wins: 0,
    games: 0,
    currentStreak: 0,
    gameState: 'ready', // ready, playing, dealer, won, lost, tie
    dealerHidden: true,
    currentScreen: 'intro', // 'intro', 'game'
    showCongratulations: false,
    showVideoPopup: false
  })

  // Score mostrati con ritardo, per aspettare le animazioni delle carte
  let playerDisplayScore = $state(0)
  let dealerDisplayScore = $state(HIDDEN_DEALER_SCORE)

  const dealerScore = $derived(getHandValue(game.dealerHand))

  const dealerScoreLabel = $derived.by(() => {
    if (game.dealerHidden && game.dealerHand.length > 0) {
      const firstCard = game.dealerHand[0]
      const firstCardValue = firstCard.numValue[0] === 1 ? 11 : firstCard.numValue[0]
      return `Score: ${firstCardValue} + ?`
    }
    return dealerDisplayScore
  })

  const isPlayerBlackjack = $derived(playerDisplayScore === 21 && game.playerHand.length === 2)
  const isPlayerBust = $derived(playerDisplayScore > 21)
  const isDealerBlackjack = $derived(dealerScore === 21 && game.dealerHand.length === 2 && !game.dealerHidden)
  const isDealerBust = $derived(dealerScore > 21 && !game.dealerHidden)

  const updatePlayerDisplayScore = () => { playerDisplayScore = getHandValue(game.playerHand) }
  const updateDealerDisplayScore = () => { dealerDisplayScore = `Score: ${getHandValue(game.dealerHand)}` }
  const clearEffects = () => document.body.classList.remove(...EFFECT_CLASSES)
  const drawCard = () => game.deck.pop()

  function registerWin() {
    game.wins++
    game.currentStreak++
    game.gameState = 'won'
  }

  function registerLoss() {
    game.currentStreak = 0
    game.wins = 0
    game.gameState = 'lost'
  }

  // Vittorie 1-4: solo effetti. Quinta vittoria: video, particelle e popup di auguri
  function celebrateWin(congratsDelay) {
    if (game.wins < WINS_FOR_SURPRISE) {
      showWinEffect()
      return
    }
    showFinalWinEffect()
    setTimeout(() => {
      createParticles({ count: 50, interval: 50, size: '15px', lifetime: 4000 })
      game.showCongratulations = true
      game.currentScreen = 'intro' // Prepara la schermata sottostante
    }, congratsDelay)
  }

  function startFromIntro() {
    game.currentScreen = 'game'
    dealNewHand()
  }

  function dealNewHand() {
    clearEffects()

    // Reset se il mazzo è troppo piccolo
    if (game.deck.length < MIN_DECK_SIZE) {
      game.deck = shuffleDeck(createDeck())
    }

    game.dealerHidden = true
    game.gameState = 'playing'
    playerDisplayScore = 0
    dealerDisplayScore = HIDDEN_DEALER_SCORE

    // Distribuisci 2 carte a ciascuno, alternando come al tavolo
    const [p1, d1, p2, d2] = [drawCard(), drawCard(), drawCard(), drawCard()]
    game.playerHand = [p1, p2]
    game.dealerHand = [d1, d2]

    // Aggiorna lo score del player dopo le animazioni delle prime carte
    setTimeout(() => {
      updatePlayerDisplayScore()

      const playerScoreValue = getHandValue(game.playerHand)

      // Controlla prima se il dealer ha sforato (es: Fabrizio) = player vince
      if (dealerScore > 21) {
        registerWin()
        // Rivela le carte del dealer per mostrare lo sforamento
        game.dealerHidden = false
        setTimeout(() => {
          updateDealerDisplayScore()
          celebrateWin(2000)
        }, 800) // Tempo per vedere le carte del dealer
      } else if (playerScoreValue > 21) {
        // Sforamento del player (es: Fabrizio + qualsiasi altra carta)
        registerLoss()
        setTimeout(showLoseEffect, 500)
      } else if (playerScoreValue === 21) {
        // Blackjack immediato del player
        setTimeout(playerStand, 1000)
      }
    }, 1600) // Tempo per 2 carte: 1000ms + 500ms + 100ms buffer
  }

  function hitPlayer() {
    if (game.gameState !== 'playing') return

    game.playerHand.push(drawCard())

    // Dopo l'animazione (800ms), aggiorna score e controlla risultato
    setTimeout(() => {
      updatePlayerDisplayScore()

      const playerScoreValue = getHandValue(game.playerHand)
      if (playerScoreValue > 21) {
        registerLoss()
        // Attende che l'utente veda il punteggio aggiornato prima dell'effetto
        setTimeout(showLoseEffect, 500)
      } else if (playerScoreValue === 21) {
        setTimeout(playerStand, 500)
      }
    }, 900) // 800ms animazione + 100ms buffer
  }

  function playerStand() {
    if (game.gameState !== 'playing') return

    game.gameState = 'dealer'
    game.dealerHidden = false

    // Aggiorna lo score del dealer dopo l'animazione flip, poi fa giocare il dealer
    setTimeout(() => {
      updateDealerDisplayScore()
      setTimeout(dealerPlay, 500)
    }, 1300) // 1200ms animazione flip + 100ms buffer
  }

  function dealerPlay() {
    if (dealerScore >= DEALER_STANDS_AT) {
      compareHands()
      return
    }

    game.dealerHand.push(drawCard())

    // Attende l'animazione, poi aggiorna score e controlla
    setTimeout(() => {
      updateDealerDisplayScore()

      if (dealerScore > 21) {
        registerWin()
        // Attende che l'utente veda il punteggio aggiornato prima dell'effetto
        setTimeout(() => celebrateWin(2000), 500)
      } else {
        setTimeout(dealerPlay, 500)
      }
    }, 900) // 800ms animazione + 100ms buffer
  }

  // Il dealer sta: confronto finale (i bust sono già gestiti altrove)
  function compareHands() {
    game.games++

    const playerScoreValue = getHandValue(game.playerHand)

    if (playerScoreValue > dealerScore) {
      registerWin()
      setTimeout(() => celebrateWin(1800), 300)
    } else if (playerScoreValue < dealerScore) {
      registerLoss()
      setTimeout(showLoseEffect, 300)
    } else {
      // Pareggio - mantiene la winstreak ma non progredisce
      game.gameState = 'tie'
      setTimeout(showTieEffect, 300)
    }
  }

  function continueGame() {
    clearEffects()
    game.currentScreen = 'game'
    dealNewHand()
  }

  function backToStart() {
    clearEffects()
    goBackHome()
  }

  function goBackHome() {
    game.currentScreen = 'intro'
    game.gameState = 'ready'
  }

  function closeCongratulations() {
    // Reset completo dopo aver completato la sfida
    Object.assign(game, {
      showCongratulations: false,
      wins: 0,
      games: 0,
      currentStreak: 0,
      gameState: 'ready',
      currentScreen: 'intro',
      playerHand: [],
      dealerHand: []
    })
    playerDisplayScore = 0
    dealerDisplayScore = HIDDEN_DEALER_SCORE
  }

  function closeVideoPopup() {
    game.showVideoPopup = false
  }

  // 🚀 FUNZIONI DI DEBUG - Solo in modalità sviluppo
  function debugWin() {
    if (!import.meta.env.DEV) return
    registerWin()
    celebrateWin(2000)
  }

  function debugInstantWin() {
    if (!import.meta.env.DEV) return
    registerWin()
    // Salta direttamente al video senza effetti
    game.showVideoPopup = true
  }

  function debugTestVideo() {
    if (!import.meta.env.DEV) return
    game.showVideoPopup = true
  }

  function showWinEffect() {
    document.body.classList.add('win-effect')
    createParticles({ count: 15, interval: 100, lifetime: 3000 })
  }

  function showFinalWinEffect() {
    showWinEffect()
    // Il video parte solo alla quinta vittoria
    setTimeout(() => { game.showVideoPopup = true }, 1500)
  }

  function showLoseEffect() {
    document.body.classList.add('lose-effect')
  }

  function showTieEffect() {
    document.body.classList.add('tie-effect')
  }

  return {
    get game() { return game },
    get playerScore() { return playerDisplayScore },
    get dealerScore() { return dealerScoreLabel },
    get isPlayerBlackjack() { return isPlayerBlackjack },
    get isPlayerBust() { return isPlayerBust },
    get isDealerBlackjack() { return isDealerBlackjack },
    get isDealerBust() { return isDealerBust },
    startFromIntro,
    dealNewHand,
    hitPlayer,
    playerStand,
    continueGame,
    backToStart,
    goBackHome,
    closeCongratulations,
    closeVideoPopup,
    debugWin,
    debugInstantWin,
    debugTestVideo
  }
}

function createParticles({ count, interval, lifetime, size }) {
  const particlesContainer = document.getElementById('particles')
  if (!particlesContainer) return

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.left = Math.random() * 100 + '%'
      particle.style.background = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]
      particle.style.animationDelay = Math.random() * 2 + 's'
      if (size) {
        particle.style.width = size
        particle.style.height = size
      }
      particlesContainer.appendChild(particle)

      setTimeout(() => particle.remove(), lifetime)
    }, i * interval)
  }
}
