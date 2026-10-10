import type { ZodError } from "zod"

const FIELD_LABELS: Record<string, string> = {
  id: "identifiant",
  name: "nom",
  mode: "mode",
  duration: "durée",
  sides: "côtés",
  repetitions: "répétitions",
  repetitionDuration: "durée par répétition",
  intensity: "intensité",
  instructions: "instructions",
  stopSignals: "signaux d'arrêt",
  exercises: "exercices",
  sessions: "séances",
  version: "version",
}

const TYPE_LABELS: Record<string, string> = {
  string: "un texte",
  number: "un nombre",
  int: "un nombre entier",
  array: "une liste",
  object: "un objet",
  boolean: "vrai ou faux",
}

type Issue = ZodError["issues"][number]

/** ["sessions", 0, "exercises", 2, "duration"] devient "séance 1, exercice 3, durée" */
function describePath(path: PropertyKey[]): string {
  const parts: string[] = []
  for (let i = 0; i < path.length; i++) {
    const key = path[i]
    const next = path[i + 1]
    if (key === "sessions" && typeof next === "number") {
      parts.push(`séance ${next + 1}`)
      i++
    } else if (key === "exercises" && typeof next === "number") {
      parts.push(`exercice ${next + 1}`)
      i++
    } else if (typeof key === "number") {
      parts.push(`élément ${key + 1}`)
    } else {
      parts.push(FIELD_LABELS[String(key)] ?? String(key))
    }
  }
  return parts.join(", ")
}

function describeProblem(issue: Issue): string {
  switch (issue.code) {
    case "invalid_type":
      if (issue.message.includes("received undefined")) return "valeur manquante"
      return `doit être ${TYPE_LABELS[issue.expected] ?? issue.expected}`
    case "too_small":
      if (issue.origin === "array") return `liste trop courte (minimum ${issue.minimum} élément${Number(issue.minimum) > 1 ? "s" : ""})`
      if (issue.origin === "string") return Number(issue.minimum) === 1 ? "ne peut pas être vide" : `trop court (minimum ${issue.minimum} caractères)`
      return issue.inclusive ? `doit être au moins ${issue.minimum}` : `doit être supérieur à ${issue.minimum}`
    case "too_big":
      return issue.inclusive ? `doit être au plus ${issue.maximum}` : `doit être inférieur à ${issue.maximum}`
    case "invalid_value":
      return `valeur non autorisée (attendu : ${issue.values.join(" ou ")})`
    case "invalid_union":
      return issue.path[issue.path.length - 1] === "mode" ? "mode inconnu (attendu : timed ou repetitions)" : "format invalide"
    default:
      return issue.message
  }
}

/** Transforme les erreurs de validation en phrases lisibles pour l'utilisateur. */
export function formatIssues(error: ZodError): string[] {
  return error.issues.map((issue) => {
    const where = describePath(issue.path)
    const problem = describeProblem(issue)
    return where === "" ? problem : `${where} : ${problem}`
  })
}
