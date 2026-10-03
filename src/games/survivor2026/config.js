/* ============ DA PERSONALIZZARE ============ */
// crop: dove sta la faccia nella foto (frazioni). cx/cy = centro, size = lato rispetto alla larghezza.
// Senza crop la foto viene ritagliata al centro.
export const CONFIG = {
  name: 'Luca',                                            // nome del festeggiato
  youtube: 'https://www.youtube.com/watch?v=X2acP06791I',  // link (o ID) del video finale
  hero: { src: '/custom/luca.jpeg', crop: { cx: 0.5, cy: 0.55, size: 0.95 } },
  enemies: [
    { src: '/custom/dado.png', crop: { cx: 0.44, cy: 0.29, size: 0.42 } },
    { src: '/custom/marco-pika.png', crop: { cx: 0.48, cy: 0.15, size: 0.36 } },
    { src: '/custom/fabrizio.png', crop: { cx: 0.45, cy: 0.19, size: 0.38 } },
    { src: '/custom/valentino.jpeg', crop: { cx: 0.5, cy: 0.5, size: 1 } },
  ],
  boss: { src: '/custom/silvia.jpeg', crop: { cx: 0.64, cy: 0.42, size: 0.68 } },
}
