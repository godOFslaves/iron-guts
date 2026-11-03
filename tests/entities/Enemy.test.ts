import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { Enemy } from '../../src/entities/Enemy'

const mockScene = { add: () => {} } as THREE.Scene

describe('Enemy', () => {
  it('starts in idle state', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    expect(enemy.state).toBe('idle')
    expect(enemy.alive).toBe(true)
    expect(enemy.health).toBe(50)
  })

  it('starts with attackPhase none', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    expect(enemy.attackPhase).toBe('none')
  })

  it('starts with isDetected false', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    expect(enemy.isDetected).toBe(false)
  })

  it('enters chase state when player is close', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    enemy.update(0.016, { x: 2, z: 0 })
    expect(enemy.state).toBe('chase')
    enemy.update(0.016, { x: 10, z: 0 })
    expect(enemy.state).toBe('idle')
  })

  it('enters attack state when player is in range', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    enemy.update(0.016, { x: 0.5, z: 0 })
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
    expect(enemy.takeDamage(10)).toBe(false)
  })

  it('can try attack when in attack state', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    enemy['_state'] = 'attack'
    const attacked = enemy.tryAttack()
    expect(attacked).toBe(true)
    expect(enemy.attackPhase).toBe('windup')
  })

  it('cannot try attack when not in attack state', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    expect(enemy.tryAttack()).toBe(false)
  })

  it('cannot try attack when phase not none', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    enemy['_state'] = 'attack'
    enemy['_attackPhase'] = 'windup'
    expect(enemy.tryAttack()).toBe(false)
  })

  it('moves toward target with collision', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    const newPos = enemy.moveToward(2, 0, 2, 0.5, { x: 0, z: 0 })
    expect(newPos.x).toBeGreaterThan(0)
    expect(newPos.z).toBe(0)
  })

  it('detects player within range', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    expect(enemy.isInDetectionRange({ x: 3, z: 0 })).toBe(true)
    expect(enemy.isInDetectionRange({ x: 10, z: 0 })).toBe(false)
  })

  it('detects player within attack range', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    expect(enemy.isInAttackRange({ x: 0.5, z: 0 })).toBe(true)
    expect(enemy.isInAttackRange({ x: 3, z: 0 })).toBe(false)
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
    const resolved = enemy.resolvePlayerCollision({ x: 0.55, z: 0 }, { x: 0.5, z: 0 })
    expect(resolved.x).toBeGreaterThan(1.19)
  })

  it('does not push away when far from player', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    const resolved = enemy.resolvePlayerCollision({ x: 1, z: 0 }, { x: 10, z: 0 })
    expect(resolved.x).toBe(1)
    expect(resolved.z).toBe(0)
  })

  it('applies hit visual feedback', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    enemy.applyHitVisual()
    expect(enemy.alive).toBe(true)
  })

  it('death animation scales down', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    enemy.takeDamage(50)
    expect(enemy.alive).toBe(false)
    enemy.update(0.5, { x: 0, z: 0 })
    expect(enemy.mesh.scale.x).toBeLessThan(1)
  })

  it('full attack cycle: detect -> chase -> attack -> windup -> strike -> cooldown', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    expect(enemy.state).toBe('idle')
    expect(enemy.attackPhase).toBe('none')
    enemy.update(0.016, { x: 10, z: 0 }, [])
    expect(enemy.state).toBe('idle')
    enemy.update(0.016, { x: 3, z: 0 }, [])
    expect(enemy.state).toBe('chase')
    enemy.update(0.016, { x: 0.5, z: 0 }, [])
    expect(enemy.state).toBe('attack')
    enemy.tryAttack()
    expect(enemy.attackPhase).toBe('windup')
    enemy['_attackPhaseTimer'] = 0.01
    enemy.update(0.016, { x: 0.5, z: 0 }, [])
    expect(enemy.attackPhase).toBe('strike')
    enemy['_attackPhaseTimer'] = 0.01
    enemy.update(0.016, { x: 0.5, z: 0 }, [])
    expect(enemy.attackPhase).toBe('cooldown')
    enemy['_attackPhaseTimer'] = 0.01
    enemy.update(0.016, { x: 0.5, z: 0 }, [])
    expect(enemy.attackPhase).toBe('none')
  })

  it('attack can be retried after cooldown completes', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    enemy['_state'] = 'attack'
    enemy.tryAttack()
    expect(enemy.attackPhase).toBe('windup')
    enemy['_attackPhaseTimer'] = 0.01
    enemy.update(0.016, { x: 0.5, z: 0 }, [])
    enemy['_attackPhaseTimer'] = 0.01
    enemy.update(0.016, { x: 0.5, z: 0 }, [])
    enemy['_attackPhaseTimer'] = 0.01
    enemy.update(0.016, { x: 0.5, z: 0 }, [])
    expect(enemy.attackPhase).toBe('none')
    enemy.tryAttack()
    expect(enemy.attackPhase).toBe('windup')
  })

  it('calls audio callbacks on death', () => {
    let deathCalled = false
    const enemy = new Enemy([0, 0, 0], mockScene, { onDeath: () => { deathCalled = true } })
    enemy.takeDamage(50)
    expect(deathCalled).toBe(true)
  })

  it('calls audio callback on detect', () => {
    let detectCalled = false
    const enemy = new Enemy([0, 0, 0], mockScene, { onDetect: () => { detectCalled = true } })
    enemy.update(0.016, { x: 2, z: 0 }, [])
    expect(detectCalled).toBe(true)
  })

  it('warning ring shown when LOS clear', () => {
    const enemy = new Enemy([0, 0, 0], mockScene)
    enemy.update(0.016, { x: 0.5, z: 0 }, [])
    expect(enemy.state).toBe('attack')
    expect(enemy.hasLOS).toBe(true)
    const ringMat = (enemy as unknown as { _warningRing: { material: THREE.MeshBasicMaterial } })['_warningRing']?.material
    expect(ringMat?.opacity).toBeGreaterThan(0)
  })

  it('lineIntersectsBox: ray passes through AABB', () => {
    const aabb = { min: [1.5, -0.5, -0.5] as [number, number, number], max: [2.5, 0.5, 0.5] as [number, number, number] }
    expect(Enemy.lineIntersectsBox([0, 0, 0], [4, 0, 0], aabb)).toBe(true)
  })

  it('lineIntersectsBox: ray misses AABB', () => {
    const aabb = { min: [1.5, 9.5, -0.5] as [number, number, number], max: [2.5, 10.5, 0.5] as [number, number, number] }
    expect(Enemy.lineIntersectsBox([0, 0, 0], [4, 0, 0], aabb)).toBe(false)
  })

  it('lineIntersectsBox: ray parallel to AABB face', () => {
    const aabb = { min: [1.5, -1.5, -0.5] as [number, number, number], max: [2.5, 1.5, 0.5] as [number, number, number] }
    expect(Enemy.lineIntersectsBox([0, 0, 0], [4, 0, 0], aabb)).toBe(true)
  })

  it('lineIntersectsBox: ray behind AABB', () => {
    const aabb = { min: [-2.5, -0.5, -0.5] as [number, number, number], max: [-1.5, 0.5, 0.5] as [number, number, number] }
    expect(Enemy.lineIntersectsBox([0, 0, 0], [4, 0, 0], aabb)).toBe(false)
  })

  it('lineIntersectsBox: wall blocks LOS between enemy and player', () => {
    const wallAABB = { min: [1.9, 0, -1.5] as [number, number, number], max: [2.1, 3, 1.5] as [number, number, number] }
    expect(Enemy.lineIntersectsBox([0, 1, 0], [4, 1, 0], wallAABB)).toBe(true)
  })

  it('lineIntersectsBox: wall at angle blocks LOS', () => {
    const wallAABB = { min: [0, 0, 1.4] as [number, number, number], max: [3, 3, 1.6] as [number, number, number] }
    expect(Enemy.lineIntersectsBox([0, 1, 0], [3, 1, 3], wallAABB)).toBe(true)
  })

  it('lineIntersectsBox: two walls both block', () => {
    const wall1 = { min: [1.9, 0, -1.5] as [number, number, number], max: [2.1, 3, 1.5] as [number, number, number] }
    const wall2 = { min: [2.9, 0, -1.5] as [number, number, number], max: [3.1, 3, 1.5] as [number, number, number] }
    expect(Enemy.lineIntersectsBox([0, 1, 0], [4, 1, 0], wall1)).toBe(true)
    expect(Enemy.lineIntersectsBox([0, 1, 0], [4, 1, 0], wall2)).toBe(true)
  })

  it('lineIntersectsBox: no wall means clear LOS', () => {
    const empty = { min: [-10, -10, -10] as [number, number, number], max: [-9, -9, -9] as [number, number, number] }
    expect(Enemy.lineIntersectsBox([0, 1, 0], [4, 1, 0], empty)).toBe(false)
  })
})