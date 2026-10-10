import { z } from "zod"

const intensityValue = z.number().min(1).max(10)

// Champs communs à tous les modes
const baseExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  instructions: z.array(z.string()),
  stopSignals: z.array(z.string()),
  intensity: z.union([intensityValue, z.tuple([intensityValue, intensityValue])]),
})

export const timedExerciseSchema = baseExerciseSchema.extend({
  mode: z.literal("timed"),
  duration: z.number().int().positive(),
  sides: z.literal(2).optional(),
})

export const repetitionExerciseSchema = baseExerciseSchema.extend({
  mode: z.literal("repetitions"),
  repetitions: z.number().int().positive(),
  repetitionDuration: z.number().int().positive(),
})

export const exerciseSchema = z.discriminatedUnion("mode", [timedExerciseSchema, repetitionExerciseSchema])

export const sessionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  exercises: z
    .array(exerciseSchema)
    .min(1)
    .refine(
      (list) => {
        const ids = list.map((exercise) => exercise.id)
        return new Set(ids).size === ids.length
      },
      { message: "Deux exercices de la même séance ont le même id" },
    ),
})

export const sessionsFileSchema = z.object({
  version: z.literal(1),
  sessions: z.array(sessionSchema).refine(
    (list) => {
      const ids = list.map((session) => session.id)
      return new Set(ids).size === ids.length
    },
    { message: "Deux séances ont le même id" },
  ),
})

export type TimedExercise = z.infer<typeof timedExerciseSchema>
export type Exercise = z.infer<typeof exerciseSchema>
export type Session = z.infer<typeof sessionSchema>
export type SessionsFile = z.infer<typeof sessionsFileSchema>
