import { describe, it, expect } from 'vitest'
import { resolveCollisions, clampDelta, aabbOverlap } from '../../src/core/Physics'

describe('clampDelta', () => {
  it('returns dt when within max', () => {
    expect(clampDelta(0.016, 0.05)).toBe(0.016)
  })

  it('caps dt at maxDelta', () => {
    expect(clampDelta(0.1, 0.05)).toBe(0.05)
  })

  it('handles zero dt', () => {
    expect(clampDelta(0, 0.05)).toBe(0)
  })
})

describe('aabbOverlap', () => {
  it('returns true for overlapping boxes', () => {
    expect(aabbOverlap(0, 0, 0.4, -1, 1, -1, 1)).toBe(true)
  })

  it('returns false for non-overlapping boxes', () => {
    expect(aabbOverlap(2, 2, 0.4, -0.5, 0.5, -0.5, 0.5)).toBe(false)
  })

  it('returns false for touching boxes (no overlap)', () => {
    expect(aabbOverlap(1, 0, 0.4, 1.4, 2, -0.5, 0.5)).toBe(false)
  })
})

describe('resolveCollisions', () => {
  const walls = [
    { minX: -5, maxX: -4.8, minZ: -5, maxZ: 5 },   // West
    { minX: 4.8, maxX: 5, minZ: -5, maxZ: 5 },     // East
    { minX: -5, maxX: 5, minZ: -5, maxZ: -4.8 },   // North
    { minX: -5, maxX: 5, minZ: 4.8, maxZ: 5 },     // South
  ]

  it('returns same position when no collision', () => {
    const result = resolveCollisions({ x: 0, z: 0 }, 0.4, walls)
    expect(result).toEqual({ x: 0, z: 0 })
  })

  it('pushes player out of west wall', () => {
    const result = resolveCollisions({ x: -4.5, z: 0 }, 0.4, walls)
    expect(result.x).toBeCloseTo(-4.4)
    expect(result.z).toBe(0)
  })

  it('pushes player out of east wall', () => {
    const result = resolveCollisions({ x: 4.5, z: 0 }, 0.4, walls)
    expect(result.x).toBeCloseTo(4.4)
    expect(result.z).toBe(0)
  })

  it('pushes player out of north wall', () => {
    const result = resolveCollisions({ x: 0, z: -4.5 }, 0.4, walls)
    expect(result.z).toBeCloseTo(-4.4)
    expect(result.x).toBe(0)
  })

  it('pushes player out of south wall', () => {
    const result = resolveCollisions({ x: 0, z: 4.5 }, 0.4, walls)
    expect(result.z).toBeCloseTo(4.4)
    expect(result.x).toBe(0)
  })

  it('handles corner collision', () => {
    const result = resolveCollisions({ x: 4.5, z: 4.5 }, 0.4, walls)
    expect(result.x).toBeCloseTo(4.4)
    expect(result.z).toBeCloseTo(4.4)
  })

  it('allows movement in open space', () => {
    const result = resolveCollisions({ x: 3, z: 3 }, 0.4, walls)
    expect(result).toEqual({ x: 3, z: 3 })
  })

  it('slides along wall at corner', () => {
    const result = resolveCollisions({ x: 4.6, z: 4.6 }, 0.4, walls)
    expect(result.x).toBeCloseTo(4.4)
    expect(result.z).toBeCloseTo(4.4)
  })
})
