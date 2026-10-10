/** Durée lisible : "< 1 min", "18 min", "2 h 05". */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0 min"
  const minutes = Math.round(seconds / 60)
  if (minutes === 0) return "< 1 min"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${hours} h ${rest.toString().padStart(2, "0")}`
}
