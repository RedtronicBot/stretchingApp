import type { Settings } from "../settings/settings"
import type { Exercise, Session, TimelineStep } from "./types"

export function createTimelineSteps(exercise: Exercise, transitionDuration: number): TimelineStep[] {
  switch (exercise.mode) {
    case "repetitions": {
      const steps: TimelineStep[] = []

      for (let i = 0; i < exercise.repetitions; i++) {
        steps.push({
          type: "exercise",
          duration: exercise.repetitionDuration,
          exerciseId: exercise.id,
        })
      }

      return steps
    }

    case "timed": {
      if (exercise.sides === 2) {
        return [
          { type: "exercise", duration: exercise.duration, exerciseId: exercise.id, side: "left" },
          { type: "transition", duration: transitionDuration },
          { type: "exercise", duration: exercise.duration, exerciseId: exercise.id, side: "right" },
        ]
      }

      return [{ type: "exercise", duration: exercise.duration, exerciseId: exercise.id }]
    }
  }
}

export function createTimeline(session: Session, settings: Settings): TimelineStep[] {
  return session.exercises.flatMap((exercise, index) => {
    const steps = createTimelineSteps(exercise, settings.transitionDuration)
    if (index !== session.exercises.length - 1 && settings.restDuration > 0) {
      steps.push({ type: "rest", duration: settings.restDuration })
    }
    return steps
  })
}

export function totalDuration(timeline: TimelineStep[]) {
  return timeline.reduce((total, step) => total + step.duration, 0)
}

export function sessionDuration(session: Session, settings: Settings): number {
  const timeline = createTimeline(session, settings)
  return totalDuration(timeline)
}

export function exerciseDuration(exercise: Exercise, transitionDuration: number): number {
  const steps = createTimelineSteps(exercise, transitionDuration)
  return totalDuration(steps)
}
