import type { SessionRecord } from "./types"
import { addDays, startOfDay, startOfWeek } from "../../utils/dates"

const DAY_LETTERS = ["L", "M", "M", "J", "V", "S", "D"]

export type DayState = "done" | "today" | "upcoming" | "missed"

export type WeekSummary = {
  days: { letter: string; state: DayState }[]
  sessionCount: number
  totalSeconds: number
}

export function summarizeWeek(records: SessionRecord[], dateNow: Date): WeekSummary {
  const monday = startOfWeek(dateNow)
  const nextMonday = addDays(monday, 7)
  const today = startOfDay(dateNow).getTime()

  // 1. Les séances de cette semaine seulement
  const inWeek = records.filter((record) => record.endDate >= monday.getTime() && record.endDate < nextMonday.getTime())

  // 2. Les 7 pastilles
  const days = DAY_LETTERS.map((letter, i) => {
    const start = addDays(monday, i).getTime()
    const end = addDays(monday, i + 1).getTime()
    const hasSession = inWeek.some((record) => record.endDate >= start && record.endDate < end)

    let state: DayState
    if (hasSession) state = "done"
    else if (start === today) state = "today"
    else if (start < today) state = "missed"
    else state = "upcoming"

    return { letter, state }
  })

  // 3. Les totaux
  return {
    days,
    sessionCount: inWeek.length,
    totalSeconds: inWeek.reduce((total, record) => total + record.actualDuration, 0),
  }
}
