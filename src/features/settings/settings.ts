export type Settings = {
  transitionDuration: number
  restDuration: number
}

export const DEFAULT_SETTINGS: Settings = {
  transitionDuration: 5,
  restDuration: 10,
}

export const LIMITS = {
  transitionDuration: { min: 1, max: 30 },
  restDuration: { min: 0, max: 120 },
} as const
