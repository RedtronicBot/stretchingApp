import type { SessionRecord } from "./types"
import { addDays, startOfDay, startOfWeek } from "../../utils/dates"

export const WEEKS_SHOWN = 8

export type FeelingKey = NonNullable<SessionRecord["feeling"]> | "unspecified"

export type WeekStat = {
  start: Date // le lundi de la semaine, à minuit
  sessionCount: number
  seconds: number
}

export type GlobalStats = {
  sessionCount: number
  totalSeconds: number
  averageSeconds: number
  currentStreak: number
  bestStreak: number
  weeks: WeekStat[] // de la plus ancienne à la semaine en cours
  feelings: Record<FeelingKey, number>
}

/** Série en cours : jours consécutifs avec au moins une séance. Elle reste vivante
 *  tant qu'on a fait une séance aujourd'hui ou hier. */
function computeCurrentStreak(days: Set<number>, now: Date): number {
  let cursor = startOfDay(now)
  if (!days.has(cursor.getTime())) cursor = addDays(cursor, -1)

  let streak = 0
  while (days.has(cursor.getTime())) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

/** Plus longue série de jours consécutifs, tout l'historique confondu. */
function computeBestStreak(days: Set<number>): number {
  const sorted = [...days].sort((a, b) => a - b)
  let best = 0
  let run = 0
  let previous: Date | null = null

  for (const timestamp of sorted) {
    const isNextDay = previous !== null && addDays(previous, 1).getTime() === timestamp
    run = isNextDay ? run + 1 : 1
    best = Math.max(best, run)
    previous = new Date(timestamp)
  }
  return best
}

function computeWeeks(records: SessionRecord[], now: Date): WeekStat[] {
  const currentMonday = startOfWeek(now)

  return Array.from({ length: WEEKS_SHOWN }, (_, i) => {
    const start = addDays(currentMonday, -7 * (WEEKS_SHOWN - 1 - i))
    const end = addDays(start, 7)
    const inWeek = records.filter((record) => record.endDate >= start.getTime() && record.endDate < end.getTime())

    return {
      start,
      sessionCount: inWeek.length,
      seconds: inWeek.reduce((total, record) => total + record.actualDuration, 0),
    }
  })
}

export function computeGlobalStats(records: SessionRecord[], now: Date): GlobalStats {
  const sessionCount = records.length
  const totalSeconds = records.reduce((total, record) => total + record.actualDuration, 0)

  const days = new Set(records.map((record) => startOfWeek(new Date(record.endDate)).getTime()))

  const feelings: Record<FeelingKey, number> = { mieux: 0, pareil: 0, "moins bien": 0, unspecified: 0 }
  for (const record of records) {
    feelings[record.feeling ?? "unspecified"]++
  }

  return {
    sessionCount,
    totalSeconds,
    averageSeconds: sessionCount === 0 ? 0 : Math.round(totalSeconds / sessionCount),
    currentStreak: computeCurrentStreak(days, now),
    bestStreak: computeBestStreak(days),
    weeks: computeWeeks(records, now),
    feelings,
  }
}
