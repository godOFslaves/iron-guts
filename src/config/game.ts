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

export const WEAPON = {
  magSize: 12,
  reloadTime: 1.5,
  fireDelay: 0.3,
  flashDuration: 0.05,
} as const

export const TARGETS = [
  { position: [0, 1.2, -4.5] as [number, number, number], size: 0.4, hitsToDestroy: 3, color: 0xff4444 },
  { position: [-3, 1.2, -3] as [number, number, number], size: 0.35, hitsToDestroy: 2, color: 0x44ff44 },
  { position: [3, 1.2, -3] as [number, number, number], size: 0.35, hitsToDestroy: 2, color: 0x4444ff },
  { position: [0, 1.2, -7] as [number, number, number], size: 0.5, hitsToDestroy: 4, color: 0xffff44 },
] as const

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
