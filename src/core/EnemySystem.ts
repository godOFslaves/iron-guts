import * as THREE from 'three'
import { Enemy } from '../entities/Enemy.js'
import { PlayerHealth } from '../entities/PlayerHealth.js'
import { PlayerPos } from '../core/Physics.js'
import { ENEMY } from '../config/game.js'

export class EnemySystem {
  private _enemies: Enemy[] = []

  constructor(private readonly scene: THREE.Scene) {}

  addEnemy(position: [number, number, number]): void {
    const enemy = new Enemy(position, this.scene)
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
    for (const enemy of this._enemies) {
      enemy.update(dt, playerPos)

      // Check if enemy can attack
      if (enemy.tryAttack() && enemy.isInAttackRange(playerPos)) {
        playerHealth.takeDamage(ENEMY.damage)
      }
    }

    return 0
  }

  /**
   * Raycast hit handler — apply damage to specific enemy.
   */
  applyHit(mesh: THREE.Object3D): Enemy | undefined {
    return this._enemies.find((e) => e.alive && e.mesh === mesh)
  }

  /**
   * Reset all enemies to initial state. Dead enemies are disposed.
   */
  reset(): void {
    for (const enemy of this._enemies) {
      if (!enemy.alive) {
        enemy.dispose()
      } else {
        enemy._health = ENEMY.health
        enemy._state = 'idle'
        enemy._alive = true
        enemy._attackTimer = 0
        enemy._hitFlashTimer = 0
        enemy._mesh.visible = true
      }
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
