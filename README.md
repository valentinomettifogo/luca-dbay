# 🎉 Luca's Bday Game - Svelte Edition

Il sito di compleanno di Luca, un gioco diverso per ogni anno: il Blackjack (2025) e "Sopravvivi agli amici" (2026). Creato con Svelte 5 e Vite.

## 🎮 Caratteristiche

- **Tema Compleanno**: Carte personalizzate con emoji festive (🎂🎈🎁🎉)
- **Sistema di Ricompense**: Sblocca una sorpresa speciale vincendo 5 partite
- **Animazioni**: Effetti visivi e particelle per le vittorie
- **Responsive**: Design ottimizzato per desktop e mobile
- **Svelte 5**: Stato reattivo con le rune (`$state`, `$derived`)

## 🚀 Avvio Rapido

1. **Installazione dipendenze:**
   ```bash
   npm install
   ```

2. **Avvio server di sviluppo:**
   ```bash
   npm run dev
   ```
   
3. **Apri nel browser:**
   ```
   http://localhost:5173
   ```

## 🏗️ Build per Produzione

```bash
npm run build
```

I file pronti per la produzione saranno nella cartella `dist/`.

## 🧪 Test e controlli

```bash
npm test        # test delle regole del Blackjack (Vitest)
npm run check   # controllo dei componenti Svelte (svelte-check)
```

## 📁 Struttura del Progetto

```
src/
├── games/
│   ├── blackjack2025/
│   │   ├── Blackjack2025.svelte  # Schermate del Blackjack
│   │   ├── game.svelte.js        # Stato e flusso di gioco (rune)
│   │   ├── rules.js              # Regole pure: mazzo, mescolamento, punteggio
│   │   ├── rules.test.js         # Test delle regole
│   │   └── components/           # GameCard, GameControls, ScoreDisplay
│   └── survivor2026/
│       ├── Survivor2026.svelte   # Guscio del gioco (DOM + stili)
│       └── engine.js, ...        # Motore canvas in JS puro
├── App.svelte          # Scelta dell'edizione (anno nell'hash: #2025 / #2026)
├── main.js             # Entry point dell'applicazione
└── style.css           # Stili globali
```

## 🎯 Regole del Gioco

- **Obiettivo**: Battere il dealer arrivando il più vicino possibile a 21 senza sforare
- **Blackjack**: 21 con le prime due carte
- **Asso**: Vale 1 o 11 (automaticamente ottimizzato)
- **Figure**: Valgono 10 punti
- **Dealer**: Deve pescare fino ad almeno 17

## ✨ Blackjack: com'è organizzato

### `rules.js`
Funzioni pure, senza stato né DOM: creazione e mescolamento del mazzo, calcolo del punteggio con gestione degli assi e delle carte speciali.

### `game.svelte.js`
Stato reattivo e flusso della partita: turni di player e dealer, vittorie consecutive, effetti e sorpresa finale.

### Componenti UI
- **GameCard**: Rendering animato delle carte
- **GameControls**: Pulsanti reattivi allo stato di gioco
- **ScoreDisplay**: Punteggio con stati speciali

## 🎨 Caratteristiche Tecniche

- **Svelte 5**: Componenti compilati, reattività con le rune
- **Vite**: Build tool veloce e moderno
- **CSS Animations**: Transizioni fluide e effetti particellari
- **Responsive Design**: Layout adattivo per tutti i dispositivi
- **State Management**: Stato reattivo con `$state` e `$derived`

## 🎊 Effetti Speciali

- Animazioni delle carte durante la distribuzione
- Sistema di particelle per le vittorie
- Mega particelle per lo sblocco della sorpresa
- Effetti arcobaleno e glow per elementi speciali
- Animazioni pulsanti e hover effects

## 📱 Compatibilità

- Browser moderni con supporto ES6+
- Responsive per dispositivi mobili e desktop
- Ottimizzato per prestazioni su tutti i device

---

**Buon Compleanno Luca! 🎂🎈**

Riscritto in Svelte con ❤️