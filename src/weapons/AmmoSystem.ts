export type AmmoState = 'ready' | 'reloading' | 'empty'

export class AmmoSystem {
  private _ammo: number
  private _state: AmmoState = 'ready'
  private _reloadTimer = 0
  private _fireCooldown = 0

  constructor(
    private readonly magSize: number,
    private readonly reloadTime: number,
    private readonly fireDelay: number
  ) {
    this._ammo = magSize
  }

  get ammo(): number {
    return this._ammo
  }

  get state(): AmmoState {
    return this._state
  }

  get isReloading(): boolean {
    return this._state === 'reloading'
  }

  get canFire(): boolean {
    return this._state === 'ready' && this._ammo > 0 && this._fireCooldown <= 0
  }

  get fireCooldown(): number {
    return this._fireCooldown
  }

  get reloadProgress(): number {
    if (this._state !== 'reloading') return 0
    return this._reloadTimer / this.reloadTime
  }

  fire(): boolean {
    if (!this.canFire) return false
    this._ammo--
    this._fireCooldown = this.fireDelay
    if (this._ammo === 0) {
      this._state = 'empty'
    }
    return true
  }

  reload(): void {
    if (this._state === 'reloading' || this._ammo === this.magSize) return
    this._state = 'reloading'
    this._reloadTimer = 0
  }

  update(dt: number): void {
    if (this._fireCooldown > 0) {
      this._fireCooldown = Math.max(0, this._fireCooldown - dt)
    }

    if (this._state === 'reloading') {
      this._reloadTimer += dt
      if (this._reloadTimer >= this.reloadTime) {
        this._ammo = this.magSize
        this._state = 'ready'
        this._reloadTimer = 0
      }
    }
  }

  reset(): void {
    this._ammo = this.magSize
    this._state = 'ready'
    this._reloadTimer = 0
    this._fireCooldown = 0
  }
}
