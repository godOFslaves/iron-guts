export type Keys = Record<string, boolean>

export class InputManager {
  private keys: Keys = {}
  private mouseDeltaX = 0
  private mouseDeltaY = 0
  private _locked = false
  private _onLockChange?: (locked: boolean) => void

  constructor(private canvas: HTMLCanvasElement) {
    this.setupKeyboard()
    this.setupMouse()
    this.setupPointerLock()
  }

  get keysDown(): Keys {
    return this.keys
  }

  get locked(): boolean {
    return this._locked
  }

  get mouseDelta(): { x: number; y: number } {
    return { x: this.mouseDeltaX, y: this.mouseDeltaY }
  }

  setOnLockChange(fn: (locked: boolean) => void): void {
    this._onLockChange = fn
  }

  resetMouseDelta(): void {
    this.mouseDeltaX = 0
    this.mouseDeltaY = 0
  }

  private setupKeyboard(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      this.keys[e.code] = true
    })
    window.addEventListener('keyup', (e: KeyboardEvent) => {
      this.keys[e.code] = false
    })
  }

  private setupMouse(): void {
    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      if (this._locked) {
        this.mouseDeltaX += e.movementX
        this.mouseDeltaY += e.movementY
      }
    })
  }

  private setupPointerLock(): void {
    this.canvas.addEventListener('click', () => {
      if (!this._locked) {
        this.canvas.requestPointerLock()
      }
    })

    document.addEventListener('pointerlockchange', () => {
      this._locked = document.pointerLockElement === this.canvas
      if (this._onLockChange) {
        this._onLockChange(this._locked)
      }
    })
  }
}
