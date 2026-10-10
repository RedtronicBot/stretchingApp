import { useSyncExternalStore } from "react"
import { getSnapshot, subscribe } from "../features/history/store"

export function useHistory() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
