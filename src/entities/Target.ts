import * as THREE from 'three'

export interface TargetConfig {
  position: [number, number, number]
  size: number
  hitsToDestroy: number
  color: number
}

export class Target {
  _mesh: THREE.Mesh
  _hits: number
  _alive = true
  _flashTimer = 0
  _originalColor: THREE.Color
  _originalHits: number

  constructor(config: TargetConfig, scene: THREE.Scene) {
    const geometry = new THREE.CylinderGeometry(config.size, config.size, config.size * 0.3, 16)
    const material = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: 0.7,
      metalness: 0.2,
    })

    this._mesh = new THREE.Mesh(geometry, material)
    this._mesh.position.set(...config.position)
    this._mesh.rotation.x = Math.PI / 2
    this._originalColor = new THREE.Color(config.color)
    this._originalHits = config.hitsToDestroy
    this._hits = config.hitsToDestroy

    scene.add(this._mesh)
  }

  get mesh(): THREE.Mesh {
    return this._mesh
  }

  get alive(): boolean {
    return this._alive
  }

  get hits(): number {
    return this._hits
  }

  get flashTimer(): number {
    return this._flashTimer
  }

  hit(): boolean {
    if (!this._alive) return false
    this._hits--
    this._flashTimer = 0.15
    const mat = this._mesh.material as THREE.MeshStandardMaterial
    mat.color.set(0xffffff)

    if (this._hits <= 0) {
      this.destroy()
      return true
    }
    return false
  }

  update(dt: number): void {
    if (this._flashTimer > 0) {
      this._flashTimer -= dt
      if (this._flashTimer <= 0) {
        const mat = this._mesh.material as THREE.MeshStandardMaterial
        mat.color.copy(this._originalColor)
      }
    }
  }

  destroy(): void {
    this._alive = false
    this._mesh.visible = false
  }

  dispose(): void {
    this._mesh.geometry.dispose()
    const mat = this._mesh.material as THREE.MeshStandardMaterial
    mat.dispose()
  }
}
