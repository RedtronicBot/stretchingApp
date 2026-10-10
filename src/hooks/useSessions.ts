import { useSyncExternalStore } from "react"
import { getSnapshot, subscribe } from "../features/session/store"

export function useSessions() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

export function useSession(id: string | undefined) {
  const sessions = useSessions()
  return sessions.find((session) => session.id === id)
}
