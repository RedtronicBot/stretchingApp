export function formatTimer(seconds: number): string {
  const remaining = Math.max(0, Math.ceil(seconds))
  const minutes = Math.floor(remaining / 60)
  const secs = remaining % 60
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}
