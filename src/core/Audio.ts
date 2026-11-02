const AudioContext = (typeof window !== 'undefined' && window.AudioContext)
  ? window.AudioContext
  : null

export class AudioSystem {
  private _ctx: AudioContext | null = null
  private _enabled = false

  constructor() {
    // Audio only works after user interaction
  }

  private ensureContext(): boolean {
    if (this._enabled) return true
    if (!AudioContext) return false
    this._ctx = new AudioContext()
    this._enabled = true
    return true
  }

  playShoot(): void {
    if (!this.ensureContext() || !this._ctx) return

    const now = this._ctx.currentTime
    const osc = this._ctx.createOscillator()
    const gain = this._ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1)

    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

    osc.connect(gain)
    gain.connect(this._ctx.destination)
    osc.start(now)
    osc.stop(now + 0.15)
  }

  playHit(): void {
    if (!this.ensureContext() || !this._ctx) return

    const now = this._ctx.currentTime
    const osc = this._ctx.createOscillator()
    const gain = this._ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

    osc.connect(gain)
    gain.connect(this._ctx.destination)
    osc.start(now)
    osc.stop(now + 0.1)
  }

  playReload(): void {
    if (!this.ensureContext() || !this._ctx) return

    const now = this._ctx.currentTime
    const osc = this._ctx.createOscillator()
    const gain = this._ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(300, now)
    osc.frequency.linearRampToValueAtTime(500, now + 0.2)

    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    osc.connect(gain)
    gain.connect(this._ctx.destination)
    osc.start(now)
    osc.stop(now + 0.25)
  }

  enable(): void {
    if (this._ctx?.state === 'suspended') {
      this._ctx.resume()
    } else {
      this.ensureContext()
    }
  }
}
