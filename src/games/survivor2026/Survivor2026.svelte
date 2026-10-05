<script>
  import { onMount } from 'svelte'
  import { createSurvivorGame } from './engine'
  import { CONFIG } from './config'

  let { onexit } = $props()
  let root

  onMount(() => {
    document.body.classList.add('survivor-mode')
    document.title = 'Auguri, ' + CONFIG.name + '!'
    const game = createSurvivorGame(root, CONFIG)

    return () => {
      game.destroy()
      document.body.classList.remove('survivor-mode')
    }
  })
</script>

<!-- Testi, href e pulsanti dei potenziamenti li scrive il motore di gioco (engine.js) tramite data-el -->
<div bind:this={root} class="survivor">
  <canvas data-el="cv" aria-hidden="true"></canvas>

  <div class="hud" data-el="hud" hidden>
    <div class="row"><span class="lvl" data-el="lvl"></span><span class="hearts" data-el="hearts"></span></div>
    <div class="bar"><i data-el="fill"></i></div>
  </div>

  <main class="screen" data-el="start">
    <!-- svelte-ignore a11y_missing_content (riempito dal motore di gioco) -->
    <h1 data-el="hello"></h1>
    <p class="lead">I tuoi amici vogliono abbracciarti tutti insieme. Tienili a distanza per 5 livelli e il regalo è tuo.</p>
    <p class="hint">Trascina il dito per muoverti, oppure usa WASD o le frecce. Spari da solo.</p>
    <button class="cta" data-el="play">Gioca</button>
    <button class="back" onclick={onexit}>← Scegli l'anno</button>
  </main>

  <section class="screen dim" data-el="upgrade" hidden>
    <!-- svelte-ignore a11y_missing_content (riempito dal motore di gioco) -->
    <h2 data-el="upTitle"></h2>
    <p class="lead">Scegli un potenziamento.</p>
    <div class="choices" data-el="choices"></div>
  </section>

  <section class="screen dim" data-el="dead" hidden>
    <h2>Abbraccio di gruppo.</h2>
    <p class="lead">Ti hanno preso. I potenziamenti restano. Riprova, se hai il coraggio.</p>
    <!-- svelte-ignore a11y_consider_explicit_label (riempito dal motore di gioco) -->
    <button class="cta" data-el="retry"></button>
  </section>

  <section class="screen dim" data-el="win" hidden>
    <h1>Sei ancora vivo.</h1>
    <p class="lead" data-el="winText"></p>
    <button class="cta" data-el="open">Scarta il regalo</button>
  </section>

  <section class="screen dim" data-el="gift" hidden>
    <div class="video" data-el="video"></div>
    <!-- svelte-ignore a11y_missing_attribute (riempito dal motore di gioco) -->
    <a class="fallback" data-el="fallback" target="_blank" rel="noopener">Il video non parte? Aprilo su YouTube</a>
    <button class="back" onclick={onexit}>← Torna al menu</button>
  </section>
</div>

<style>
  /* Blocca lo scroll della pagina mentre si gioca (globale, attivo solo durante il gioco) */
  :global(html:has(body.survivor-mode)), :global(body.survivor-mode) { height: 100%; overflow: hidden; }

  .survivor {
    --night: #1b1230;
    --plum: #2f1d4d;
    --flame: #ffc24b;
    --frosting: #ff7a9c;
    --cream: #fff1d6;
    --font: "Bricolage Grotesque", "Avenir Next", "Segoe UI", system-ui, sans-serif;
    position: fixed; inset: 0; z-index: 10;
    font-family: var(--font); color: var(--cream); background: var(--night);
    -webkit-user-select: none; user-select: none;
    -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent;
  }
  .survivor * { box-sizing: border-box; margin: 0; }
  [hidden] { display: none !important; }
  canvas { position: fixed; inset: 0; width: 100%; height: 100%; touch-action: none; display: block; }

  .hud {
    position: fixed; left: 0; right: 0; top: 0; pointer-events: none;
    padding: calc(env(safe-area-inset-top, 0px) + 12px) 16px 0;
    max-width: 640px; margin: 0 auto;
  }
  .hud .row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .lvl { font-weight: 800; font-size: 1.15rem; font-variation-settings: "wdth" 85; }
  .hearts { font-size: .95rem; letter-spacing: 1px; white-space: nowrap; }
  .bar { margin-top: 8px; height: 6px; border-radius: 3px; background: rgba(255, 241, 214, .14); overflow: hidden; }
  .bar i { display: block; height: 100%; width: 0; border-radius: 3px; background: var(--flame); transition: width .15s ease-out; }

  .screen {
    position: fixed; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; gap: 20px;
    padding: calc(env(safe-area-inset-top, 0px) + 24px) 24px calc(env(safe-area-inset-bottom, 0px) + 24px);
  }
  .screen.dim { background: rgba(27, 18, 48, .72); }
  h1, h2 { font-weight: 800; line-height: .94; letter-spacing: -.03em; font-variation-settings: "wdth" 78; overflow-wrap: anywhere; }
  h1 { font-size: clamp(2.8rem, 13vw, 5.5rem); max-width: 11ch; }
  h2 { font-size: clamp(2.1rem, 9.5vw, 3.6rem); max-width: 13ch; }
  .lead { font-size: 1.12rem; line-height: 1.45; max-width: 31ch; opacity: .92; }
  .hint { font-size: .95rem; line-height: 1.4; max-width: 30ch; opacity: .7; }
  .cta {
    font: inherit; font-weight: 800; font-size: 1.25rem;
    color: var(--night); background: var(--flame);
    border: 0; border-radius: 999px; padding: 16px 44px; cursor: pointer;
    transition: transform .1s ease-out; box-shadow: 0 0 44px rgba(255, 194, 75, .35);
  }
  .back {
    font: inherit; font-size: 1rem; color: var(--cream); opacity: .75;
    background: none; border: 0; padding: 8px 12px; cursor: pointer;
  }
  .back:hover { opacity: 1; }
  .cta:active, .survivor :global(.choice:active) { transform: scale(.97); }
  .cta:focus-visible, .back:focus-visible, .survivor :global(.choice:focus-visible), a:focus-visible { outline: 3px solid var(--cream); outline-offset: 4px; }

  /* I pulsanti dei potenziamenti sono creati dal motore di gioco: servono selettori :global */
  .choices { display: flex; flex-direction: column; gap: 10px; width: min(100%, 380px); }
  .choices :global(.choice) {
    display: flex; align-items: center; gap: 14px; text-align: left;
    font: inherit; color: var(--cream); cursor: pointer;
    background: rgba(255, 241, 214, .07); border: 1.5px solid rgba(255, 241, 214, .22);
    border-radius: 16px; padding: 13px 16px; transition: transform .1s ease-out, border-color .1s;
  }
  .choices :global(.choice:hover) { border-color: var(--flame); }
  .choices :global(.e) { font-size: 1.9rem; line-height: 1; }
  .choices :global(.t) { display: flex; flex-direction: column; gap: 2px; font-size: .95rem; }
  .choices :global(b) { font-size: 1.1rem; font-weight: 800; color: var(--flame); }

  .video {
    width: min(100%, 760px); aspect-ratio: 16 / 9;
    border-radius: 14px; overflow: hidden; background: #000;
    box-shadow: 0 0 70px rgba(255, 194, 75, .35);
  }
  .video :global(iframe) { width: 100%; height: 100%; border: 0; display: block; }
  .fallback { color: var(--cream); font-size: 1rem; text-underline-offset: 3px; }
</style>
