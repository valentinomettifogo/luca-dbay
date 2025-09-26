import { ref, computed, nextTick } from 'vue'

export function useBlackjackGame() {
  // Carte personalizzate con tema compleanno
  const suits = [
    { symbol: '/suits/hearts.svg', color: '#ff4757', name: 'hearts' },
    { symbol: '/suits/diamonds.svg', color: '#ff4757', name: 'diamonds' },
    { symbol: '/suits/clubs.svg', color: '#2f3542', name: 'clubs' },
    { symbol: '/suits/spades.svg', color: '#2f3542', name: 'spades' }
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
    { symbol: 'K', value: [10] },
    // Carte speciali con SVG inline
    { symbol: 'DADO', value: [-5], special: true, image: '/custom/dado.png' },
    { symbol: 'MARCO', value: [1], special: true, image: '/custom/marco-pika.png' },
    { symbol: 'FABRIZIO', value: [22], special: true, image: '/custom/fabrizio.png' }
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
    showCongratulations: false,
    showVideoPopup: false
  })
  
  const message = ref('Benvenuto al Blackjack di Compleanno di Luca! 🎂<br>Batti il dealer 5 volte per sbloccare la sorpresa speciale!')
  const messageClass = ref('')
  
  // Score del player con delay per le animazioni
  const playerDisplayScore = ref(0)
  const dealerDisplayScore = ref('Score: ? + ?')
  
  // Computed properties
  const playerScore = computed(() => getHandValue(game.value.playerHand))
  const dealerScore = computed(() => getHandValue(game.value.dealerHand))
  
  const dealerDisplayScoreFormatted = computed(() => {
    if (game.value.dealerHidden && game.value.dealerHand.length > 0) {
      const firstCard = game.value.dealerHand[0]
      const firstCardValue = firstCard.numValue[0] === 1 ? 11 : firstCard.numValue[0]
      return `Score: ${firstCardValue} + ?`
    }
    return dealerDisplayScore.value
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
        // Carte speciali: 4 copie (una per ogni seme)
        if (value.special) {
          game.value.deck.push({
            suit: suit.symbol, // Le carte speciali hanno anche un seme
            suitColor: suit.color,
            value: value.symbol,
            numValue: value.value,
            special: true,
            image: value.image
          })
        } else {
          // Carte normali: una per ogni seme
          game.value.deck.push({
            suit: suit.symbol,
            suitColor: suit.color,
            value: value.symbol,
            numValue: value.value,
            special: false
          })
        }
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
    message.value = ''
    messageClass.value = ''
    dealNewHand()
  }
  
  function updatePlayerDisplayScore() {
    playerDisplayScore.value = getHandValue(game.value.playerHand)
  }
  
  function updateDealerDisplayScore() {
    dealerDisplayScore.value = `Score: ${getHandValue(game.value.dealerHand)}`
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
    dealerDisplayScore.value = 'Score: ? + ?'
    message.value = ''
    messageClass.value = ''
    
    // Distribuisci 2 carte a ciascuno
    game.value.playerHand.push(game.value.deck.pop())
    game.value.dealerHand.push(game.value.deck.pop())
    game.value.playerHand.push(game.value.deck.pop())
    game.value.dealerHand.push(game.value.deck.pop())
    
    // Aggiorna lo score del player dopo le animazioni delle prime carte
    setTimeout(() => {
      updatePlayerDisplayScore()
      
      const playerScoreValue = getHandValue(game.value.playerHand)
      const dealerScoreValue = getHandValue(game.value.dealerHand)
      
      // Controlla prima se il dealer ha sforato (es: Fabrizio)
      if (dealerScoreValue > 21) {
        // Il dealer sfora automaticamente = player vince
        game.value.wins++
        game.value.currentStreak++
        game.value.gameState = 'won'
        // Rivela le carte del dealer per mostrare lo sforamento
        game.value.dealerHidden = false
        setTimeout(() => {
          updateDealerDisplayScore()
          if (game.value.wins >= 5) {
            showFinalWinEffect()
            setTimeout(() => {
              createMegaParticles()
              game.value.showCongratulations = true
              game.value.currentScreen = 'intro'
            }, 2000)
          } else {
            showWinEffect()
          }
        }, 800) // Tempo per vedere le carte del dealer
      }
      // Controlla sforamento del player (es: Fabrizio + qualsiasi altra carta)
      else if (playerScoreValue > 21) {
        game.value.currentStreak = 0
        game.value.wins = 0
        game.value.gameState = 'lost'
        setTimeout(() => showLoseEffect(), 500)
      } 
      // Controlla blackjack immediato del player
      else if (playerScoreValue === 21) {
        setTimeout(() => playerStand(), 1000)
      }
    }, 1600) // Tempo per 2 carte: 1000ms + 500ms + 100ms buffer
  }
  
  function hitPlayer() {
    if (game.value.gameState !== 'playing') return
    
    // 1. Aggiungi la carta
    game.value.playerHand.push(game.value.deck.pop())
    
    // 2. L'animazione parte automaticamente (800ms)
    
    // 3. Dopo l'animazione, aggiorna score e controlla risultato
    setTimeout(() => {
      updatePlayerDisplayScore()
      
      const playerScoreValue = getHandValue(game.value.playerHand)
      
      // 4. Controlla immediatamente se bust o blackjack
      if (playerScoreValue > 21) {
        game.value.currentStreak = 0
        game.value.wins = 0
        game.value.gameState = 'lost'
        // Attende che l'utente veda il punteggio aggiornato prima dell'effetto
        setTimeout(() => showLoseEffect(), 500)
      } else if (playerScoreValue === 21) {
        setTimeout(() => playerStand(), 500)
      }
    }, 900) // 800ms animazione + 100ms buffer
  }
  
  function playerStand() {
    if (game.value.gameState !== 'playing') return
    
    game.value.gameState = 'dealer'
    game.value.dealerHidden = false
    
    // Aggiorna lo score del dealer dopo l'animazione flip
    setTimeout(() => {
      updateDealerDisplayScore()
      
      // Inizia la logica del dealer dopo aver aggiornato lo score
      setTimeout(() => dealerPlay(), 500)
    }, 1300) // 1200ms animazione flip + 100ms buffer
  }
  
  function dealerPlay() {
    const dealerScoreValue = getHandValue(game.value.dealerHand)
    
    if (dealerScoreValue < 17) {
      // 1. Dealer prende automaticamente una carta
      game.value.dealerHand.push(game.value.deck.pop())
      
      // 2. Attende l'animazione, poi aggiorna score e controlla
      setTimeout(() => {
        // 3. Aggiorna lo score
        updateDealerDisplayScore()
        
        // 4. Controlla se bust
        const newDealerScore = getHandValue(game.value.dealerHand)
        if (newDealerScore > 21) {
          game.value.wins++
          game.value.currentStreak++
          game.value.gameState = 'won'
          // Attende che l'utente veda il punteggio aggiornato prima dell'effetto
          setTimeout(() => {
            if (game.value.wins >= 5) {
              showFinalWinEffect() // Quinta vittoria: video + effetti
              setTimeout(() => {
                createMegaParticles()
                game.value.showCongratulations = true
                game.value.currentScreen = 'intro' // Prepara la schermata sottostante
              }, 2000)
            } else {
              showWinEffect() // Vittorie 1-4: solo effetti normali
            }
          }, 500)
        } else {
          // Continua a giocare
          setTimeout(() => dealerPlay(), 500)
        }
      }, 900) // 800ms animazione + 100ms buffer
    } else {
      // Dealer sta, confronta i punteggi
      endGame('compare')
    }
  }
  
  function endGame(reason) {
    game.value.games++
    
    const playerScoreValue = getHandValue(game.value.playerHand)
    const dealerScoreValue = getHandValue(game.value.dealerHand)
    
    // Solo per confronto finale (non bust, che sono già gestiti)
    if (reason === 'compare') {
      if (playerScoreValue > dealerScoreValue) {
        // Vittoria del player
        game.value.wins++
        game.value.currentStreak++
        game.value.gameState = 'won'
        setTimeout(() => {
          if (game.value.wins >= 5) {
            showFinalWinEffect() // Quinta vittoria: video + effetti
            setTimeout(() => {
              createMegaParticles()
              game.value.showCongratulations = true
              game.value.currentScreen = 'intro' // Prepara la schermata sottostante
            }, 1800)
          } else {
            showWinEffect() // Vittorie 1-4: solo effetti normali
          }
        }, 300)
      } else if (playerScoreValue < dealerScoreValue) {
        // Vittoria del dealer
        game.value.currentStreak = 0
        game.value.wins = 0
        game.value.gameState = 'lost'
        setTimeout(() => showLoseEffect(), 300)
      } else {
        // Pareggio - mantiene la winstreak ma non progredisce
        game.value.gameState = 'tie'
        setTimeout(() => showTieEffect(), 300)
      }
    }
  }
  

  
  function continueGame() {
    // Continua il gioco dopo una vittoria - vai direttamente alla prossima partita
    game.value.currentScreen = 'game'
    // Avvia direttamente una nuova mano
    dealNewHand()
  }
  
  function backToStart() {
    // Torna alla schermata intro dopo una sconfitta
    game.value.currentScreen = 'intro'
    game.value.gameState = 'ready'
  }
  
  function goBackHome() {
    game.value.currentScreen = 'intro'
    game.value.gameState = 'ready'
  }
  
  // 🚀 FUNZIONI DI DEBUG - Solo in modalità sviluppo
  function debugWin() {
    if (!import.meta.env.DEV) return
    if (import.meta.env.DEV) console.log('🎮 DEBUG: Vittoria forzata!')
    game.value.wins++
    game.value.currentStreak++
    game.value.gameState = 'won'
    if (game.value.wins >= 5) {
      showFinalWinEffect() // Quinta vittoria: con video
      setTimeout(() => {
        createMegaParticles()
        game.value.showCongratulations = true
        game.value.currentScreen = 'intro' // Prepara la schermata sottostante
      }, 2000)
    } else {
      showWinEffect() // Vittorie 1-4: senza video
    }
  }
  
  function debugInstantWin() {
    if (!import.meta.env.DEV) return
    if (import.meta.env.DEV) console.log('🎮 DEBUG: Vittoria istantanea con video!')
    game.value.wins++
    game.value.currentStreak++
    game.value.gameState = 'won'
    // Salta direttamente al video senza effetti
    game.value.showVideoPopup = true
  }
  
  function debugTestVideo() {
    if (!import.meta.env.DEV) return
    if (import.meta.env.DEV) console.log('🎮 DEBUG: Test video diretto!')
    game.value.showVideoPopup = true
  }
  
  function closeCongratulations() {
    game.value.showCongratulations = false
    // Reset completo dopo aver completato la sfida
    game.value.wins = 0
    game.value.games = 0
    game.value.currentStreak = 0
    game.value.gameState = 'ready'
    game.value.currentScreen = 'intro'
    // Reset anche le mani
    game.value.playerHand = []
    game.value.dealerHand = []
    playerDisplayScore.value = 0
    dealerDisplayScore.value = 'Score: ? + ?'
  }
  
  function closeVideoPopup() {
    game.value.showVideoPopup = false
  }
  
  function showWinEffect() {
    // Effetto schermo verde per vittoria
    document.body.classList.add('win-effect')
    setTimeout(() => {
      document.body.classList.remove('win-effect')
    }, 2000)
    
    createParticles()
  }
  
  function showFinalWinEffect() {
    // Effetto speciale per la vittoria finale (quinta)
    document.body.classList.add('win-effect')
    setTimeout(() => {
      document.body.classList.remove('win-effect')
    }, 2000)
    
    createParticles()
    
    // Mostra il video popup solo per la quinta vittoria
    setTimeout(() => {
      game.value.showVideoPopup = true
    }, 1500)
  }
  
  function showLoseEffect() {
    // Effetto schermo rosso per sconfitta
    document.body.classList.add('lose-effect')
    setTimeout(() => {
      document.body.classList.remove('lose-effect')
    }, 2000)
  }
  
  function showTieEffect() {
    // Effetto schermo giallo per pareggio
    document.body.classList.add('tie-effect')
    setTimeout(() => {
      document.body.classList.remove('tie-effect')
    }, 2000)
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
  
  const exports = {
    game,
    message,
    messageClass,
    dealerHand,
    playerScore: playerDisplayScore,
    dealerDisplayScore: dealerDisplayScoreFormatted,
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
  }

  // 🚀 Aggiungi funzioni di debug solo in modalità sviluppo
  if (import.meta.env.DEV) {
    exports.debugWin = debugWin
    exports.debugInstantWin = debugInstantWin
    exports.debugTestVideo = debugTestVideo
  }

  return exports
}