import { formatIssues } from "./issues"
import { exerciseSchema } from "./schema"
import type { Exercise } from "./schema"

/** Tout ce que l'utilisateur tape est du texte : la conversion en nombres se fait ici. */
export type ExerciseFormValues = {
  name: string
  mode: "timed" | "repetitions"
  duration: string
  bothSides: boolean
  repetitions: string
  repetitionDuration: string
  intensityMin: string
  intensityMax: string
  instructions: string
  stopSignals: string
}

export const EMPTY_EXERCISE_FORM: ExerciseFormValues = {
  name: "",
  mode: "timed",
  duration: "",
  bothSides: false,
  repetitions: "",
  repetitionDuration: "",
  intensityMin: "",
  intensityMax: "",
  instructions: "",
  stopSignals: "",
}

export type BuildResult = { ok: true; exercise: Exercise } | { ok: false; errors: string[] }

/** "Étirement du psoas" devient "etirement-du-psoas" */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function uniqueId(base: string, existingIds: string[]): string {
  if (!existingIds.includes(base)) return base
  let count = 2
  while (existingIds.includes(`${base}-${count}`)) count++
  return `${base}-${count}`
}

function lines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
}

export function buildExercise(values: ExerciseFormValues, existingIds: string[]): BuildResult {
  const id = uniqueId(slugify(values.name) || "exercice", existingIds)

  const min = Number(values.intensityMin)
  const max = Number(values.intensityMax)
  const hasRange = values.intensityMax.trim() !== ""
  if (hasRange && min > max) {
    return { ok: false, errors: ["intensité : le minimum ne peut pas dépasser le maximum"] }
  }

  const common = {
    id,
    name: values.name.trim(),
    instructions: lines(values.instructions),
    stopSignals: lines(values.stopSignals),
    intensity: hasRange ? [min, max] : min,
  }

  const candidate =
    values.mode === "timed"
      ? { ...common, mode: "timed", duration: Number(values.duration), ...(values.bothSides && { sides: 2 }) }
      : {
          ...common,
          mode: "repetitions",
          repetitions: Number(values.repetitions),
          repetitionDuration: Number(values.repetitionDuration),
        }

  // Même schéma que pour l'import : un exercice créé ici est donc toujours valide
  const result = exerciseSchema.safeParse(candidate)
  if (!result.success) return { ok: false, errors: formatIssues(result.error) }
  return { ok: true, exercise: result.data }
}
