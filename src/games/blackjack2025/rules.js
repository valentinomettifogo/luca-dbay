// Regole pure del Blackjack di compleanno: nessuno stato, nessun DOM

const SUITS = [
  { symbol: '/suits/hearts.svg', color: '#ff4757', name: 'hearts' },
  { symbol: '/suits/diamonds.svg', color: '#ff4757', name: 'diamonds' },
  { symbol: '/suits/clubs.svg', color: '#2f3542', name: 'clubs' },
  { symbol: '/suits/spades.svg', color: '#2f3542', name: 'spades' }
]

const VALUES = [
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
  // Carte speciali con immagine
  { symbol: 'DADO', value: [-5], special: true, image: '/custom/dado.png' },
  { symbol: 'MARCO', value: [1], special: true, image: '/custom/marco-pika.png' },
  { symbol: 'FABRIZIO', value: [22], special: true, image: '/custom/fabrizio.png' }
]

// Fabrizio: solo 1 copia (sul primo seme) per bilanciare il gameplay
const isSingleCopy = value => value.symbol === 'FABRIZIO'

function toCard(suit, value) {
  const card = {
    suit: suit.symbol,
    suitColor: suit.color,
    value: value.symbol,
    numValue: value.value,
    special: Boolean(value.special)
  }
  return value.special ? { ...card, image: value.image } : card
}

export function createDeck() {
  return SUITS.flatMap((suit, suitIndex) =>
    VALUES
      .filter(value => !isSingleCopy(value) || suitIndex === 0)
      .map(value => toCard(suit, value))
  )
}

// Fisher-Yates su una copia
export function shuffleDeck(deck) {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getHandValue(hand) {
  let value = 0
  let aces = 0

  for (const card of hand) {
    if (card.numValue.length === 1) {
      value += card.numValue[0]
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
