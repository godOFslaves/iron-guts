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

  playDetect(): void {
    if (!this.ensureContext() || !this._ctx) return

    const now = this._ctx.currentTime
    const osc = this._ctx.createOscillator()
    const gain = this._ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.15)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

    osc.connect(gain)
    gain.connect(this._ctx.destination)
    osc.start(now)
    osc.stop(now + 0.2)
  }

  playWindup(): void {
    if (!this.ensureContext() || !this._ctx) return

    const now = this._ctx.currentTime
    const osc = this._ctx.createOscillator()
    const gain = this._ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.linearRampToValueAtTime(100, now + 0.5)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

    osc.connect(gain)
    gain.connect(this._ctx.destination)
    osc.start(now)
    osc.stop(now + 0.6)
  }

  playStrike(): void {
    if (!this.ensureContext() || !this._ctx) return

    const now = this._ctx.currentTime
    const osc = this._ctx.createOscillator()
    const gain = this._ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15)

    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

    osc.connect(gain)
    gain.connect(this._ctx.destination)
    osc.start(now)
    osc.stop(now + 0.2)
  }

  playDeath(): void {
    if (!this.ensureContext() || !this._ctx) return

    const now = this._ctx.currentTime

    // Two-tone descending death sound
    const osc1 = this._ctx.createOscillator()
    const gain1 = this._ctx.createGain()
    osc1.type = 'sawtooth'
    osc1.frequency.setValueAtTime(400, now)
    osc1.frequency.exponentialRampToValueAtTime(100, now + 0.5)
    gain1.gain.setValueAtTime(0.2, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
    osc1.connect(gain1)
    gain1.connect(this._ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.6)

    const osc2 = this._ctx.createOscillator()
    const gain2 = this._ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(300, now + 0.1)
    osc2.frequency.exponentialRampToValueAtTime(50, now + 0.7)
    gain2.gain.setValueAtTime(0.15, now + 0.1)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
    osc2.connect(gain2)
    gain2.connect(this._ctx.destination)
    osc2.start(now + 0.1)
    osc2.stop(now + 0.8)
  }

  enable(): void {
    if (this._ctx?.state === 'suspended') {
      this._ctx.resume()
    } else {
      this.ensureContext()
    }
  }

  dispose(): void {
    if (this._ctx) {
      this._ctx.close()
      this._ctx = null
      this._enabled = false
    }
  }
}
