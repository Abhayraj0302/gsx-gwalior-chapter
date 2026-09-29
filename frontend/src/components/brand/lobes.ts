// Clockwise from the top left in a 100 x 100 view box. `x` / `y` point away from the centre.
export const LOGO_LOBES = [
  { key: 'tl', d: 'M 48.25,48.25 H 25 A 23.25,23.25 0 1 1 48.25,25 Z', x: -1, y: -1 },
  { key: 'tr', d: 'M 51.75,48.25 V 25 A 23.25,23.25 0 1 1 75,48.25 Z', x: 1, y: -1 },
  { key: 'br', d: 'M 51.75,51.75 H 75 A 23.25,23.25 0 1 1 51.75,75 Z', x: 1, y: 1 },
  { key: 'bl', d: 'M 48.25,51.75 V 75 A 23.25,23.25 0 1 1 25,51.75 Z', x: -1, y: 1 },
] as const

export type LobeKey = (typeof LOGO_LOBES)[number]['key']
