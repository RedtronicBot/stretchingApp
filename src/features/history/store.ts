import type { SessionRecord } from "./types"
import { sessionRecordSchema } from "./schema"

const STORAGE_KEY = "history"

function read(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.flatMap((item) => {
      const result = sessionRecordSchema.safeParse(item)
      return result.success ? [result.data] : []
    })
  } catch {
    return []
  }
}

let entries: SessionRecord[] = read()
const listeners = new Set<() => void>()

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getSnapshot() {
  return entries
}

export function addRecord(record: SessionRecord) {
  entries = [...entries, record]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  listeners.forEach((listener) => listener())
}

export function updateFeeling(id: string, feeling: NonNullable<SessionRecord["feeling"]>) {
  entries = entries.map((entry) => (entry.id === id ? { ...entry, feeling } : entry))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  listeners.forEach((listener) => listener())
}
