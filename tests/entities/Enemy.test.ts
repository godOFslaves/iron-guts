import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { Enemy } from '../../src/entities/Enemy'

// Mock THREE.Scene
const mockScene = {
  add: () => {},
} as THREE.Scene

describe('Enemy', () => {
  it('starts in idle state', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    expect(enemy.state).toBe('idle')
    expect(enemy.alive).toBe(true)
    expect(enemy.health).toBe(50) // from config
  })

  it('enters chase state when player is close', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    const closePlayer = { x: 2, z: 0 }
    const farPlayer = { x: 10, z: 0 }

    enemy.update(0.016, closePlayer)
    expect(enemy.state).toBe('chase')

    enemy.update(0.016, farPlayer)
    expect(enemy.state).toBe('idle')
  })

  it('enters attack state when player is in range', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    const attackPlayer = { x: 0.5, z: 0 }

    enemy.update(0.016, attackPlayer)
    expect(enemy.state).toBe('attack')
  })

  it('takes damage', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    const alive = enemy.takeDamage(25)
    expect(alive).toBe(true)
    expect(enemy.health).toBe(25)
  })

  it('dies at zero health', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    const alive = enemy.takeDamage(50)
    expect(alive).toBe(false)
    expect(enemy.alive).toBe(false)
    expect(enemy.state).toBe('dead')
  })

  it('cannot take damage when dead', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    enemy.takeDamage(50)
    const result = enemy.takeDamage(10)
    expect(result).toBe(false)
  })

  it('can try attack when in attack state', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    // Set to attack state manually
    enemy._state = 'attack'

    const attacked = enemy.tryAttack()
    expect(attacked).toBe(true)
    expect(enemy.attackTimer).toBeGreaterThan(0)
  })

  it('cannot try attack when not in attack state', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    const attacked = enemy.tryAttack()
    expect(attacked).toBe(false)
  })

  it('cannot try attack when cooldown active', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    enemy._state = 'attack'
    enemy._attackTimer = 0.5

    const attacked = enemy.tryAttack()
    expect(attacked).toBe(false)
  })

  it('moves toward target with collision', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    const newPos = enemy.moveToward(2, 0, 2, 0.5, { x: 0, z: 0 })
    expect(newPos.x).toBeGreaterThan(0)
    expect(newPos.z).toBe(0)
  })

  it('detects player within range', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    const closePlayer = { x: 3, z: 0 }
    const farPlayer = { x: 10, z: 0 }

    expect(enemy.isInDetectionRange(closePlayer)).toBe(true)
    expect(enemy.isInDetectionRange(farPlayer)).toBe(false)
  })

  it('detects player within attack range', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    const closePlayer = { x: 0.5, z: 0 }
    const farPlayer = { x: 3, z: 0 }

    expect(enemy.isInAttackRange(closePlayer)).toBe(true)
    expect(enemy.isInAttackRange(farPlayer)).toBe(false)
  })

  it('hit flash timer decreases', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    enemy.takeDamage(10)
    expect(enemy.hitFlashTimer).toBeGreaterThan(0)

    enemy.update(0.2, { x: 0, z: 0 })
    expect(enemy.hitFlashTimer).toBe(0)
  })

  it('resolves collision with player', () => {
    const enemy = new Enemy([1, 0, 0], mockScene)
    const playerPos = { x: 0.5, z: 0 } // Player close to enemy
    // New position would overlap with player
    const resolved = enemy.resolvePlayerCollision({ x: 0.55, z: 0 }, playerPos)
    // Enemy should be pushed away from player (x should be > player.x + minDist)
    // minDist = 0.3 + 0.4 = 0.7
    // Player at 0.5, so enemy should be pushed to > 1.2
    expect(resolved.x).toBeGreaterThan(1.19)
  })

  it('does not push away when far from player', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    const playerPos = { x: 10, z: 0 }
    const resolved = enemy.resolvePlayerCollision({ x: 1, z: 0 }, playerPos)
    // No push needed, position unchanged
    expect(resolved.x).toBe(1)
    expect(resolved.z).toBe(0)
  })
})
