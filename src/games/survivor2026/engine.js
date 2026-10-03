import { face } from './faces'
import { createAudio } from './audio'

const TAU = Math.PI * 2
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const rand = (a, b) => a + Math.random() * (b - a)
const PARTY = ['#ffc24b', '#ff7a9c', '#fff1d6', '#8ee3c8']
const MOCK = [['🤪', '#5b3b8c'], ['😈', '#7a2f5c'], ['🥸', '#2f5c6e'], ['🤡', '#6e4a2f'], ['🥳', '#3f6e3a'], ['🤓', '#4a4f8c']]
const GRID = 56
const RANGE = 360
const JOY = 52
const BULLET_SPEED = 460

/* ---------- Difficoltà (modalità "incubo") ---------- */
const HIT_INVULN = 0.45         // secondi di invulnerabilità dopo un colpo
const BIG_FROM_LEVEL = 1        // da quale livello (0-based) compaiono gli amici grossi
const BIG_CHANCE = 0.3
const MAX_ENEMIES = lvl => 18 + lvl * 7
// Il boss ogni `dashEvery` secondi scatta verso Luca a velocità ×`dashBoost` per `dashTime` secondi
const BOSS = { hp: 170, speed: 125, knockback: 5, dashEvery: 2.8, dashTime: 0.55, dashBoost: 2.6 }
// Dopo ogni sconfitta i nemici rallentano/arrivano più piano, ma pochissimo
const MERCY_SLOW = 0.02, MERCY_MIN_SPEED = 0.9, MERCY_SPAWN = 0.04

/* ---------- Regole ---------- */
const LEVELS = [
  { quota: 18, every: 0.70, speed: 110, hp: 2 },
  { quota: 26, every: 0.56, speed: 122, hp: 3 },
  { quota: 34, every: 0.47, speed: 134, hp: 3 },
  { quota: 42, every: 0.41, speed: 145, hp: 4 },
  { quota: 35, every: 0.38, speed: 150, hp: 5, boss: true }, // 35 amici, poi arriva il boss
]
const UPGRADES = [
  { e: '🎉', n: 'Raffica', d: 'Spari il 25% più in fretta', f: S => { S.fireEvery *= 0.75 } },
  { e: '🎊', n: 'Doppio botto', d: 'Un colpo in più a ogni sparo', f: S => { S.shots++ } },
  { e: '🍾', n: 'Tappo pesante', d: '+1 danno per colpo', f: S => { S.dmg++ } },
  { e: '👟', n: 'Scarpe da festa', d: 'Ti muovi il 15% più veloce', f: S => { S.speed *= 1.15 } },
  { e: '🍰', n: 'Fetta di torta', d: '+1 cuore', f: S => { S.maxHp++ } },
  { e: '📌', n: 'Spillo', d: 'I colpi attraversano un amico in più', f: S => { S.pierce++ } },
]
const KEYMAP = { ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r', ArrowUp: 'u', w: 'u', W: 'u', ArrowDown: 'd', s: 'd', S: 'd' }

export function ytId(s) {
  s = String(s || '').trim()
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/) || s.match(/^([\w-]{11})$/)
  return m ? m[1] : null
}

/**
 * Monta il gioco dentro `root` (elementi marcati con data-el) e restituisce { destroy }.
 */
export function createSurvivorGame(root, config) {
  const $ = name => root.querySelector('[data-el="' + name + '"]')
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
  const audio = createAudio()
  const { beep } = audio
  const VIDEO = ytId(config.youtube)
  const timers = []
  const later = (fn, ms) => timers.push(setTimeout(fn, ms))

  $('hello').textContent = 'Auguri, ' + config.name + '!'
  $('winText').textContent = 'Tanti auguri, ' + config.name + '. Il regalo è tuo.'

  const heroFace = face(config.hero, '😎', '#3b2a66', '#ffc24b')
  const bossFace = face(config.boss, '👹', '#5c1f3a', '#ffc24b')
  const enemyFaces = (config.enemies.length ? config.enemies : [null]).map((spec, i) => {
    const m = MOCK[i % MOCK.length]
    return face(spec, m[0], m[1], '#ff7a9c')
  })

  /* ---------- Canvas ---------- */
  const cv = $('cv'), ctx = cv.getContext('2d')
  let W = 0, H = 0, DPR = 1, zoom = 1, VW = 0, VH = 0, dots = null

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2)
    W = window.innerWidth; H = window.innerHeight
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR)
    zoom = clamp(Math.min(W, H) / 520, 0.75, 1.5)
    VW = W / zoom; VH = H / zoom
  }
  function makeDots() {
    const t = document.createElement('canvas')
    t.width = t.height = GRID
    const x = t.getContext('2d')
    x.fillStyle = 'rgba(255,241,214,0.10)'
    x.beginPath(); x.arc(GRID / 2, GRID / 2, 2, 0, TAU); x.fill()
    dots = ctx.createPattern(t, 'repeat')
  }

  /* ---------- Stato ---------- */
  const S = { speed: 190, maxHp: 2, hp: 2, fireEvery: 0.5, dmg: 1, shots: 1, pierce: 0 }
  const player = { x: 0, y: 0, r: 26, lean: 0 }
  const joy = { id: null, ox: 0, oy: 0, dx: 0, dy: 0 }
  const keys = {}
  let state = 'start', level = 0, kills = 0, mercy = 0, boss = null
  let enemies = [], bullets = [], sparks = [], confetti = []
  let time = 0, invuln = 0, fireIn = 0, spawnIn = 0, shake = 0, winT = 0
  let banner = { text: '', t: 0 }
  let rafId = 0

  function show(...names) {
    for (const n of ['start', 'upgrade', 'dead', 'win', 'gift', 'hud']) $(n).hidden = !names.includes(n)
  }
  function resetJoy() { joy.id = null; joy.dx = joy.dy = 0 }

  function hud() {
    const L = LEVELS[level], f = $('fill')
    $('lvl').textContent = boss ? 'Boss finale' : 'Livello ' + (level + 1) + ' di ' + LEVELS.length
    $('hearts').textContent = '❤️'.repeat(Math.max(0, S.hp)) + '🖤'.repeat(Math.max(0, S.maxHp - S.hp))
    if (boss) { f.style.width = Math.max(0, boss.hp / boss.max * 100) + '%'; f.style.background = 'var(--frosting)' }
    else { f.style.width = Math.min(1, kills / L.quota) * 100 + '%'; f.style.background = 'var(--flame)' }
  }

  function startLevel(n) {
    level = n; kills = 0; boss = null; enemies = []; bullets = []
    S.hp = S.maxHp; invuln = 1; spawnIn = 1.1; fireIn = 0.3
    banner = { text: 'Livello ' + (n + 1), t: 1.8 }
    show('hud'); state = 'play'; hud()
  }

  function spawnEnemy() {
    const L = LEVELS[level], a = rand(0, TAU), c = Math.cos(a), s = Math.sin(a)
    const d = Math.min((VW / 2 + 44) / Math.abs(c || 0.001), (VH / 2 + 44) / Math.abs(s || 0.001))
    const big = level >= BIG_FROM_LEVEL && Math.random() < BIG_CHANCE
    enemies.push({
      x: player.x + c * d, y: player.y + s * d,
      r: big ? 34 : 23, hp: L.hp * (big ? 3 : 1),
      speed: L.speed * (big ? 0.7 : 1) * rand(0.9, 1.1) * Math.max(MERCY_MIN_SPEED, 1 - MERCY_SLOW * mercy),
      face: enemyFaces[Math.floor(Math.random() * enemyFaces.length)],
      ph: rand(0, TAU), hit: 0, kx: 0, ky: 0,
    })
  }
  function spawnBoss() {
    boss = { x: player.x, y: player.y - VH / 2 - 90, r: 64, hp: BOSS.hp, max: BOSS.hp, speed: BOSS.speed, dashIn: BOSS.dashEvery, dashT: 0, face: bossFace, ph: 0, hit: 0, kx: 0, ky: 0, boss: true }
    enemies.push(boss)
    banner = { text: 'Boss finale', t: 2 }
    beep(110, 0.5, 'sawtooth', 0.06)
    hud()
  }

  function nearest() {
    let best = null, bd = RANGE
    for (const e of enemies) {
      const d = Math.hypot(e.x - player.x, e.y - player.y) - e.r
      if (d < bd) { bd = d; best = e }
    }
    return best
  }
  function shoot(t) {
    const a = Math.atan2(t.y - player.y, t.x - player.x)
    for (let i = 0; i < S.shots; i++) {
      const b = a + (i - (S.shots - 1) / 2) * 0.16
      bullets.push({
        x: player.x, y: player.y, vx: Math.cos(b) * BULLET_SPEED, vy: Math.sin(b) * BULLET_SPEED,
        life: 0.9, pierce: S.pierce, seen: [], c: PARTY[Math.floor(Math.random() * PARTY.length)],
      })
    }
    beep(880, 0.04, 'triangle', 0.018)
  }
  function burst(x, y, n, speed) {
    if (calm) n = Math.ceil(n / 3)
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), v = rand(0.3, 1) * speed
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.3, 0.6), r: rand(2, 4.5), c: PARTY[i % PARTY.length] })
    }
  }

  function hurt() {
    S.hp--; invuln = HIT_INVULN; shake = calm ? 0 : 1
    beep(140, 0.2, 'sawtooth', 0.06); hud()
    if (S.hp <= 0) {
      state = 'dead'; mercy++; resetJoy()
      $('retry').textContent = 'Riprova il livello ' + (level + 1)
      show('dead')
    }
  }
  function onKill(e) {
    burst(e.x, e.y, e.boss ? 60 : 10, e.boss ? 420 : 220)
    beep(e.boss ? 90 : 240, e.boss ? 0.5 : 0.08, 'square', 0.03)
    if (e.boss) { boss = null; levelClear(); return }
    kills++
    const L = LEVELS[level]
    if (!L.boss && kills >= L.quota) levelClear()
    else { if (L.boss && kills >= L.quota && !boss) spawnBoss(); hud() }
  }
  function levelClear() {
    for (const e of enemies) burst(e.x, e.y, 8, 200)
    enemies = []; bullets = []
    if (level === LEVELS.length - 1) {
      state = 'win'; winT = 0; show(); audio.fanfare()
      later(() => { show('win'); $('open').focus() }, 1200)
    } else {
      state = 'clear';
      [523, 659, 784].forEach((f, i) => beep(f, 0.16, 'triangle', 0.06, i * 0.11))
      later(showUpgrades, 800)
    }
  }
  function upgradeButton(u) {
    const b = document.createElement('button'); b.className = 'choice'
    const e = document.createElement('span'); e.className = 'e'; e.textContent = u.e
    const t = document.createElement('span'); t.className = 't'
    const n = document.createElement('b'); n.textContent = u.n
    const d = document.createElement('span'); d.textContent = u.d
    t.append(n, d); b.append(e, t)
    b.addEventListener('click', () => { u.f(S); startLevel(level + 1) })
    return b
  }
  function showUpgrades() {
    resetJoy()
    $('upTitle').textContent = 'Livello ' + (level + 1) + ' superato.'
    const box = $('choices'); box.textContent = ''
    const pool = UPGRADES.slice().sort(() => Math.random() - 0.5).slice(0, 3)
    for (const u of pool) box.appendChild(upgradeButton(u))
    show('upgrade')
  }

  /* ---------- Loop ---------- */
  function movePlayer(dt) {
    let mx = joy.dx / JOY, my = joy.dy / JOY
    if (keys.l) mx -= 1; if (keys.r) mx += 1; if (keys.u) my -= 1; if (keys.d) my += 1
    const m = Math.hypot(mx, my)
    if (m > 1) { mx /= m; my /= m }
    if (m < 0.12) mx = my = 0
    player.x += mx * S.speed * dt; player.y += my * S.speed * dt
    player.lean += (mx * 0.18 - player.lean) * Math.min(1, dt * 10)
  }

  function spawnAndFire(dt) {
    const L = LEVELS[level]
    spawnIn -= dt
    if (spawnIn <= 0) {
      spawnIn = L.every * (1 + MERCY_SPAWN * mercy) * (boss ? 1.7 : 1)
      if (enemies.length < MAX_ENEMIES(level)) spawnEnemy()
    }
    fireIn -= dt
    if (fireIn <= 0) {
      const t = nearest()
      if (t) { shoot(t); fireIn = S.fireEvery } else fireIn = 0
    }
  }

  function bossSpeed(e, dt) {
    e.dashIn -= dt
    if (e.dashIn <= 0) { e.dashIn = BOSS.dashEvery; e.dashT = BOSS.dashTime; beep(70, 0.25, 'sawtooth', 0.05) }
    if (e.dashT <= 0) return e.speed
    e.dashT -= dt
    return e.speed * BOSS.dashBoost
  }

  function moveEnemies(dt) {
    const damp = Math.pow(0.003, dt)
    for (const e of enemies) {
      const dx = player.x - e.x, dy = player.y - e.y, d = Math.hypot(dx, dy) || 1
      const speed = e.boss ? bossSpeed(e, dt) : e.speed
      e.x += (dx / d * speed + e.kx) * dt; e.y += (dy / d * speed + e.ky) * dt
      e.kx *= damp; e.ky *= damp; e.hit -= dt
      if (d < e.r + player.r - 8 && invuln <= 0 && state === 'play') hurt()
    }
  }

  function separateEnemies() {
    for (let i = 0; i < enemies.length; i++) for (let j = i + 1; j < enemies.length; j++) {
      const a = enemies[i], b = enemies[j]
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, min = (a.r + b.r) * 0.9
      if (d < min) {
        const p = (min - d) / 2 / d
        if (!a.boss) { a.x -= dx * p; a.y -= dy * p }
        if (!b.boss) { b.x += dx * p; b.y += dy * p }
      }
    }
  }

  function moveBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i]
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt
      let gone = b.life <= 0
      if (!gone) for (const e of enemies) {
        if (e.dead || b.seen.indexOf(e) >= 0) continue
        if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + 6) {
          e.hp -= S.dmg; e.hit = 0.1
          const k = e.boss ? BOSS.knockback : 200
          e.kx += b.vx / BULLET_SPEED * k; e.ky += b.vy / BULLET_SPEED * k
          burst(b.x, b.y, 3, 120)
          if (e.hp <= 0) e.dead = true
          if (e.boss) hud()
          if (b.pierce > 0) { b.pierce--; b.seen.push(e) } else { gone = true; break }
        }
      }
      if (gone) bullets.splice(i, 1)
    }
  }

  function collectDead() {
    const dead = enemies.filter(e => e.dead)
    if (!dead.length) return
    enemies = enemies.filter(e => !e.dead)
    for (const e of dead) { onKill(e); if (state !== 'play') break }
  }

  function updateParticles(dt) {
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]
      s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 0.94; s.vy *= 0.94; s.life -= dt
      if (s.life <= 0) sparks.splice(i, 1)
    }
    if (state === 'win') {
      winT += dt
      if (winT < 5 && confetti.length < (calm ? 40 : 260)) {
        for (let k = 0; k < (calm ? 1 : 5); k++) confetti.push({
          x: rand(0, W), y: -20, vx: rand(-40, 40), vy: rand(140, 340),
          rot: rand(0, TAU), vr: rand(-6, 6), w: rand(6, 11), h: rand(10, 18),
          c: PARTY[Math.floor(Math.random() * PARTY.length)],
        })
      }
    }
    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i]
      c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.vr * dt
      if (c.y > H + 30) confetti.splice(i, 1)
    }
  }

  function update(dt) {
    time += dt
    if (banner.t > 0) banner.t -= dt
    shake = Math.max(0, shake - dt * 4)
    if (state === 'play' || state === 'clear') movePlayer(dt)
    if (state === 'play') {
      invuln -= dt
      spawnAndFire(dt)
      moveEnemies(dt)
      if (state === 'play') {
        separateEnemies()
        moveBullets(dt)
        collectDead()
      }
    }
    updateParticles(dt)
  }

  function drawFace(e, wobble) {
    ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(wobble)
    const s = e.r * (e.hit > 0 ? 1.1 : 1)
    ctx.drawImage(e.face.img, -s, -s, s * 2, s * 2)
    if (e.hit > 0) {
      ctx.globalAlpha = 0.5; ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(0, 0, s - 3, 0, TAU); ctx.fill(); ctx.globalAlpha = 1
    }
    ctx.restore()
  }

  function drawWorld(camX, camY) {
    // Pavimento a puntini: scorre con la camera e dà il senso del movimento
    ctx.save()
    ctx.translate(-(((camX % GRID) + GRID) % GRID), -(((camY % GRID) + GRID) % GRID))
    ctx.fillStyle = dots; ctx.fillRect(-GRID, -GRID, VW + GRID * 3, VH + GRID * 3)
    ctx.restore()

    ctx.translate(-camX, -camY)

    const g = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, 340)
    g.addColorStop(0, 'rgba(255,194,75,0.20)')
    g.addColorStop(0.6, 'rgba(255,122,156,0.07)')
    g.addColorStop(1, 'rgba(255,122,156,0)')
    ctx.fillStyle = g; ctx.fillRect(camX - 20, camY - 20, VW + 40, VH + 40)

    for (const s of sparks) {
      ctx.globalAlpha = clamp(s.life * 3, 0, 1); ctx.fillStyle = s.c
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill()
    }
    ctx.globalAlpha = 1

    for (const e of enemies) drawFace(e, e.boss ? Math.sin(time * 3) * 0.06 : Math.sin(time * 7 + e.ph) * 0.12)

    ctx.lineCap = 'round'; ctx.lineWidth = 6
    for (const b of bullets) {
      ctx.strokeStyle = b.c
      ctx.beginPath(); ctx.moveTo(b.x - b.vx * 0.025, b.y - b.vy * 0.025); ctx.lineTo(b.x, b.y); ctx.stroke()
    }

    if (state !== 'start' && state !== 'gift') {
      ctx.globalAlpha = state === 'play' && invuln > 0 ? 0.55 + 0.35 * Math.sin(time * 30) : 1
      ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.lean)
      ctx.drawImage(heroFace.img, -player.r - 4, -player.r - 4, player.r * 2 + 8, player.r * 2 + 8)
      ctx.restore(); ctx.globalAlpha = 1
    }
  }

  function drawOverlay() {
    if (joy.id !== null) {
      ctx.strokeStyle = 'rgba(255,241,214,0.28)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(joy.ox, joy.oy, JOY + 14, 0, TAU); ctx.stroke()
      ctx.fillStyle = 'rgba(255,241,214,0.35)'
      ctx.beginPath(); ctx.arc(joy.ox + joy.dx, joy.oy + joy.dy, 22, 0, TAU); ctx.fill()
    }

    if (banner.t > 0 && state === 'play') {
      ctx.globalAlpha = clamp(banner.t / 0.4, 0, 1)
      ctx.fillStyle = '#fff1d6'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.font = '800 46px "Bricolage Grotesque", system-ui, sans-serif'
      ctx.fillText(banner.text, W / 2, H * 0.28)
      ctx.globalAlpha = 1
    }

    for (const c of confetti) {
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot)
      ctx.fillStyle = c.c; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h * Math.abs(Math.cos(c.rot * 0.7)) + 2)
      ctx.restore()
    }
  }

  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    ctx.clearRect(0, 0, W, H)
    const sx = shake > 0 ? (Math.random() - 0.5) * shake * 12 : 0
    const sy = shake > 0 ? (Math.random() - 0.5) * shake * 12 : 0
    const k = DPR * zoom
    ctx.setTransform(k, 0, 0, k, sx * DPR, sy * DPR)
    drawWorld(player.x - VW / 2, player.y - VH / 2)
    // Da qui in poi coordinate schermo
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    drawOverlay()
  }

  let last = 0
  function loop(t) {
    const dt = Math.min((t - last) / 1000 || 0, 0.033); last = t
    update(dt); draw()
    rafId = requestAnimationFrame(loop)
  }

  /* ---------- Comandi: joystick che nasce dove tocchi + tastiera ---------- */
  function onPointerDown(e) {
    if (joy.id !== null || (state !== 'play' && state !== 'clear')) return
    joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; joy.dx = joy.dy = 0
    try { cv.setPointerCapture(e.pointerId) } catch (err) { /* non supportato */ }
  }
  function onPointerMove(e) {
    if (e.pointerId !== joy.id) return
    let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy
    const d = Math.hypot(dx, dy)
    if (d > JOY) { // oltre il bordo la base segue il dito
      joy.ox += dx / d * (d - JOY); joy.oy += dy / d * (d - JOY)
      dx = dx / d * JOY; dy = dy / d * JOY
    }
    joy.dx = dx; joy.dy = dy
  }
  const onRelease = e => { if (e.pointerId === joy.id) resetJoy() }
  const onKeyDown = e => { const k = KEYMAP[e.key]; if (k) keys[k] = true }
  const onKeyUp = e => { const k = KEYMAP[e.key]; if (k) keys[k] = false }
  const onContextMenu = e => e.preventDefault()

  function openGift() {
    state = 'gift'
    show('gift')
    audio.stop()
    const box = $('video'), link = $('fallback')
    if (!VIDEO) {
      box.hidden = true; link.removeAttribute('href')
      link.textContent = 'Manca il link del video: impostalo in config.js.'
      return
    }
    const f = document.createElement('iframe')
    f.src = 'https://www.youtube.com/embed/' + VIDEO + '?autoplay=1&rel=0&playsinline=1'
    f.title = 'Il tuo regalo'
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'
    f.allowFullscreen = true
    f.referrerPolicy = 'strict-origin-when-cross-origin'
    box.appendChild(f)
    link.href = 'https://youtu.be/' + VIDEO
  }

  const windowListeners = [
    ['pointermove', onPointerMove], ['pointerup', onRelease], ['pointercancel', onRelease],
    ['keydown', onKeyDown], ['keyup', onKeyUp], ['resize', resize],
  ]
  cv.addEventListener('pointerdown', onPointerDown)
  cv.addEventListener('contextmenu', onContextMenu)
  for (const [ev, fn] of windowListeners) window.addEventListener(ev, fn)

  $('play').addEventListener('click', () => { audio.start(); mercy = 0; startLevel(0) })
  $('retry').addEventListener('click', () => startLevel(level))
  $('open').addEventListener('click', openGift)

  resize(); makeDots(); show('start')
  rafId = requestAnimationFrame(loop)

  function destroy() {
    cancelAnimationFrame(rafId)
    timers.forEach(clearTimeout)
    for (const [ev, fn] of windowListeners) window.removeEventListener(ev, fn)
    audio.stop()
  }

  return { destroy }
}
