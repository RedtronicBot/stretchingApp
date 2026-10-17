import { useEffect } from "react"

export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false

    const request = async () => {
      try {
        const sentinel = await navigator.wakeLock.request("screen")
        if (cancelled) sentinel.release()
        else lock = sentinel
      } catch {
        // refusé (économie d'énergie, etc.) : on ignore
      }
    }

    // le verrou est relâché quand l'onglet passe en arrière-plan, on le redemande au retour
    const onVisible = () => {
      if (document.visibilityState === "visible") request()
    }

    request()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", onVisible)
      lock?.release()
    }
  }, [active])
}
