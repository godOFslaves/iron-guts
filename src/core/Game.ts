import * as THREE from 'three'
import { InputManager } from './Input.js'
import { resolveCollisions, clampDelta, PlayerPos } from './Physics.js'
import { AudioSystem } from './Audio.js'
import { AmmoSystem } from '../weapons/AmmoSystem.js'
import { Pistol } from '../weapons/Pistol.js'
import { Target, TargetConfig } from '../entities/Target.js'
import { HUD } from '../ui/HUD.js'
import { ROOM, PLAYER, INPUT, WALLS, WEAPON, TARGETS } from '../config/game.js'

export class Game {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private input: InputManager
  private audio: AudioSystem
  private pistol: Pistol
  private ammoSystem: AmmoSystem
  private targets: Target[] = []
  private hud: HUD
  private raycaster = new THREE.Raycaster()

  private playerPos: PlayerPos = { x: 0, z: 0 }
  private yaw = 0
  private pitch = 0
  private hintEl: HTMLElement | null = null
  private started = false
  private hitCount = 0

  constructor(canvas: HTMLCanvasElement) {
    this.input = new InputManager(canvas)
    this.audio = new AudioSystem()

    this.ammoSystem = new AmmoSystem(
      WEAPON.magSize,
      WEAPON.reloadTime,
      WEAPON.fireDelay
    )
    this.pistol = new Pistol(this.ammoSystem, WEAPON.flashDuration)

    this.hud = new HUD()

    this.input.setOnLockChange((locked) => {
      if (locked && !this.started) {
        this.started = true
        this.hideHint()
        this.audio.enable()
      }
    })

    this.input.setOnFire(() => {
      this.shoot()
    })

    this.input.setOnReload(() => {
      this.reload()
    })

    // Hint click handler
    this.hintEl = document.getElementById('hint')!
    this.hintEl.addEventListener('click', () => {
      if (!this.started) {
        this.started = true
        this.hideHint()
        canvas.requestPointerLock()
      }
    })

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x333333)
    this.scene.fog = new THREE.Fog(0x333333, 8, 18)

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    this.camera.position.set(0, PLAYER.eyeHeight, 0)

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambient)

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.4)
    dirLight.position.set(3, 5, 3)
    this.scene.add(dirLight)

    // Room
    this.buildRoom()

    // Targets
    this.buildTargets()

    // Weapon group attached to camera
    this.camera.add(this.pistol.group)

    // Resize
    window.addEventListener('resize', () => this.onResize())

    // Start loop
    this.lastTime = performance.now()
    this.loop()
  }

  private lastTime = 0

  private buildRoom(): void {
    const halfW = ROOM.width / 2
    const halfD = ROOM.depth / 2
    const h = ROOM.height

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 })
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 1 })
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 1 })

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
      floorMat
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = 0
    this.scene.add(floor)

    // Ceiling
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
      ceilMat
    )
    ceil.rotation.x = Math.PI / 2
    ceil.position.y = h
    this.scene.add(ceil)

    // Walls
    const wallThickness = 0.2

    // North wall
    const north = new THREE.Mesh(
      new THREE.BoxGeometry(ROOM.width, h, wallThickness),
      wallMat
    )
    north.position.set(0, h / 2, -halfD)
    this.scene.add(north)

    // South wall
    const south = new THREE.Mesh(
      new THREE.BoxGeometry(ROOM.width, h, wallThickness),
      wallMat
    )
    south.position.set(0, h / 2, halfD)
    this.scene.add(south)

    // West wall
    const west = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, h, ROOM.depth),
      wallMat
    )
    west.position.set(-halfW, h / 2, 0)
    this.scene.add(west)

    // East wall
    const east = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, h, ROOM.depth),
      wallMat
    )
    east.position.set(halfW, h / 2, 0)
    this.scene.add(east)
  }

  private buildTargets(): void {
    for (const cfg of TARGETS) {
      const target = new Target(cfg as TargetConfig, this.scene)
      this.targets.push(target)
    }
  }

  private hideHint(): void {
    if (this.hintEl) {
      this.hintEl.style.display = 'none'
    }
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  private shoot(): void {
    if (!this.ammoSystem.canFire) return

    this.pistol.fire()
    this.audio.playShoot()

    // Hitscan raycast from camera center
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera)

    // Collect all target meshes
    const targetMeshes = this.targets
      .filter((t) => t.alive)
      .map((t) => t.mesh)

    const intersects = this.raycaster.intersectObjects(targetMeshes)

    if (intersects.length > 0) {
      const hitTarget = this.targets.find(
        (t) => t.alive && t.mesh === intersects[0].object
      )
      if (hitTarget) {
        const destroyed = hitTarget.hit()
        this.audio.playHit()
        this.hud.showHitFlash()
        this.hitCount++
        this.hud.updateHitCounter(this.hitCount)
        if (destroyed) {
          // Target destroyed
        }
      }
    }
  }

  private reload(): void {
    if (this.ammoSystem.isReloading || this.ammoSystem.ammo === WEAPON.magSize) return
    this.ammoSystem.reload()
    this.audio.playReload()
  }

  private update(dt: number): void {
    const clampedDt = clampDelta(dt, INPUT.maxDelta)

    // Only process input when pointer is locked
    if (!this.input.locked) {
      return
    }

    // Mouse look (with recoil)
    const { x: mx, y: my } = this.input.mouseDelta
    this.yaw -= mx * INPUT.mouseSensitivity
    let pitchDelta = my * INPUT.mouseSensitivity
    pitchDelta = this.pistol.applyRecoilToCamera(pitchDelta)
    this.pitch -= pitchDelta
    this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.pitch))
    this.input.resetMouseDelta()

    // Camera rotation
    this.camera.rotation.order = 'YXZ'
    this.camera.rotation.y = this.yaw
    this.camera.rotation.x = this.pitch

    // Movement
    const keys = this.input.keysDown
    const speed = PLAYER.moveSpeed * clampedDt
    let dx = 0
    let dz = 0

    if (keys['KeyW'] || keys['ArrowUp']) dz -= speed
    if (keys['KeyS'] || keys['ArrowDown']) dz += speed
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= speed
    if (keys['KeyD'] || keys['ArrowRight']) dx += speed

    // Normalize diagonal
    const mag = Math.sqrt(dx * dx + dz * dz)
    if (mag > speed) {
      dx = (dx / mag) * speed
      dz = (dz / mag) * speed
    }

    // Apply rotation to movement (WASD relative to camera yaw)
    const cos = Math.cos(this.yaw)
    const sin = Math.sin(this.yaw)
    const worldDx = dx * cos + dz * sin
    const worldDz = -dx * sin + dz * cos

    // Move
    const newPos: PlayerPos = {
      x: this.playerPos.x + worldDx,
      z: this.playerPos.z + worldDz,
    }

    // Collide
    const resolved = resolveCollisions(newPos, PLAYER.radius, WALLS)
    this.playerPos = resolved

    // Update camera position
    this.camera.position.x = this.playerPos.x
    this.camera.position.z = this.playerPos.z

    // Weapon updates
    this.ammoSystem.update(dt)
    this.pistol.update(dt)

    // Target updates
    for (const target of this.targets) {
      target.update(dt)
    }

    // Update HUD
    if (this.ammoSystem.isReloading) {
      this.hud.updateReload(this.ammoSystem.reloadProgress)
    } else if (this.ammoSystem.ammo === 0) {
      this.hud.showEmpty()
    } else {
      this.hud.updateAmmo(this.ammoSystem.ammo, WEAPON.magSize)
    }
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  private loop(): void {
    const now = performance.now()
    const dt = (now - this.lastTime) / 1000
    this.lastTime = now

    this.update(dt)
    this.render()

    requestAnimationFrame(() => this.loop())
  }
}
