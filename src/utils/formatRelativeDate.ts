import { startOfDay } from "./dates"

export function formatRelativeDate(timestamp: number): string {
  const date = new Date(timestamp)
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  const dayDiff = Math.round((startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / 86_400_000)

  if (dayDiff === 0) return `Aujourd'hui, ${time}`
  if (dayDiff === 1) return `Hier, ${time}`
  const day = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
  return `${day}, ${time}`
}
