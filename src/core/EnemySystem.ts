import * as THREE from 'three'
import { Enemy, EnemyAudioCallbacks } from '../entities/Enemy.js'
import { PlayerHealth } from '../entities/PlayerHealth.js'
import { PlayerPos } from '../core/Physics.js'
import { ENEMY } from '../config/game.js'

export class EnemySystem {
  private _enemies: Enemy[] = []
  private _wallMeshes: THREE.Mesh[] = []

  constructor(private readonly scene: THREE.Scene) {}

  setWallMeshes(meshes: THREE.Mesh[]): void {
    this._wallMeshes = meshes
  }

  addEnemy(position: [number, number, number], audio: EnemyAudioCallbacks = {}): void {
    const enemy = new Enemy(position, this.scene, audio)
    this._enemies.push(enemy)
  }

  get enemies(): Enemy[] {
    return this._enemies
  }

  get aliveCount(): number {
    return this._enemies.filter((e) => e.alive).length
  }

  get totalDead(): number {
    return this._enemies.filter((e) => !e.alive).length
  }

  getTotal(): number {
    return this._enemies.length
  }

  /**
   * Update all enemies. Returns total damage dealt to player this frame.
   */
  update(
    dt: number,
    playerPos: PlayerPos,
    playerHealth: PlayerHealth
  ): number {
    // Enemy-enemy separation
    for (let i = 0; i < this._enemies.length; i++) {
      for (let j = i + 1; j < this._enemies.length; j++) {
        const a = this._enemies[i]
        const b = this._enemies[j]
        if (!a.alive || !b.alive) continue
        this._separateEnemies(a, b)
      }
    }

    let totalDamage = 0
    for (const enemy of this._enemies) {
      enemy.update(dt, playerPos, this._wallMeshes)

      // Only deal damage during strike phase, with LOS check
      if (enemy.attackPhase === 'strike' && enemy.isInAttackRange(playerPos) && enemy.hasLOS) {
        if (playerHealth.takeDamage(ENEMY.damage)) {
          totalDamage += ENEMY.damage
        }
      }

      // Start attack (enter windup) when in attack state, in range, and has LOS
      // This is called every frame but tryAttack() only succeeds once per attack
      if (enemy.state === 'attack' && enemy.isInAttackRange(playerPos) && enemy.hasLOS) {
        enemy.tryAttack()
      }
    }

    return totalDamage
  }

  /**
   * Push two enemies apart if they overlap.
   */
  private _separateEnemies(a: Enemy, b: Enemy): void {
    const dx = b.pos.x - a.pos.x
    const dz = b.pos.z - a.pos.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    const minDist = ENEMY.enemySeparationRadius

    if (dist < minDist && dist > 0.001) {
      const push = (minDist - dist) / 2
      const pushX = (dx / dist) * push
      const pushZ = (dz / dist) * push

      const newPosA = { x: a.pos.x - pushX, z: a.pos.z - pushZ }
      const newPosB = { x: b.pos.x + pushX, z: b.pos.z + pushZ }

      const resolvedA = this._resolveWallCollision(newPosA)
      const resolvedB = this._resolveWallCollision(newPosB)

      a.setPos(resolvedA)
      b.setPos(resolvedB)
    }
  }

  private _resolveWallCollision(pos: PlayerPos): PlayerPos {
    // Simple wall collision resolution (same as in Enemy.moveToward)
    const walls = [
      { minX: -5, maxX: 5, minZ: -5, maxZ: -4.8 },
      { minX: -5, maxX: 5, minZ: 4.8, maxZ: 5 },
      { minX: -5, maxX: -4.8, minZ: -5, maxZ: 5 },
      { minX: 4.8, maxX: 5, minZ: -5, maxZ: 5 },
    ]
    for (const wall of walls) {
      if (
        pos.x + ENEMY.radius > wall.minX &&
        pos.x - ENEMY.radius < wall.maxX &&
        pos.z + ENEMY.radius > wall.minZ &&
        pos.z - ENEMY.radius < wall.maxZ
      ) {
        // Push out of wall
        const overlapXMin = (pos.x + ENEMY.radius) - wall.minX
        const overlapXMax = wall.maxX - (pos.x - ENEMY.radius)
        const overlapZMin = (pos.z + ENEMY.radius) - wall.minZ
        const overlapZMax = wall.maxZ - (pos.z - ENEMY.radius)

        const minOverlapX = Math.min(overlapXMin, overlapXMax)
        const minOverlapZ = Math.min(overlapZMin, overlapZMax)

        if (minOverlapX < minOverlapZ) {
          pos.x += overlapXMin < overlapXMax ? -overlapXMin : overlapXMax
        } else {
          pos.z += overlapZMin < overlapZMax ? -overlapZMin : overlapZMax
        }
      }
    }
    return pos
  }

  /**
   * Raycast hit handler — apply damage to specific enemy.
   */
  applyHit(obj: THREE.Object3D): Enemy | undefined {
    // Find the enemy whose mesh contains the hit object
    return this._enemies.find((e) => {
      if (!e.alive) return false
      // Check if the hit object is part of this enemy's mesh hierarchy
      let current: THREE.Object3D | null = obj
      while (current) {
        if (current === e.mesh) return true
        current = current.parent
      }
      return false
    })
  }

  /**
   * Reset all enemies to initial state.
   */
  reset(spawns: ReadonlyArray<{ position: [number, number, number] }>): void {
    // Dispose all existing enemies
    for (const enemy of this._enemies) {
      enemy.dispose()
    }
    this._enemies = []

    // Recreate all enemies from spawn positions
    for (const spawn of spawns) {
      this.addEnemy(spawn.position)
    }
  }

  /**
   * Dispose all enemy resources.
   */
  dispose(): void {
    for (const enemy of this._enemies) {
      enemy.dispose()
    }
    this._enemies = []
  }
}
