import { describe, test, expect } from 'vitest'
import { createDeck, shuffleDeck, getHandValue } from './rules'

const card = (value, numValue) => ({ value, numValue })
const ACE = card('A', [1, 11])
const KING = card('K', [10])
const DADO = card('DADO', [-5])
const FABRIZIO = card('FABRIZIO', [22])

describe('getHandValue', () => {
  test('somma le carte normali', () => {
    expect(getHandValue([card('7', [7]), card('9', [9])])).toBe(16)
  })

  test("l'asso vale 11 quando non si sfora", () => {
    expect(getHandValue([ACE, KING])).toBe(21)
  })

  test("l'asso scende a 1 quando si sforerebbe", () => {
    expect(getHandValue([ACE, KING, card('5', [5])])).toBe(16)
  })

  test('due assi valgono 12', () => {
    expect(getHandValue([ACE, ACE])).toBe(12)
  })

  test('DADO toglie 5 punti', () => {
    expect(getHandValue([KING, DADO])).toBe(5)
  })

  test('FABRIZIO da solo fa sforare', () => {
    expect(getHandValue([FABRIZIO])).toBe(22)
  })

  test("FABRIZIO con un asso: l'asso scende a 1 ma si sfora comunque", () => {
    expect(getHandValue([FABRIZIO, ACE])).toBe(23)
  })

  test('mano vuota vale 0', () => {
    expect(getHandValue([])).toBe(0)
  })
})

describe('createDeck', () => {
  const deck = createDeck()
  const count = value => deck.filter(c => c.value === value).length

  test('contiene 52 carte normali + 4 DADO + 4 MARCO + 1 FABRIZIO', () => {
    expect(deck).toHaveLength(61)
  })

  test('FABRIZIO compare una sola volta', () => {
    expect(count('FABRIZIO')).toBe(1)
  })

  test('DADO e MARCO compaiono una volta per seme', () => {
    expect(count('DADO')).toBe(4)
    expect(count('MARCO')).toBe(4)
  })

  test('solo le carte speciali hanno immagine', () => {
    expect(deck.filter(c => c.special).every(c => c.image)).toBe(true)
    expect(deck.filter(c => !c.special).some(c => 'image' in c)).toBe(false)
  })
})

describe('shuffleDeck', () => {
  test('restituisce un nuovo array con le stesse carte, senza toccare l’originale', () => {
    const deck = createDeck()
    const snapshot = [...deck]

    const shuffled = shuffleDeck(deck)

    expect(shuffled).not.toBe(deck)
    expect(deck).toEqual(snapshot)
    expect([...shuffled].sort(byKey)).toEqual([...deck].sort(byKey))
  })
})

function byKey(a, b) {
  return (a.value + a.suit).localeCompare(b.value + b.suit)
}
