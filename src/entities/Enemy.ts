import * as THREE from 'three'
import { resolveCollisions, PlayerPos } from '../core/Physics.js'
import { WALLS, ENEMY } from '../config/game.js'

const PLAYER_RADIUS = 0.4

export type EnemyState = 'idle' | 'chase' | 'attack' | 'dead'

export type AttackPhase = 'none' | 'windup' | 'strike' | 'cooldown'

export interface EnemyAudioCallbacks {
  onDetect?: () => void
  onWindup?: () => void
  onStrike?: () => void
  onDeath?: () => void
}

export class Enemy {
  private _mesh: THREE.Group
  private _state: EnemyState = 'idle'
  private _health: number
  private _maxHealth: number
  private _attackTimer = 0
  private _hitFlashTimer = 0
  private _pos: PlayerPos = { x: 0, z: 0 }
  private _yaw = 0
  private _alive = true
  private _attackPhase: AttackPhase = 'none'
  private _attackPhaseTimer = 0
  private _isDetected = false
  private _hasLOS = false
  private _deathScaleTimer = 0
  private _audio: EnemyAudioCallbacks
  private _warningRing: THREE.Mesh | null = null

  constructor(
    position: [number, number, number],
    scene: THREE.Scene,
    audio: EnemyAudioCallbacks = {}
  ) {
    this._audio = audio
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

    // Warning ring — yellow torus around enemy base (hidden by default)
    const ringGeo = new THREE.RingGeometry(0.5, 0.65, 24)
    const ringMat = new THREE.MeshBasicMaterial({
      color: ENEMY.warningRingColor,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    })
    this._warningRing = new THREE.Mesh(ringGeo, ringMat)
    this._warningRing.rotation.x = -Math.PI / 2
    this._warningRing.position.y = 0.01
    this._mesh.add(this._warningRing)

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

  get attackPhase(): AttackPhase {
    return this._attackPhase
  }

  get isDetected(): boolean {
    return this._isDetected
  }

  get hasLOS(): boolean {
    return this._hasLOS
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
   * Die — mark as dead and start death animation.
   */
  die(): void {
    this._alive = false
    this._state = 'dead'
    this._attackPhase = 'none'
    this._attackPhaseTimer = 0
    this._deathScaleTimer = 0
    this._mesh.visible = true
    this._warningRing?.remove()
    if (this._audio.onDeath) this._audio.onDeath()
  }

  /**
   * Try to attack. Returns true if attack was performed.
   */
  tryAttack(): boolean {
    if (!this._alive || this._state !== 'attack') return false
    if (this._attackTimer > 0) return false
    if (this._attackPhase !== 'none') return false

    // Start windup phase
    this._attackPhase = 'windup'
    this._attackPhaseTimer = ENEMY.attackWindupTime
    if (this._audio.onWindup) this._audio.onWindup()
    return true
  }

  /**
   * Check line of sight to player using AABB intersection.
   */
  hasLineOfSight(
    playerPos: PlayerPos,
    wallMeshes: THREE.Mesh[]
  ): boolean {
    const start = new THREE.Vector3(this._pos.x, 1.0, this._pos.z)
    const end = new THREE.Vector3(playerPos.x, 1.0, playerPos.z)

    for (const wall of wallMeshes) {
      wall.updateMatrixWorld(true)
      const box = this._getWorldBoundingBox(wall)
      if (box && this._lineIntersectsBox(start, end, box)) {
        return false // LOS blocked
      }
    }
    return true
  }

  /**
   * Compute world-space bounding box from mesh geometry vertices.
   * Uses manual position offset to avoid Three.js matrix issues in tests.
   */
  private _getWorldBoundingBox(mesh: THREE.Mesh): THREE.Box3 | null {
    const geo = mesh.geometry
    const posAttr = geo.getAttribute('position')
    if (!posAttr || posAttr.count === 0) return null

    const wx = mesh.position.x
    const wy = mesh.position.y
    const wz = mesh.position.z

    const box = new THREE.Box3()
    box.makeEmpty()
    const v = new THREE.Vector3()
    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i)
      v.x += wx
      v.y += wy
      v.z += wz
      box.expandByPoint(v)
    }
    return box
  }

  /**
   * Check if a line segment intersects an AABB box.
   * Uses the slab method with proper handling of zero direction components.
   * Also works with plain objects {min: {x,y,z}, max: {x,y,z}}.
   */
  private _lineIntersectsBox(
    start: THREE.Vector3,
    end: THREE.Vector3,
    box: THREE.Box3
  ): boolean {
    const dir = end.clone().sub(start)
    let invDirX = 1.0 / dir.x
    let invDirY = 1.0 / dir.y
    let invDirZ = 1.0 / dir.z

    // Handle zero direction components (ray parallel to axis)
    // Use positive large value so slab checks are skipped
    if (!isFinite(invDirX)) invDirX = 1e10
    if (!isFinite(invDirY)) invDirY = 1e10
    if (!isFinite(invDirZ)) invDirZ = 1e10

    let tmin = (box.min.x - start.x) * invDirX
    let tmax = (box.max.x - start.x) * invDirX
    if (tmin > tmax) { const tmp = tmin; tmin = tmax; tmax = tmp }

    tmin = Math.max(tmin, (box.min.y - start.y) * invDirY)
    tmax = Math.min(tmax, (box.max.y - start.y) * invDirY)
    if (tmin > tmax) return false

    tmin = Math.max(tmin, (box.min.z - start.z) * invDirZ)
    tmax = Math.min(tmax, (box.max.z - start.z) * invDirZ)
    if (tmin > tmax) return false

    return tmax >= 0
  }

  /**
   * Static helper: check if a line segment intersects an AABB.
   * Accepts plain AABB objects for easy testing.
   */
  static lineIntersectsBox(
    start: [number, number, number],
    end: [number, number, number],
    aabb: { min: [number, number, number], max: [number, number, number] }
  ): boolean {
    const dir = [end[0] - start[0], end[1] - start[1], end[2] - start[2]]
    let invDirX = 1.0 / dir[0]
    let invDirY = 1.0 / dir[1]
    let invDirZ = 1.0 / dir[2]

    if (!isFinite(invDirX)) invDirX = 1e10
    if (!isFinite(invDirY)) invDirY = 1e10
    if (!isFinite(invDirZ)) invDirZ = 1e10

    let tmin = (aabb.min[0] - start[0]) * invDirX
    let tmax = (aabb.max[0] - start[0]) * invDirX
    if (tmin > tmax) { const tmp = tmin; tmin = tmax; tmax = tmp }

    tmin = Math.max(tmin, (aabb.min[1] - start[1]) * invDirY)
    tmax = Math.min(tmax, (aabb.max[1] - start[1]) * invDirY)
    if (tmin > tmax) return false

    tmin = Math.max(tmin, (aabb.min[2] - start[2]) * invDirZ)
    tmax = Math.min(tmax, (aabb.max[2] - start[2]) * invDirZ)
    if (tmin > tmax) return false

    return tmax >= 0
  }

  /**
   * Apply hit visual feedback — flash and recoil.
   */
  applyHitVisual(): void {
    this._mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial
        if (mat.color) {
          mat.color.setHex(0xffffff)
        }
      }
    })
  }

  /**
   * Reset materials to original colors.
   */
  resetColors(): void {
    const originalColors = [0x882222, 0xaa3333, 0xffffff, 0xffffff, 0x551111, 0x551111, 0x772222, 0x772222]
    let idx = 0
    this._mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial
        if (mat.color) {
          mat.color.setHex(originalColors[idx] ?? 0x882222)
        }
        idx++
      }
    })
  }

  /**
   * Update state machine and animations.
   */
  update(
    dt: number,
    playerPos: PlayerPos,
    wallMeshes: THREE.Mesh[] = []
  ): void {
    if (!this._alive) {
      // Death animation — scale down
      if (this._deathScaleTimer === 0) {
        this._deathScaleTimer = 2.0
      }
      this._deathScaleTimer -= dt
      const t = Math.max(0, this._deathScaleTimer / 2.0)
      this._mesh.scale.setScalar(t)
      this._mesh.position.y = -0.5 * (1 - t)
      return
    }

    // Hit flash decay
    if (this._hitFlashTimer > 0) {
      this._hitFlashTimer -= dt
      if (this._hitFlashTimer <= 0) {
        this._hitFlashTimer = 0
        this.resetColors()
      }
    }

    // Attack phase timer
    if (this._attackPhaseTimer > 0) {
      this._attackPhaseTimer -= dt

      if (this._attackPhase === 'windup' && this._attackPhaseTimer <= 0) {
        this._attackPhase = 'strike'
        this._attackPhaseTimer = 0.2
        if (this._audio.onStrike) this._audio.onStrike()
      } else if (this._attackPhase === 'strike' && this._attackPhaseTimer <= 0) {
        this._attackPhase = 'cooldown'
        this._attackPhaseTimer = ENEMY.attackCooldownTime
      } else if (this._attackPhase === 'cooldown' && this._attackPhaseTimer <= 0) {
        this._attackPhase = 'none'
        this._attackTimer = 0
      }
    }

    // Attack cooldown
    if (this._attackTimer > 0) {
      this._attackTimer -= dt
    }

    // State machine
    if (this.isInDetectionRange(playerPos)) {
      // Check line of sight
      const losAvailable = wallMeshes.length > 0
      const hasLOS = losAvailable ? this.hasLineOfSight(playerPos, wallMeshes) : true

      // Track LOS state
      if (hasLOS && !this._hasLOS) {
        // Just gained LOS — trigger detect callback
        this._hasLOS = true
        this._isDetected = true
        if (this._audio.onDetect) this._audio.onDetect()
      } else if (hasLOS) {
        this._hasLOS = true
        this._isDetected = true
      } else {
        this._hasLOS = false
        // LOS lost — cancel attack if in windup
        if (this._attackPhase === 'windup') {
          this._attackPhase = 'none'
          this._attackPhaseTimer = 0
        }
      }

      this.faceToward(playerPos.x, playerPos.z)

      // Show warning ring ONLY when has LOS and in attack range
      if (this.isInAttackRange(playerPos) && this._hasLOS) {
        this._state = 'attack'
        if (this._warningRing) {
          const mat = this._warningRing.material as THREE.MeshBasicMaterial
          mat.opacity = 0.5 + 0.3 * Math.sin(performance.now() * 0.008)
        }
      } else {
        this._state = 'chase'
        if (this._warningRing) {
          const mat = this._warningRing.material as THREE.MeshBasicMaterial
          mat.opacity = 0
        }
        const newPos = this.moveToward(playerPos.x, playerPos.z, ENEMY.moveSpeed, dt, playerPos)
        this._pos = newPos
        this._mesh.position.x = newPos.x
        this._mesh.position.z = newPos.z
      }
    } else {
      this._isDetected = false
      this._hasLOS = false
      this._state = 'idle'
      if (this._warningRing) {
        const mat = this._warningRing.material as THREE.MeshBasicMaterial
        mat.opacity = 0
      }
    }

    // Windup visual — lean forward
    if (this._attackPhase === 'windup') {
      this._mesh.rotation.z = -0.2
    } else if (this._attackPhase === 'strike') {
      this._mesh.rotation.z = 0.3
    } else {
      this._mesh.rotation.z *= 0.9
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
    if (typeof this._mesh.dispose === 'function') {
      this._mesh.dispose()
    }
  }
}
