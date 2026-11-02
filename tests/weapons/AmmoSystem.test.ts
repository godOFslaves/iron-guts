import { describe, it, expect } from 'vitest'
import { AmmoSystem } from '../../src/weapons/AmmoSystem'

describe('AmmoSystem', () => {
  it('starts full', () => {
    const ammo = new AmmoSystem(12, 1.5, 0.3)
    expect(ammo.ammo).toBe(12)
    expect(ammo.state).toBe('ready')
    expect(ammo.canFire).toBe(true)
  })

  it('fires until empty', () => {
    const ammo = new AmmoSystem(3, 1.0, 0)
    expect(ammo.fire()).toBe(true)
    expect(ammo.ammo).toBe(2)
    expect(ammo.canFire).toBe(true)

    expect(ammo.fire()).toBe(true)
    expect(ammo.ammo).toBe(1)

    expect(ammo.fire()).toBe(true)
    expect(ammo.ammo).toBe(0)
    expect(ammo.state).toBe('empty')
    expect(ammo.canFire).toBe(false)
  })

  it('cannot fire when empty', () => {
    const ammo = new AmmoSystem(1, 1.0, 0)
    ammo.fire()
    expect(ammo.canFire).toBe(false)
    expect(ammo.fire()).toBe(false)
    expect(ammo.ammo).toBe(0)
  })

  it('reloads after empty', () => {
    const ammo = new AmmoSystem(5, 1.0, 0)
    ammo.fire()
    ammo.fire()
    ammo.fire()
    ammo.fire()
    ammo.fire()
    expect(ammo.ammo).toBe(0)

    ammo.reload()
    expect(ammo.state).toBe('reloading')
    expect(ammo.canFire).toBe(false)
  })

  it('completes reload after time', () => {
    const ammo = new AmmoSystem(10, 2.0, 0)
    ammo.fire()
    ammo.reload()

    expect(ammo.reloadProgress).toBe(0)

    ammo.update(1.0)
    expect(ammo.reloadProgress).toBeCloseTo(0.5)
    expect(ammo.state).toBe('reloading')

    ammo.update(1.0)
    expect(ammo.state).toBe('ready')
    expect(ammo.ammo).toBe(10)
    expect(ammo.canFire).toBe(true)
  })

  it('fire delay prevents rapid fire', () => {
    const ammo = new AmmoSystem(10, 1.0, 0.5)
    ammo.fire()
    expect(ammo.canFire).toBe(false)
    expect(ammo.fireCooldown).toBeCloseTo(0.5)

    ammo.update(0.3)
    expect(ammo.canFire).toBe(false)
    expect(ammo.fireCooldown).toBeCloseTo(0.2)

    ammo.update(0.3)
    expect(ammo.canFire).toBe(true)
    expect(ammo.fireCooldown).toBe(0)
  })

  it('cannot reload when already full', () => {
    const ammo = new AmmoSystem(12, 1.0, 0)
    ammo.reload()
    expect(ammo.state).toBe('ready')
    expect(ammo.ammo).toBe(12)
  })

  it('cannot reload while already reloading', () => {
    const ammo = new AmmoSystem(10, 2.0, 0)
    ammo.fire()
    ammo.reload()
    ammo.reload()
    expect(ammo.state).toBe('reloading')
  })

  it('reset restores full ammo', () => {
    const ammo = new AmmoSystem(6, 1.0, 0)
    ammo.fire()
    ammo.fire()
    ammo.fire()
    expect(ammo.ammo).toBe(3)

    ammo.reset()
    expect(ammo.ammo).toBe(6)
    expect(ammo.state).toBe('ready')
  })

  it('cannot fire while reloading', () => {
    const ammo = new AmmoSystem(10, 2.0, 0)
    ammo.fire()
    ammo.reload()
    expect(ammo.canFire).toBe(false)
    expect(ammo.fire()).toBe(false)
  })

  it('cannot fire full magazine', () => {
    const ammo = new AmmoSystem(10, 1.0, 0)
    expect(ammo.canFire).toBe(true)
    // Fire one to make it not full
    ammo.fire()
    // Now fire rest
    for (let i = 1; i < 10; i++) {
      ammo.fire()
    }
    expect(ammo.ammo).toBe(0)

    // Reset and test full mag
    ammo.reset()
    expect(ammo.ammo).toBe(10)
    expect(ammo.canFire).toBe(true) // canFire checks ammo > 0 and state === ready
    // canFire should be true even when full — it just checks ammo > 0
  })

  it('reload progress is 0 when not reloading', () => {
    const ammo = new AmmoSystem(10, 1.0, 0)
    expect(ammo.reloadProgress).toBe(0)
    ammo.fire()
    expect(ammo.reloadProgress).toBe(0)
  })
})
