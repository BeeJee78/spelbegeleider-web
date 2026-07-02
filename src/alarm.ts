// Geluid via Web Audio API, trillen via de Vibration API (Android; iOS ondersteunt dit niet).
// De AudioContext moet vanuit een gebruikersactie aangemaakt worden — init() wordt daarom
// aangeroepen bij de START-knop.

let ctx: AudioContext | null = null

export function initAudio() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as any).webkitAudioContext
    if (AC) ctx = new AC()
  }
  if (ctx && ctx.state === 'suspended') void ctx.resume()
}

function beep(at: number, frequency: number, duration: number) {
  if (!ctx) return
  const gain = ctx.createGain()
  gain.connect(ctx.destination)
  // Envelope: scherpe aanslag, korte release
  gain.gain.setValueAtTime(0, at)
  gain.gain.linearRampToValueAtTime(0.5, at + 0.005)
  gain.gain.setValueAtTime(0.5, at + duration - 0.04)
  gain.gain.linearRampToValueAtTime(0, at + duration)

  // Grondtoon + octaaf + kwint voor een vollere toon
  const partials: Array<[number, number]> = [
    [frequency, 0.55],
    [frequency * 2, 0.3],
    [frequency * 3, 0.15],
  ]
  for (const [freq, amp] of partials) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    g.gain.value = amp
    osc.frequency.value = freq
    osc.connect(g)
    g.connect(gain)
    osc.start(at)
    osc.stop(at + duration)
  }
}

export function triggerPeriodEnd() {
  initAudio()
  if (ctx) {
    const now = ctx.currentTime
    for (let i = 0; i < 3; i++) beep(now + i * 0.55, 880, 0.4)
  }
  // 5× trillen met tussenpozen
  if (navigator.vibrate) navigator.vibrate([400, 100, 400, 100, 400, 100, 400, 100, 400])
}

export function goalHaptic() {
  if (navigator.vibrate) navigator.vibrate([60, 60, 60])
}

export function lightTap() {
  if (navigator.vibrate) navigator.vibrate(15)
}
