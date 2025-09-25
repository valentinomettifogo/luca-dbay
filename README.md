# 🎉 Luca's Birthday Blackjack - Vue.js Edition

Un gioco di Blackjack a tema compleanno creato con Vue.js 3 e Vite, trasformato da un'applicazione HTML/JavaScript vanilla.

## 🎮 Caratteristiche

- **Tema Compleanno**: Carte personalizzate con emoji festive (🎂🎈🎁🎉)
- **Sistema di Ricompense**: Sblocca una sorpresa speciale vincendo 5 partite
- **Animazioni**: Effetti visivi e particelle per le vittorie
- **Responsive**: Design ottimizzato per desktop e mobile
- **Vue.js 3**: Architettura moderna con Composition API

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
   http://localhost:3000
   ```

## 🏗️ Build per Produzione

```bash
npm run build
```

I file pronti per la produzione saranno nella cartella `dist/`.

## 📁 Struttura del Progetto

```
src/
├── components/          # Componenti Vue riutilizzabili
│   ├── GameCard.vue    # Singola carta da gioco
│   ├── GameControls.vue # Pulsanti di controllo
│   ├── GameStats.vue   # Statistiche di gioco
│   ├── ProgressBar.vue # Barra progresso sorpresa
│   └── ScoreDisplay.vue # Display del punteggio
├── composables/         # Logica di business riutilizzabile
│   └── useBlackjackGame.js # Hook per la logica del Blackjack
├── App.vue             # Componente principale
├── main.js             # Entry point dell'applicazione
└── style.css           # Stili globali
```

## 🎯 Regole del Gioco

- **Obiettivo**: Battere il dealer arrivando il più vicino possibile a 21 senza sforare
- **Blackjack**: 21 con le prime due carte
- **Asso**: Vale 1 o 11 (automaticamente ottimizzato)
- **Figure**: Valgono 10 punti
- **Dealer**: Deve pescare fino ad almeno 17

## ✨ Componenti Vue

### `useBlackjackGame` (Composable)
Contiene tutta la logica di gioco:
- Gestione del mazzo e mescolamento
- Logica del dealer e del giocatore
- Calcolo punteggi e gestione assi
- Sistema di vittorie e statistiche

### Componenti UI
- **GameCard**: Rendering animato delle carte
- **GameControls**: Pulsanti reattivi al stato di gioco
- **GameStats**: Display delle statistiche
- **ProgressBar**: Progresso verso la sorpresa
- **ScoreDisplay**: Punteggio con stati speciali

## 🎨 Caratteristiche Tecniche

- **Vue 3**: Composition API per logica reattiva
- **Vite**: Build tool veloce e moderno
- **CSS Animations**: Transizioni fluide e effetti particellari
- **Responsive Design**: Layout adattivo per tutti i dispositivi
- **State Management**: Gestione stato reattivo con `ref` e `computed`

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

Trasformato in Vue.js con ❤️