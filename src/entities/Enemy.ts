import * as THREE from 'three'
import { resolveCollisions, PlayerPos } from '../core/Physics.js'
import { WALLS, ENEMY } from '../config/game.js'

const PLAYER_RADIUS = 0.4

export type EnemyState = 'idle' | 'chase' | 'attack' | 'dead'

export class Enemy {
  _mesh: THREE.Group
  _state: EnemyState = 'idle'
  _health: number
  _maxHealth: number
  _attackTimer = 0
  _hitFlashTimer = 0
  _pos: PlayerPos = { x: 0, z: 0 }
  _yaw = 0
  _alive = true

  constructor(
    position: [number, number, number],
    scene: THREE.Scene
  ) {
    this._health = ENEMY.health
    this._maxHealth = ENEMY.health
    this._pos = { x: position[0], z: position[2] }

    // Build enemy model from primitives
    this._mesh = new THREE.Group()

    // Body — dark red box
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x882222,
      roughness: 0.8,
      metalness: 0.1,
    })
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.3), bodyMat)
    body.position.y = 0.8
    this._mesh.add(body)

    // Head — sphere
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xaa3333,
      roughness: 0.7,
      metalness: 0.1,
    })
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), headMat)
    head.position.y = 1.45
    this._mesh.add(head)

    // Eyes — small white spheres
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat)
    leftEye.position.set(-0.08, 1.5, 0.17)
    this._mesh.add(leftEye)
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat)
    rightEye.position.set(0.08, 1.5, 0.17)
    this._mesh.add(rightEye)

    // Legs — two small boxes
    const legMat = new THREE.MeshStandardMaterial({ color: 0x551111, roughness: 0.9 })
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), legMat)
    leftLeg.position.set(-0.12, 0.25, 0)
    this._mesh.add(leftLeg)
    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), legMat)
    rightLeg.position.set(0.12, 0.25, 0)
    this._mesh.add(rightLeg)

    // Arms — two boxes
    const armMat = new THREE.MeshStandardMaterial({ color: 0x772222, roughness: 0.8 })
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), armMat)
    leftArm.position.set(-0.35, 0.8, 0)
    this._mesh.add(leftArm)
    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), armMat)
    rightArm.position.set(0.35, 0.8, 0)
    this._mesh.add(rightArm)

    this._mesh.position.set(position[0], 0, position[2])
    scene.add(this._mesh)
  }

  get mesh(): THREE.Group {
    return this._mesh
  }

  get state(): EnemyState {
    return this._state
  }

  get alive(): boolean {
    return this._alive
  }

  get health(): number {
    return this._health
  }

  get maxHealth(): number {
    return this._maxHealth
  }

  get hitFlashTimer(): number {
    return this._hitFlashTimer
  }

  get attackTimer(): number {
    return this._attackTimer
  }

  get pos(): PlayerPos {
    return this._pos
  }

  get yaw(): number {
    return this._yaw
  }

  setPos(pos: PlayerPos): void {
    this._pos = pos
    this._mesh.position.x = pos.x
    this._mesh.position.z = pos.z
  }

  /**
   * Check if player is within detection range.
   */
  isInDetectionRange(playerPos: PlayerPos): boolean {
    const dx = playerPos.x - this._pos.x
    const dz = playerPos.z - this._pos.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    return dist <= ENEMY.detectionRadius
  }

  /**
   * Check if player is within attack range.
   */
  isInAttackRange(playerPos: PlayerPos): boolean {
    const dx = playerPos.x - this._pos.x
    const dz = playerPos.z - this._pos.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    return dist <= ENEMY.attackRange
  }

  /**
   * Face toward target position.
   */
  faceToward(targetX: number, targetZ: number): void {
    const dx = targetX - this._pos.x
    const dz = targetZ - this._pos.z
    this._yaw = Math.atan2(dx, dz)
    this._mesh.rotation.y = this._yaw
  }

  /**
   * Move toward target with collision resolution.
   */
  moveToward(
    targetX: number,
    targetZ: number,
    speed: number,
    dt: number,
    playerPos: PlayerPos
  ): PlayerPos {
    const dx = targetX - this._pos.x
    const dz = targetZ - this._pos.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist < 0.01) return this._pos

    const moveDist = speed * dt
    const moveX = (dx / dist) * moveDist
    const moveZ = (dz / dist) * moveDist

    const newPos: PlayerPos = {
      x: this._pos.x + moveX,
      z: this._pos.z + moveZ,
    }

    // Resolve collisions with walls
    const resolved = resolveCollisions(newPos, ENEMY.radius, WALLS)

    // Resolve collision with player (player is an obstacle)
    return this.resolvePlayerCollision(resolved, playerPos)
  }

  /**
   * Resolve collision with the player as an obstacle.
   */
  resolvePlayerCollision(pos: PlayerPos, playerPos: PlayerPos): PlayerPos {
    const dx = pos.x - playerPos.x
    const dz = pos.z - playerPos.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    const minDist = ENEMY.radius + PLAYER_RADIUS

    if (dist < minDist && dist > 0.001) {
      // Push enemy away from player
      const pushX = (dx / dist) * (minDist - dist)
      const pushZ = (dz / dist) * (minDist - dist)
      return { x: pos.x + pushX, z: pos.z + pushZ }
    }
    return pos
  }

  /**
   * Take damage and return true if still alive.
   */
  takeDamage(amount: number): boolean {
    if (!this._alive) return false
    this._health -= amount
    this._hitFlashTimer = 0.15

    if (this._health <= 0) {
      this.die()
      return false
    }
    return true
  }

  /**
   * Die — mark as dead and hide mesh.
   */
  die(): void {
    this._alive = false
    this._state = 'dead'
    this._mesh.visible = false
  }

  /**
   * Try to attack. Returns true if attack was performed.
   */
  tryAttack(): boolean {
    if (!this._alive || this._state !== 'attack') return false
    if (this._attackTimer > 0) return false

    this._attackTimer = ENEMY.attackInterval
    return true
  }

  /**
   * Update state machine and animations.
   */
  update(dt: number, playerPos: PlayerPos): void {
    if (!this._alive) return

    // Hit flash decay
    if (this._hitFlashTimer > 0) {
      this._hitFlashTimer -= dt
      if (this._hitFlashTimer <= 0) {
        this._hitFlashTimer = 0
        // Reset materials to original color
        this._mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const mat = child.material as THREE.MeshStandardMaterial
            if (mat.color) {
              const idx = this._mesh.children.indexOf(child)
              mat.color.setHex([
                0x882222, // body
                0xaa3333, // head
                0xffffff, // left eye
                0xffffff, // right eye
                0x551111, // left leg
                0x551111, // right leg
                0x772222, // left arm
                0x772222, // right arm
              ][idx] ?? 0x882222)
            }
          }
        })
      }
    }

    // Attack cooldown
    if (this._attackTimer > 0) {
      this._attackTimer -= dt
    }

    // State machine
    if (this.isInDetectionRange(playerPos)) {
      this.faceToward(playerPos.x, playerPos.z)

      if (this.isInAttackRange(playerPos)) {
        this._state = 'attack'
      } else {
        this._state = 'chase'
        // Move toward player
        const newPos = this.moveToward(playerPos.x, playerPos.z, ENEMY.moveSpeed, dt, playerPos)
        this._pos = newPos
        this._mesh.position.x = newPos.x
        this._mesh.position.z = newPos.z
      }
    } else {
      this._state = 'idle'
    }
  }

  dispose(): void {
    this._mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        const mat = child.material as THREE.Material
        mat.dispose()
      }
    })
    this._mesh.dispose()
  }
}
