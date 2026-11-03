import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as THREE from 'three'
import { EnemySystem } from '../../src/core/EnemySystem'
import { PlayerHealth } from '../../src/entities/PlayerHealth'

const mockScene = { add: () => {} } as THREE.Scene

describe('EnemySystem', () => {
  let system: EnemySystem
  let playerHealth: PlayerHealth

  beforeEach(() => {
    system = new EnemySystem(mockScene)
    playerHealth = new PlayerHealth(100, 0.5)
  })

  afterEach(() => {
    system.dispose()
  })

  it('enemy deals damage without wall', () => {
    system.addEnemy([0, 0, 0])
    system.setWallMeshes([])
    const enemy = system.enemies[0]
    enemy['_state'] = 'attack'
    enemy.tryAttack()
    enemy['_attackPhaseTimer'] = 0.01
    system.update(0.016, { x: 0.5, z: 0 }, playerHealth)
    expect(playerHealth.health).toBeLessThan(100)
  })

  it('normal attack without obstacles works', () => {
    system.addEnemy([0, 0, 0])
    system.setWallMeshes([])
    const enemy = system.enemies[0]
    enemy['_state'] = 'attack'
    enemy.tryAttack()
    enemy['_attackPhaseTimer'] = 0.01
    system.update(0.016, { x: 0.5, z: 0 }, playerHealth)
    expect(playerHealth.health).toBeLessThan(100)
  })

  it('reset recreates all enemies', () => {
    system.addEnemy([0, 0, 0])
    system.addEnemy([3, 0, 0])
    expect(system.enemies.length).toBe(2)
    const spawns = [
      { position: [-2, 0, -2] as [number, number, number] },
      { position: [2, 0, -2] as [number, number, number] },
      { position: [0, 0, -4] as [number, number, number] },
    ]
    system.reset(spawns)
    expect(system.enemies.length).toBe(3)
  })

  it('applyHit finds enemy by mesh hierarchy', () => {
    system.addEnemy([0, 0, 0])
    const enemy = system.enemies[0]
    let childMesh: THREE.Object3D | null = null
    enemy.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh && !childMesh) {
        childMesh = child
      }
    })
    expect(childMesh).not.toBeNull()
    const found = system.applyHit(childMesh!)
    expect(found).toBe(enemy)
  })

  it('applyHit returns undefined for dead enemy', () => {
    system.addEnemy([0, 0, 0])
    const enemy = system.enemies[0]
    enemy.takeDamage(50)
    let childMesh: THREE.Object3D | null = null
    enemy.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh && !childMesh) {
        childMesh = child
      }
    })
    const found = system.applyHit(childMesh!)
    expect(found).toBeUndefined()
  })

  it('full attack cycle: detect -> windup -> strike -> damage', () => {
    system.addEnemy([0, 0, 0])
    system.setWallMeshes([])
    playerHealth = new PlayerHealth(100, 0.5)
    const enemy = system.enemies[0]
    system.update(0.016, { x: 3, z: 0 }, playerHealth)
    expect(enemy.isDetected).toBe(true)
    expect(enemy.hasLOS).toBe(true)
    system.update(0.016, { x: 2, z: 0 }, playerHealth)
    expect(enemy.state).toBe('chase')
    system.update(0.016, { x: 0.5, z: 0 }, playerHealth)
    expect(enemy.state).toBe('attack')
    enemy.tryAttack()
    expect(enemy.attackPhase).toBe('windup')
    enemy['_attackPhaseTimer'] = 0.01
    system.update(0.016, { x: 0.5, z: 0 }, playerHealth)
    expect(enemy.attackPhase).toBe('strike')
    expect(playerHealth.health).toBeLessThan(100)
  })

  it('repeated attacks work after cooldown', () => {
    system.addEnemy([0, 0, 0])
    system.setWallMeshes([])
    playerHealth = new PlayerHealth(100, 0)
    const enemy = system.enemies[0]
    enemy['_state'] = 'attack'
    enemy.tryAttack()
    enemy['_attackPhaseTimer'] = 0.01
    system.update(0.016, { x: 0.5, z: 0 }, playerHealth)
    const hp1 = playerHealth.health
    enemy['_attackPhaseTimer'] = 0.01
    system.update(0.016, { x: 0.5, z: 0 }, playerHealth)
    enemy['_attackPhaseTimer'] = 0.01
    system.update(0.016, { x: 0.5, z: 0 }, playerHealth)
    enemy.tryAttack()
    enemy['_attackPhaseTimer'] = 0.01
    system.update(0.016, { x: 0.5, z: 0 }, playerHealth)
    expect(playerHealth.health).toBeLessThan(hp1)
  })
})