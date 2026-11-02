import * as THREE from 'three'
import { AmmoSystem } from './AmmoSystem.js'

export class Pistol {
  private _group: THREE.Group
  private _flashLight: THREE.PointLight
  private _flashMesh: THREE.Mesh
  private _flashTimer = 0
  private _recoilPitch = 0

  constructor(
    private readonly ammoSystem: AmmoSystem,
    private readonly flashDuration: number
  ) {
    this._group = new THREE.Group()

    // Gun body — simple box geometry
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.5,
      metalness: 0.8,
    })
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.35), bodyMat)
    body.position.set(0.22, -0.18, -0.4)
    this._group.add(body)

    // Barrel
    const barrelMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.3,
      metalness: 0.9,
    })
    const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.25), barrelMat)
    barrel.position.set(0.22, -0.15, -0.6)
    this._group.add(barrel)

    // Muzzle flash — bright yellow/orange plane facing forward
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    })
    this._flashMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.15), flashMat)
    this._flashMesh.position.set(0.22, -0.15, -0.75)
    this._group.add(this._flashMesh)

    // Point light for muzzle flash
    this._flashLight = new THREE.PointLight(0xffaa00, 0, 5)
    this._flashLight.position.set(0.22, -0.15, -0.75)
    this._group.add(this._flashLight)

    // Position gun in bottom-right of camera view
    this._group.position.set(0.22, -0.18, -0.4)
  }

  get group(): THREE.Group {
    return this._group
  }

  get recoilPitch(): number {
    return this._recoilPitch
  }

  set recoilPitch(value: number) {
    this._recoilPitch = value
  }

  fire(): void {
    if (!this.ammoSystem.canFire) return
    this.ammoSystem.fire()

    // Muzzle flash
    this._flashTimer = this.flashDuration
    this._flashLight.intensity = 3

    // Recoil — kick camera up slightly
    this._recoilPitch = 0.02
  }

  update(dt: number): void {
    // Flash fade
    if (this._flashTimer > 0) {
      this._flashTimer -= dt
      const flashMat = this._flashMesh.material as THREE.MeshBasicMaterial
      flashMat.opacity = Math.max(0, this._flashTimer / this.flashDuration)
      this._flashLight.intensity = 3 * (this._flashTimer / this.flashDuration)
    } else {
      const flashMat = this._flashMesh.material as THREE.MeshBasicMaterial
      flashMat.opacity = 0
      this._flashLight.intensity = 0
    }
  }

  reset(): void {
    this._flashTimer = 0
    this._recoilPitch = 0
    const flashMat = this._flashMesh.material as THREE.MeshBasicMaterial
    flashMat.opacity = 0
    this._flashLight.intensity = 0
  }
}
