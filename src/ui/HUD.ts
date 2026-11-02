export class HUD {
  private ammoEl: HTMLElement
  private crosshairEl: HTMLElement
  private hitFlashEl: HTMLElement
  private reloadBarEl: HTMLElement
  private emptyAmmoEl: HTMLElement

  constructor() {
    this.createOverlay()
    this.ammoEl = document.getElementById('hud-ammo')!
    this.crosshairEl = document.getElementById('hud-crosshair')!
    this.hitFlashEl = document.getElementById('hud-hit-flash')!
    this.reloadBarEl = document.getElementById('hud-reload-bar')!
    this.emptyAmmoEl = document.getElementById('hud-empty-ammo')!
  }

  private createOverlay(): void {
    const div = document.createElement('div')
    div.id = 'hud'
    div.innerHTML = `
      <div id="hud-crosshair">
        <span class="ch-top"></span>
        <span class="ch-bottom"></span>
        <span class="ch-left"></span>
        <span class="ch-right"></span>
      </div>
      <div id="hud-ammo">
        <span id="hud-ammo-count">12</span> / <span id="hud-ammo-total">12</span>
      </div>
      <div id="hud-hit-counter">Hits: <span id="hud-hit-count">0</span></div>
      <div id="hud-hit-flash"></div>
      <div id="hud-reload-bar"><div id="hud-reload-fill"></div></div>
      <div id="hud-empty-ammo">— EMPTY —</div>
    `
    document.body.appendChild(div)
  }

  updateAmmo(current: number, magSize: number): void {
    this.ammoEl.style.display = ''
    this.emptyAmmoEl.style.display = 'none'
    document.getElementById('hud-ammo-count')!.textContent = String(current)
    document.getElementById('hud-ammo-total')!.textContent = String(magSize)
  }

  showEmpty(): void {
    this.ammoEl.style.display = 'none'
    this.emptyAmmoEl.style.display = ''
  }

  updateReload(progress: number): void {
    const fill = document.getElementById('hud-reload-fill')!
    if (progress > 0) {
      this.reloadBarEl.style.display = ''
      fill.style.width = `${progress * 100}%`
    } else {
      this.reloadBarEl.style.display = 'none'
    }
  }

  showHitFlash(): void {
    this.hitFlashEl.style.opacity = '1'
    setTimeout(() => {
      this.hitFlashEl.style.opacity = '0'
    }, 150)
  }

  updateHitCounter(hits: number): void {
    document.getElementById('hud-hit-count')!.textContent = String(hits)
  }

  showCrosshair(show: boolean): void {
    this.crosshairEl.style.display = show ? '' : 'none'
  }
}
