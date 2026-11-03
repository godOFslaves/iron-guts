export type HealthState = 'healthy' | 'hurt' | 'dead'

export class PlayerHealth {
  private _health: number
  private _maxHealth: number
  private _state: HealthState = 'healthy'
  private _hurtTimer = 0
  private _damageCooldown = 0

  constructor(
    maxHealth: number,
    private readonly damageCooldownTime: number
  ) {
    this._health = maxHealth
    this._maxHealth = maxHealth
  }

  get health(): number {
    return this._health
  }

  get maxHealth(): number {
    return this._maxHealth
  }

  get state(): HealthState {
    return this._state
  }

  get isDead(): boolean {
    return this._state === 'dead'
  }

  get isHurt(): boolean {
    return this._state === 'hurt'
  }

  get hurtTimer(): number {
    return this._hurtTimer
  }

  get damageCooldown(): number {
    return this._damageCooldown
  }

  takeDamage(amount: number): boolean {
    if (this._state === 'dead') return false
    if (this._damageCooldown > 0) return false

    this._health = Math.max(0, this._health - amount)
    this._damageCooldown = this.damageCooldownTime
    this._hurtTimer = 0.3

    if (this._health <= 0) {
      this._state = 'dead'
    } else {
      this._state = 'hurt'
    }
    return true
  }

  update(dt: number): void {
    if (this._damageCooldown > 0) {
      this._damageCooldown = Math.max(0, this._damageCooldown - dt)
    }
    if (this._hurtTimer > 0) {
      this._hurtTimer -= dt
      if (this._hurtTimer <= 0 && this._state === 'hurt') {
        this._state = 'healthy'
      }
    }
  }

  reset(): void {
    this._health = this._maxHealth
    this._state = 'healthy'
    this._hurtTimer = 0
    this._damageCooldown = 0
  }
}
