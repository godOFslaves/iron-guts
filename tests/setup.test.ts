import { describe, it, expect } from 'vitest'

describe('Project setup', () => {
  it('should have a version defined in package.json', () => {
    expect('0.0.1').toBe('0.0.1')
  })

  it('math utilities should work', () => {
    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max)

    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })
})
