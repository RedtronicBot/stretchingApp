import type { TimelineStep } from "./types"

type SessionState = {
  status: "idle" | "running" | "paused" | "finished"
  currentStepIndex: number
  elapsed: number
  actualDuration: number
}

export class SessionEngine {
  private state: SessionState
  private timeline: TimelineStep[]
  private animationFrameId: number | null = null
  private previousTime = 0
  private listeners: (() => void)[] = []

  constructor(timeline: TimelineStep[]) {
    this.timeline = timeline
    this.state = {
      status: "idle",
      currentStepIndex: 0,
      elapsed: 0,
      actualDuration: 0,
    }
  }

  getSnapshot(): SessionState {
    return this.state
  }

  getTimeline(): TimelineStep[] {
    return this.timeline
  }

  start(): void {
    if (this.state.status === "paused" || this.state.status === "finished") {
      throw new Error(`Impossible de mettre la session en route : état actuel "${this.state.status}"`)
    }
    if (this.state.status === "running") {
      return
    }
    this.state = {
      ...this.state,
      status: "running",
    }
    this.notify()
    this.startLoop()
  }

  pause(): void {
    if (this.state.status !== "running") {
      throw new Error(`Impossible de mettre la session en pause : état actuel "${this.state.status}"`)
    }
    this.state = {
      ...this.state,
      status: "paused",
    }
    this.stopLoop()
    this.notify()
  }

  resume(): void {
    if (this.state.status !== "paused") {
      throw new Error(`Impossible de mettre en route la session : état actuel "${this.state.status}"`)
    }

    this.state = {
      ...this.state,
      status: "running",
    }
    this.notify()
    this.startLoop()
  }

  getCurrentStep(): TimelineStep {
    const step = this.timeline[this.state.currentStepIndex]
    if (step === undefined) throw new Error(`Etape ${this.state.currentStepIndex + 1} inexistante`)
    return step
  }

  nextStep(): void {
    if (this.state.status === "running" || this.state.status === "paused") {
      if (this.state.currentStepIndex !== this.timeline.length - 1) {
        this.state = {
          ...this.state,
          currentStepIndex: this.state.currentStepIndex + 1,
          elapsed: 0,
        }
      } else {
        this.state = {
          ...this.state,
          status: "finished",
        }
      }
      this.notify()
    }
  }

  previousStep(): void {
    if (this.state.currentStepIndex === 0) return
    if (this.state.status === "running" || this.state.status === "paused") {
      this.state = {
        ...this.state,
        currentStepIndex: this.state.currentStepIndex - 1,
        elapsed: 0,
      }
      this.notify()
    }
  }

  tick(delta: number): void {
    if (this.state.status !== "running") {
      return
    }

    let elapsed = this.state.elapsed + delta
    const actualDuration = this.state.actualDuration + delta

    while (elapsed >= this.getCurrentStep().duration) {
      const currentStep = this.getCurrentStep()

      elapsed -= currentStep.duration

      if (this.state.currentStepIndex === this.timeline.length - 1) {
        this.state = {
          ...this.state,
          status: "finished",
        }
        break
      }

      this.nextStep()
    }
    this.state = {
      ...this.state,
      elapsed,
      actualDuration,
    }
    this.notify()
  }

  private startLoop(): void {
    this.previousTime = performance.now()

    const loop = () => {
      const actualTime = performance.now()
      const delta = (actualTime - this.previousTime) / 1000

      this.previousTime = actualTime

      this.tick(delta)

      if (this.state.status === "running") {
        this.animationFrameId = requestAnimationFrame(loop)
      }
    }
    loop()
  }
  destroy(): void {
    this.stopLoop()
  }
  private stopLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener)

    return () => {
      const index = this.listeners.indexOf(listener)

      if (index === -1) {
        throw new Error("Listener introuvable")
      }

      this.listeners.splice(index, 1)
    }
  }

  notify(): void {
    for (const listener of this.listeners) {
      listener()
    }
  }
}
