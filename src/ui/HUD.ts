export class HUD {
  private ammoEl: HTMLElement
  private crosshairEl: HTMLElement
  private hitFlashEl: HTMLElement
  private reloadBarEl: HTMLElement
  private emptyAmmoEl: HTMLElement
  private healthFillEl: HTMLElement
  private healthTextEl: HTMLElement
  private enemyCounterEl: HTMLElement
  private damageFlashEl: HTMLElement
  private deathScreenEl: HTMLElement
  private victoryScreenEl: HTMLElement
  private warningEl: HTMLElement

  constructor() {
    this.createOverlay()
    this.ammoEl = document.getElementById('hud-ammo')!
    this.crosshairEl = document.getElementById('hud-crosshair')!
    this.hitFlashEl = document.getElementById('hud-hit-flash')!
    this.reloadBarEl = document.getElementById('hud-reload-bar')!
    this.emptyAmmoEl = document.getElementById('hud-empty-ammo')!
    this.healthFillEl = document.getElementById('hud-health-fill')!
    this.healthTextEl = document.getElementById('hud-health-text')!
    this.enemyCounterEl = document.getElementById('hud-enemy-counter')!
    this.damageFlashEl = document.getElementById('hud-damage-flash')!
    this.deathScreenEl = document.getElementById('hud-death-screen')!
    this.victoryScreenEl = document.getElementById('hud-victory-screen')!
    this.warningEl = document.getElementById('hud-enemy-warning')!
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
      <div id="hud-empty-ammo">— EMPTY —</div>
      <div id="hud-health-bar">
        <div id="hud-health-fill"></div>
      </div>
      <div id="hud-health-text">HP: 100</div>
      <div id="hud-enemy-counter">Enemies: <span id="hud-enemy-count">3</span></div>
      <div id="hud-hit-flash"></div>
      <div id="hud-damage-flash"></div>
      <div id="hud-reload-bar"><div id="hud-reload-fill"></div></div>
      <div id="hud-enemy-warning">⚠ ENEMY IN RANGE</div>
      <div id="hud-death-screen">
        <h2>YOU DIED</h2>
        <p>Press <kbd>R</kbd> or <kbd>Enter</kbd> to restart</p>
      </div>
      <div id="hud-victory-screen">
        <h2>VICTORY</h2>
        <p>All enemies eliminated</p>
        <p>Press <kbd>R</kbd> or <kbd>Enter</kbd> to play again</p>
      </div>
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
    const el = document.getElementById('hud-hit-counter')
    if (el) {
      el.textContent = `Hits: ${hits}`
    }
  }

  showCrosshair(show: boolean): void {
    this.crosshairEl.style.display = show ? '' : 'none'
  }

  updateHealth(current: number, maxHealth: number): void {
    const pct = Math.max(0, (current / maxHealth) * 100)
    this.healthFillEl.style.width = `${pct}%`
    this.healthTextEl.textContent = `HP: ${current}`

    // Color based on health
    if (pct > 60) {
      this.healthFillEl.style.background = '#44ff44'
    } else if (pct > 30) {
      this.healthFillEl.style.background = '#ffaa00'
    } else {
      this.healthFillEl.style.background = '#ff4444'
    }
  }

  showDamageFlash(): void {
    this.damageFlashEl.style.opacity = '1'
    setTimeout(() => {
      this.damageFlashEl.style.opacity = '0'
    }, 200)
  }

  updateEnemyCounter(alive: number, total: number): void {
    this.enemyCounterEl.style.display = ''
    document.getElementById('hud-enemy-count')!.textContent = `${alive}/${total}`
  }

  showDeathScreen(): void {
    this.deathScreenEl.style.display = 'flex'
  }

  hideDeathScreen(): void {
    this.deathScreenEl.style.display = 'none'
  }

  showVictoryScreen(): void {
    this.victoryScreenEl.style.display = 'flex'
  }

  hideVictoryScreen(): void {
    this.victoryScreenEl.style.display = 'none'
  }

  showWarning(show: boolean): void {
    this.warningEl.style.display = show ? '' : 'none'
  }
}
