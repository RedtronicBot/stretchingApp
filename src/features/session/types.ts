export type { Exercise, Session } from "./schema"

export type TimelineStep = ExerciseStep | TransitionStep | RestStep

type ExerciseStep = {
  type: "exercise"
  side?: "left" | "right"
  duration: number
  exerciseId: string
}

type TransitionStep = {
  type: "transition"
  duration: number
}

type RestStep = {
  type: "rest"
  duration: number
}

export type Side = "left" | "right"
