import { ref, computed, nextTick } from 'vue'

export function useBlackjackGame() {
  // Carte personalizzate con tema compleanno
  const suits = [
    { symbol: '🎂', color: '#ff6b6b', name: 'torte' },
    { symbol: '🎈', color: '#48dbfb', name: 'palloncini' },
    { symbol: '🎁', color: '#feca57', name: 'regali' },
    { symbol: '🎉', color: '#ff9ff3', name: 'feste' }
  ]
  
  const values = [
    { symbol: 'A', value: [1, 11] },
    { symbol: '2', value: [2] },
    { symbol: '3', value: [3] },
    { symbol: '4', value: [4] },
    { symbol: '5', value: [5] },
    { symbol: '6', value: [6] },
    { symbol: '7', value: [7] },
    { symbol: '8', value: [8] },
    { symbol: '9', value: [9] },
    { symbol: '10', value: [10] },
    { symbol: 'J', value: [10] },
    { symbol: 'Q', value: [10] },
    { symbol: 'K', value: [10] }
  ]
  
  // Stato reattivo del gioco
  const game = ref({
    deck: [],
    playerHand: [],
    dealerHand: [],
    wins: 0,
    games: 0,
    currentStreak: 0,
    gameState: 'ready', // ready, playing, dealer, finished
    dealerHidden: true,
    currentScreen: 'intro', // 'intro', 'game'
    showCongratulations: false
  })
  
  const message = ref('Benvenuto al Blackjack di Compleanno di Luca! 🎂<br>Batti il dealer 5 volte per sbloccare la sorpresa speciale!')
  const messageClass = ref('')
  
  // Score del player con delay per le animazioni
  const playerDisplayScore = ref(0)
  
  // Computed properties
  const playerScore = computed(() => getHandValue(game.value.playerHand))
  const dealerScore = computed(() => getHandValue(game.value.dealerHand))
  
  const dealerDisplayScore = computed(() => {
    if (game.value.dealerHidden && game.value.dealerHand.length > 0) {
      const firstCard = game.value.dealerHand[0]
      const firstCardValue = firstCard.numValue[0] === 1 ? 11 : firstCard.numValue[0]
      return `Score: ${firstCardValue} + ?`
    }
    return `Score: ${dealerScore.value}`
  })
  
  const dealerHand = computed(() => {
    return game.value.dealerHand.map((card, index) => ({
      ...card,
      isHidden: index === 1 && game.value.dealerHidden
    }))
  })
  
  const isPlayerBlackjack = computed(() => 
    playerDisplayScore.value === 21 && game.value.playerHand.length === 2
  )
  
  const isPlayerBust = computed(() => playerDisplayScore.value > 21)
  
  const isDealerBlackjack = computed(() => 
    dealerScore.value === 21 && game.value.dealerHand.length === 2 && !game.value.dealerHidden
  )
  
  const isDealerBust = computed(() => 
    dealerScore.value > 21 && !game.value.dealerHidden
  )
  
  // Metodi del gioco
  function createDeck() {
    game.value.deck = []
    for (let suit of suits) {
      for (let value of values) {
        game.value.deck.push({
          suit: suit.symbol,
          suitColor: suit.color,
          value: value.symbol,
          numValue: value.value
        })
      }
    }
  }
  
  function shuffleDeck() {
    const deck = game.value.deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]]
    }
  }
  
  function getHandValue(hand) {
    let value = 0
    let aces = 0
    
    for (let card of hand) {
      if (card.numValue.length === 1) {
        value += card.numValue[0]
        if (card.value === 'A') aces++
      } else {
        // Asso
        value += 11
        aces++
      }
    }
    
    // Gestione degli assi
    while (value > 21 && aces > 0) {
      value -= 10
      aces--
    }
    
    return value
  }
  
  function startFromIntro() {
    game.value.currentScreen = 'game'
    dealNewHand()
  }
  
  function updatePlayerDisplayScore() {
    playerDisplayScore.value = getHandValue(game.value.playerHand)
  }
  
  function dealNewHand() {
    // Reset se il mazzo è troppo piccolo
    if (game.value.deck.length < 20) {
      createDeck()
      shuffleDeck()
    }
    
    game.value.playerHand = []
    game.value.dealerHand = []
    game.value.dealerHidden = true
    game.value.gameState = 'playing'
    playerDisplayScore.value = 0 // Reset del display score
    
    // Distribuisci 2 carte a ciascuno
    game.value.playerHand.push(game.value.deck.pop())
    game.value.dealerHand.push(game.value.deck.pop())
    game.value.playerHand.push(game.value.deck.pop())
    game.value.dealerHand.push(game.value.deck.pop())
    
    // Aggiorna lo score del player dopo le animazioni delle prime carte (2 secondi dopo l'ultima carta)
    setTimeout(() => {
      updatePlayerDisplayScore()
      
      // Controlla blackjack immediato
      if (getHandValue(game.value.playerHand) === 21) {
        setTimeout(() => playerStand(), 1000)
      }
    }, 2000)
  }
  
  function hitPlayer() {
    if (game.value.gameState !== 'playing') return
    
    game.value.playerHand.push(game.value.deck.pop())
    
    const playerScoreValue = getHandValue(game.value.playerHand)
    
    // Aggiorna lo score dopo l'animazione della carta (2 secondi)
    setTimeout(() => {
      updatePlayerDisplayScore()
      
      if (playerScoreValue > 21) {
        // Aspetta ancora un po' prima di mostrare il risultato
        setTimeout(() => endGame('bust'), 2000)
      } else if (playerScoreValue === 21) {
        setTimeout(() => playerStand(), 500)
      }
    }, 2000)
    
    // Se sballa, pulisce subito il messaggio
    if (playerScoreValue > 21) {
      message.value = ''
      messageClass.value = ''
    }
  }
  
  function playerStand() {
    if (game.value.gameState !== 'playing') return
    
    game.value.gameState = 'dealer'
    game.value.dealerHidden = false
    
    // Logica del dealer - più tempo per vedere l'animazione flip
    setTimeout(() => dealerPlay(), 2500)
  }
  
  function dealerPlay() {
    const dealerScoreValue = getHandValue(game.value.dealerHand)
    
    if (dealerScoreValue < 17) {
      game.value.dealerHand.push(game.value.deck.pop())
      setTimeout(() => dealerPlay(), 2000)
    } else {
      // Aspetta un po' anche qui per dare tempo all'ultima carta del dealer di finire
      setTimeout(() => endGame('compare'), 1500)
    }
  }
  
  function endGame(reason) {
    game.value.gameState = 'finished'
    game.value.games++
    
    const playerScoreValue = getHandValue(game.value.playerHand)
    const dealerScoreValue = getHandValue(game.value.dealerHand)
    
    let result = ''
    let isWin = false
    
    if (reason === 'bust') {
      result = 'Sballato! Hai superato 21! 💥'
      game.value.currentStreak = 0
      messageClass.value = 'losing'
    } else if (dealerScoreValue > 21) {
      result = 'Il dealer è sballato! Hai vinto! 🎉'
      isWin = true
    } else if (playerScoreValue > dealerScoreValue) {
      result = 'Hai vinto! Ottimo lavoro! 🎊'
      isWin = true
    } else if (playerScoreValue < dealerScoreValue) {
      result = 'Il dealer ha vinto... Riprova! 😔'
      game.value.currentStreak = 0
      messageClass.value = 'losing'
    } else {
      result = 'Pareggio! Nessun vincitore! 🤝'
      game.value.currentStreak = 0
      messageClass.value = ''
    }
    
    if (isWin) {
      game.value.wins++
      game.value.currentStreak++
      messageClass.value = 'winning'
      createParticles()
      
      // Cambia lo stato per mostrare il pulsante "continua" dopo una vittoria
      game.value.gameState = 'won'
      
      if (game.value.wins >= 5) {
        setTimeout(() => {
          createMegaParticles()
          game.value.showCongratulations = true
        }, 1500)
      }
    } else {
      // Cambia lo stato per mostrare il pulsante "ricomincia" dopo una sconfitta
      game.value.gameState = 'lost'
    }
    
    message.value = result
  }
  

  
  function continueGame() {
    // Continua il gioco dopo una vittoria - vai direttamente alla prossima partita
    game.value.currentScreen = 'game'
    game.value.gameState = 'ready'
    message.value = `Ottimo! Round ${game.value.games + 1} 🎯`
    messageClass.value = ''
  }
  
  function backToStart() {
    // Torna alla schermata intro dopo una sconfitta
    game.value.currentScreen = 'intro'
    game.value.gameState = 'ready'
    message.value = 'Benvenuto al Blackjack di Compleanno di Luca!'
    messageClass.value = ''
  }
  
  function goBackHome() {
    game.value.currentScreen = 'intro'
    game.value.gameState = 'ready'
  }
  
  function closeCongratulations() {
    game.value.showCongratulations = false
  }
  
  function createParticles() {
    const particlesContainer = document.getElementById('particles')
    if (!particlesContainer) return
    
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const particle = document.createElement('div')
        particle.className = 'particle'
        particle.style.left = Math.random() * 100 + '%'
        particle.style.background = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'][Math.floor(Math.random() * 4)]
        particle.style.animationDelay = Math.random() * 2 + 's'
        particlesContainer.appendChild(particle)
        
        setTimeout(() => {
          particle.remove()
        }, 3000)
      }, i * 100)
    }
  }
  
  function createMegaParticles() {
    const particlesContainer = document.getElementById('particles')
    if (!particlesContainer) return
    
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const particle = document.createElement('div')
        particle.className = 'particle'
        particle.style.left = Math.random() * 100 + '%'
        particle.style.background = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'][Math.floor(Math.random() * 4)]
        particle.style.animationDelay = Math.random() * 2 + 's'
        particle.style.width = '15px'
        particle.style.height = '15px'
        particlesContainer.appendChild(particle)
        
        setTimeout(() => {
          particle.remove()
        }, 4000)
      }, i * 50)
    }
  }
  
  // Inizializzazione
  createDeck()
  shuffleDeck()
  
  return {
    game,
    message,
    messageClass,
    dealerHand,
    playerScore: playerDisplayScore,
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
  }
}