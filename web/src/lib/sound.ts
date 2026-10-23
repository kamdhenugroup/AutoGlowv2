'use client'

/**
 * Interface sounds, synthesised with Web Audio (no audio files to download).
 * The audio context starts only after the visitor's first tap or key press, as browsers require.
 * Sound is on by default and the choice is remembered; the header toggle switches it.
 */

type Sound = 'tick' | 'click' | 'whoosh' | 'drop'

const KEY = 'ag-sound'
let ctx: AudioContext | null = null
let master: GainNode | null = null
let noise: AudioBuffer | null = null
let enabled = true
const listeners = new Set<(on: boolean) => void>()

if (typeof window !== 'undefined') {
  try {
    enabled = localStorage.getItem(KEY) !== 'off'
  } catch {}
}

function ensure() {
  if (ctx || typeof window === 'undefined') return ctx
  const AC = window.AudioContext ?? (window as unknown as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = 0.9
  master.connect(ctx.destination)
  // One second of white noise, reused by every noisy sound.
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const d = noise.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return ctx
}

/** Called on the first user gesture. */
export function unlockSound() {
  const c = ensure()
  if (c?.state === 'suspended') void c.resume()
}

export function soundEnabled() {
  return enabled
}

export function setSoundEnabled(on: boolean) {
  enabled = on
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {}
  listeners.forEach((l) => l(on))
  if (on) {
    unlockSound()
    play('click')
  }
}

export function onSoundChange(fn: (on: boolean) => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function env(g: GainNode, t: number, peak: number, attack: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
}

let lastTick = 0

export function play(kind: Sound) {
  if (!enabled || !ctx || !master || ctx.state !== 'running') return
  const t = ctx.currentTime
  if (kind === 'tick') {
    // A soft, high, glassy tick for hover. Rate-limited so sweeping the menu is not a buzz.
    if (t - lastTick < 0.045) return
    lastTick = t
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(2600, t)
    o.frequency.exponentialRampToValueAtTime(1900, t + 0.03)
    env(g, t, 0.025, 0.002, 0.04)
    o.connect(g).connect(master)
    o.start(t)
    o.stop(t + 0.06)
  } else if (kind === 'click') {
    // A short mechanical click: a pitched body plus a filtered noise transient.
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'triangle'
    o.frequency.setValueAtTime(820, t)
    o.frequency.exponentialRampToValueAtTime(240, t + 0.06)
    env(g, t, 0.09, 0.002, 0.07)
    o.connect(g).connect(master)
    o.start(t)
    o.stop(t + 0.1)
    const n = ctx.createBufferSource()
    n.buffer = noise
    const f = ctx.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = 3500
    const ng = ctx.createGain()
    env(ng, t, 0.05, 0.001, 0.025)
    n.connect(f).connect(ng).connect(master)
    n.start(t)
    n.stop(t + 0.04)
  } else if (kind === 'whoosh') {
    // Air past glass: band-passed noise swept upward, for page transitions.
    const n = ctx.createBufferSource()
    n.buffer = noise
    n.loop = true
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.Q.value = 1.2
    f.frequency.setValueAtTime(300, t)
    f.frequency.exponentialRampToValueAtTime(2400, t + 0.42)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.18)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55)
    n.connect(f).connect(g).connect(master)
    n.start(t)
    n.stop(t + 0.6)
  } else if (kind === 'drop') {
    // A water bead: a quick falling sine "plip".
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(1400, t)
    o.frequency.exponentialRampToValueAtTime(380, t + 0.09)
    env(g, t, 0.06, 0.003, 0.12)
    o.connect(g).connect(master)
    o.start(t)
    o.stop(t + 0.16)
  }
}
