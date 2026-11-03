import { describe, it, expect } from 'vitest'
import { PlayerHealth } from '../../src/entities/PlayerHealth'

describe('PlayerHealth', () => {
  it('starts at max health', () => {
    const health = new PlayerHealth(100, 0.5)
    expect(health.health).toBe(100)
    expect(health.maxHealth).toBe(100)
    expect(health.state).toBe('healthy')
    expect(health.isDead).toBe(false)
    expect(health.isHurt).toBe(false)
  })

  it('takes damage', () => {
    const health = new PlayerHealth(100, 0.5)
    const result = health.takeDamage(25)
    expect(result).toBe(true)
    expect(health.health).toBe(75)
    expect(health.state).toBe('hurt')
  })

  it('cannot take damage when dead', () => {
    const health = new PlayerHealth(50, 0.5)
    health.takeDamage(50)
    expect(health.isDead).toBe(true)

    const result = health.takeDamage(10)
    expect(result).toBe(false)
    expect(health.health).toBe(0)
  })

  it('blocks damage during cooldown', () => {
    const health = new PlayerHealth(100, 0.5)
    health.takeDamage(20)
    expect(health.damageCooldown).toBeCloseTo(0.5)

    const result = health.takeDamage(20)
    expect(result).toBe(false)
    expect(health.health).toBe(80)
  })

  it('dies at zero health', () => {
    const health = new PlayerHealth(30, 0.5)
    health.takeDamage(30)
    expect(health.isDead).toBe(true)
    expect(health.health).toBe(0)
  })

  it('recovers from hurt state after timer', () => {
    const health = new PlayerHealth(100, 0.5)
    health.takeDamage(10)
    expect(health.isHurt).toBe(true)

    health.update(0.35)
    expect(health.isHurt).toBe(false)
    expect(health.state).toBe('healthy')
  })

  it('damage cooldown decreases over time', () => {
    const health = new PlayerHealth(100, 1.0)
    health.takeDamage(10)
    expect(health.damageCooldown).toBeCloseTo(1.0)

    health.update(0.6)
    expect(health.damageCooldown).toBeCloseTo(0.4)

    health.update(0.6)
    expect(health.damageCooldown).toBe(0)
  })

  it('reset restores full health', () => {
    const health = new PlayerHealth(100, 0.5)
    health.takeDamage(50)
    expect(health.health).toBe(50)

    health.reset()
    expect(health.health).toBe(100)
    expect(health.state).toBe('healthy')
    expect(health.isDead).toBe(false)
    expect(health.damageCooldown).toBe(0)
  })

  it('does not go below zero', () => {
    const health = new PlayerHealth(10, 0.5)
    health.takeDamage(100)
    expect(health.health).toBe(0)
  })

  it('takes multiple small damages', () => {
    const health = new PlayerHealth(100, 0)
    health.takeDamage(10)
    health.takeDamage(20)
    health.takeDamage(30)
    expect(health.health).toBe(40)
  })
})
