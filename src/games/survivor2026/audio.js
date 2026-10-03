/* ---------- Suoni (generati, nessun file) ---------- */
export function createAudio() {
  let ac = null

  function start() {
    try { ac = new (window.AudioContext || window.webkitAudioContext)() } catch (e) { ac = null }
  }

  function stop() {
    if (!ac) return
    try { ac.close() } catch (e) { /* già chiuso */ }
    ac = null
  }

  function beep(freq, dur = 0.09, type = 'triangle', gain = 0.06, when = 0) {
    if (!ac) return
    try {
      const t0 = ac.currentTime + when, o = ac.createOscillator(), a = ac.createGain()
      o.type = type; o.frequency.value = freq
      a.gain.setValueAtTime(gain, t0)
      a.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
      o.connect(a); a.connect(ac.destination)
      o.start(t0); o.stop(t0 + dur + 0.02)
    } catch (e) { /* audio non disponibile: si gioca muti */ }
  }

  function fanfare() {
    [[392, 0], [392, 0.28], [440, 0.42], [392, 0.84], [523, 1.26], [494, 1.68]]
      .forEach(([f, w]) => beep(f, w === 1.68 ? 0.7 : 0.36, 'triangle', 0.08, w))
  }

  return { start, stop, beep, fanfare }
}
