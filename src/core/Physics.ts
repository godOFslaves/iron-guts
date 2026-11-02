export interface PlayerPos {
  x: number
  z: number
}

export interface WallBox {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

/**
 * Check if player AABB overlaps a wall AABB on XZ plane.
 */
export function aabbOverlap(
  playerX: number,
  playerZ: number,
  radius: number,
  wallMinX: number,
  wallMaxX: number,
  wallMinZ: number,
  wallMaxZ: number
): boolean {
  return (
    playerX + radius > wallMinX &&
    playerX - radius < wallMaxX &&
    playerZ + radius > wallMinZ &&
    playerZ - radius < wallMaxZ
  )
}

/**
 * Resolve collisions by trying each axis separately (sliding).
 * In the X pass only push along X. In the Z pass only push along Z.
 */
export function resolveCollisions(
  pos: PlayerPos,
  radius: number,
  walls: readonly WallBox[]
): PlayerPos {
  let x = pos.x
  let z = pos.z

  // X pass: resolve only X-axis penetration
  for (const wall of walls) {
    if (!aabbOverlap(x, z, radius, wall.minX, wall.maxX, wall.minZ, wall.maxZ)) {
      continue
    }

    const playerLeft = x - radius
    const playerRight = x + radius

    const pastLeft = playerRight > wall.minX && playerLeft < wall.minX
    const pastRight = playerLeft < wall.maxX && playerRight > wall.maxX

    if (pastLeft && pastRight) {
      // Wall thinner than player diameter — push to closest face
      const distLeft = Math.abs(playerRight - wall.minX)
      const distRight = Math.abs(playerLeft - wall.maxX)
      if (distLeft < distRight) {
        x = wall.minX - radius
      } else {
        x = wall.maxX + radius
      }
    } else if (pastLeft) {
      x = wall.minX - radius
    } else if (pastRight) {
      x = wall.maxX + radius
    }
    // If neither (player inside wall's X range), don't push in X
  }

  // Z pass: resolve only Z-axis penetration
  for (const wall of walls) {
    if (!aabbOverlap(x, z, radius, wall.minX, wall.maxX, wall.minZ, wall.maxZ)) {
      continue
    }

    const playerTop = z - radius
    const playerBottom = z + radius

    const pastTop = playerBottom > wall.minZ && playerTop < wall.minZ
    const pastBottom = playerTop < wall.maxZ && playerBottom > wall.maxZ

    if (pastTop && pastBottom) {
      const distTop = Math.abs(playerBottom - wall.minZ)
      const distBottom = Math.abs(playerTop - wall.maxZ)
      if (distTop < distBottom) {
        z = wall.minZ - radius
      } else {
        z = wall.maxZ + radius
      }
    } else if (pastTop) {
      z = wall.minZ - radius
    } else if (pastBottom) {
      z = wall.maxZ + radius
    }
  }

  return { x, z }
}

/**
 * Clamp a value to a max delta.
 */
export function clampDelta(dt: number, maxDelta: number): number {
  return dt < maxDelta ? dt : maxDelta
}
