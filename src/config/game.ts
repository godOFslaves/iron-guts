export const ROOM = {
  width: 10,
  depth: 10,
  height: 3,
} as const

export const PLAYER = {
  radius: 0.4,
  eyeHeight: 1.6,
  moveSpeed: 5,
} as const

export const INPUT = {
  maxDelta: 0.05,
  mouseSensitivity: 0.002,
} as const

export const WALLS = [
  // North wall (z = -depth/2)
  { minX: -ROOM.width / 2, maxX: ROOM.width / 2, minZ: -ROOM.depth / 2, maxZ: -ROOM.depth / 2 + 0.2 },
  // South wall (z = +depth/2)
  { minX: -ROOM.width / 2, maxX: ROOM.width / 2, minZ: ROOM.depth / 2 - 0.2, maxZ: ROOM.depth / 2 },
  // West wall (x = -width/2)
  { minX: -ROOM.width / 2, maxX: -ROOM.width / 2 + 0.2, minZ: -ROOM.depth / 2, maxZ: ROOM.depth / 2 },
  // East wall (x = +width/2)
  { minX: ROOM.width / 2 - 0.2, maxX: ROOM.width / 2, minZ: -ROOM.depth / 2, maxZ: ROOM.depth / 2 },
] as const
