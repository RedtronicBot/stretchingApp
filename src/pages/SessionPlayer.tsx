import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { SessionEngine } from "../features/session/engine"
import { createTimeline } from "../features/session/timeline"
import { FastForward, MoveLeft, Pause, Play, Rewind } from "lucide-react"
import { useNavigate, useParams } from "react-router"
import { formatTimer } from "../utils/formatTimer"
import ErrorPage from "./ErrorPage"
import type { Session } from "../features/session/types"
import ConfirmQuitModal from "../components/ConfirmQuitModal"
import { useSettings } from "../hooks/useSettings"
import type { SessionRecord } from "../features/history/types"
import { addRecord, updateFeeling } from "../features/history/store"
import { useSession } from "../hooks/useSessions"
import SideBadge from "../components/SideBadge"
import IntensityGauge from "../components/IntensityGauge"
const display = "font-['Bricolage_Grotesque',system-ui,sans-serif]"

export default function SessionPlayer() {
  const { id } = useParams()
  const session = useSession(id)
  if (!session) return <ErrorPage />
  return <SessionRunner key={session.id} session={session} />
}

function SessionRunner({ session }: { session: Session }) {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const engineRef = useRef<SessionEngine | null>(null)

  if (engineRef.current === null) {
    engineRef.current = new SessionEngine(createTimeline(session, settings))
  }

  const timeline = engineRef.current.getTimeline()
  useEffect(() => {
    return () => {
      engineRef.current!.destroy()
    }
  }, [])
  const subscribe = useCallback((listener: () => void) => {
    return engineRef.current!.subscribe(listener)
  }, [])

  const getSnapshot = useCallback(() => {
    return engineRef.current!.getSnapshot()
  }, [])

  const state = useSyncExternalStore(subscribe, getSnapshot)
  const [confirmQuit, setConfirmQuit] = useState(false)
  const wasRunningRef = useRef(false)

  const openQuitModal = () => {
    wasRunningRef.current = state.status === "running"
    if (wasRunningRef.current) engineRef.current?.pause()
    setConfirmQuit(true)
  }

  const cancelQuit = useCallback(() => {
    setConfirmQuit(false)
    if (wasRunningRef.current) engineRef.current?.resume()
  }, [])
  const currentStep = engineRef.current!.getCurrentStep()
  const nextStep = timeline[state.currentStepIndex + 1]
  const progress = state.elapsed / currentStep.duration
  const exerciseStep = currentStep.type !== "exercise" ? timeline[state.currentStepIndex - 1] : currentStep
  const exerciseIndex = exerciseStep?.type === "exercise" ? session.exercises.findIndex((exercise) => exercise.id === exerciseStep.exerciseId) : -1
  const currentExercise = currentStep.type === "exercise" ? session.exercises.find((exercise) => exercise.id === currentStep.exerciseId) : undefined
  const nextExercise = nextStep?.type === "exercise" ? session.exercises.find((exercise) => exercise.id === nextStep.exerciseId) : undefined
  const currentSide = currentStep.type === "exercise" ? currentStep.side : undefined
  let nextLabel: string
  if (state.currentStepIndex + 1 === timeline.length) {
    nextLabel = "Fin de séance"
  } else if (nextStep?.type === "transition") {
    nextLabel = "Changement de côté"
  } else if (nextStep?.type === "rest") {
    nextLabel = "Repos"
  } else {
    nextLabel = `${nextExercise?.name} · ${formatTimer(nextStep.duration)}`
  }
  const stepTitle = currentStep.type === "transition" ? "Changement de côté" : currentStep.type === "rest" ? "Repos" : currentExercise?.name
  const savedRecordId = useRef<string | null>(null)
  const [feeling, setFeeling] = useState<SessionRecord["feeling"]>()
  useEffect(() => {
    if (state.status !== "finished" || savedRecordId.current !== null) return
    const id = crypto.randomUUID()
    savedRecordId.current = id
    addRecord({
      id,
      sessionId: session.id,
      endDate: Date.now(),
      actualDuration: Math.round(state.actualDuration),
    })
  }, [state.status, state.actualDuration, session.id])
  if (state.status === "finished") {
    const actualDuration = state.actualDuration
    const chooseFeeling = (value: "mieux" | "pareil" | "moins bien") => {
      if (savedRecordId.current === null) return
      updateFeeling(savedRecordId.current, value)
      setFeeling(value)
    }
    return (
      <div className="min-h-screen bg-[#E8EEEE] pt-[env(safe-area-inset-top,0px)] font-['Figtree',system-ui,sans-serif] text-base leading-normal text-[#16303A] dark:bg-[#0F1E24] dark:text-[#E6EFEF]">
        <main className="mx-auto flex min-h-screen max-w-110 flex-col items-center justify-center px-5 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#5E8F73] text-3xl text-[#F6F9F8] dark:bg-[#7DB394] dark:text-[#0F1E24]">
            ✓
          </span>
          <h1 className={`${display} mt-6 text-2xl leading-tight font-bold`}>Séance terminée</h1>
          <p className="mt-2 text-[#5B7079] dark:text-[#93A9B0]">Bien joué, prends le temps de récupérer.</p>

          <div className="mt-6 flex gap-8 rounded-2xl border border-[#CBD8D8] bg-[#F6F9F8] px-6 py-4 dark:border-[#26404A] dark:bg-[#172A32]">
            <div>
              <span className={`${display} block text-xl font-bold`}>{formatTimer(actualDuration)}</span>
              <span className="text-[13px] text-[#5B7079] dark:text-[#93A9B0]">durée totale</span>
            </div>
            <div>
              <span className={`${display} block text-xl font-bold`}>{session.exercises.length}</span>
              <span className="text-[13px] text-[#5B7079] dark:text-[#93A9B0]">exercices</span>
            </div>
          </div>
          <p className="mt-6 text-[#5B7079] dark:text-[#93A9B0]">Comment tu te sens ?</p>
          <div className="mt-3 flex gap-2">
            {(["mieux", "pareil", "moins bien"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={feeling === value}
                onClick={() => chooseFeeling(value)}
                className={`rounded-full border px-4 py-2 text-[15px] ${
                  feeling === value
                    ? "border-[#16303A] bg-[#16303A] text-[#F6F9F8] dark:border-[#E6EFEF] dark:bg-[#E6EFEF] dark:text-[#0F1E24]"
                    : "border-[#CBD8D8] dark:border-[#26404A]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-8 rounded-full bg-[#16303A] px-6 py-3 font-semibold text-[#F6F9F8] dark:bg-[#E6EFEF] dark:text-[#0F1E24]"
          >
            Retour à l'accueil
          </button>
        </main>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-[#E8EEEE] pt-[env(safe-area-inset-top,0px)] font-['Figtree',system-ui,sans-serif] text-base leading-normal text-[#16303A] dark:bg-[#0F1E24] dark:text-[#E6EFEF]">
      <main className="mx-auto flex min-h-screen max-w-110 flex-col px-5 pt-5 pb-8">
        {/* Barre du haut */}
        <div className="flex items-center justify-between">
          <button type="button" aria-label="Retour" className="p-2 text-xl" onClick={openQuitModal}>
            <MoveLeft />
          </button>
          <span className="text-[13px] text-[#5B7079] dark:text-[#93A9B0]">
            {session.name} · exercice {exerciseIndex + 1}/{session.exercises.length}
          </span>
          <div className="w-6"></div>
        </div>

        {/* Minuteur circulaire */}
        <section aria-label="Exercice en cours" className="mt-8 flex flex-1 flex-col items-center justify-center text-center">
          <div
            className="relative flex h-60 w-60 items-center justify-center rounded-full bg-[#5E8F73] text-[#F6F9F8] dark:bg-[#7DB394] dark:text-[#0F1E24]"
            style={{
              boxShadow: `0 0 0 6px rgba(94,143,115,${0.35 * progress + 0.05}), 0 0 0 14px rgba(94,143,115,0.18)`,
            }}
          >
            <div>
              <span className={`${display} block text-[48px] leading-none font-bold`}>{formatTimer(currentStep.duration - state.elapsed)}</span>
              <span className="mt-1 block text-[13px] opacity-80">sur {formatTimer(currentStep.duration)}</span>
            </div>
          </div>

          <div className="mt-6">
            {currentSide && <SideBadge side={currentSide} />}
            <h1 className={`${display} mt-2 text-2xl leading-tight font-bold`}>{stepTitle}</h1>
          </div>

          <ul className="mt-4 flex flex-col gap-1.5 text-[15px] text-[#5B7079] dark:text-[#93A9B0]">
            {currentExercise?.instructions.map((instruction) => (
              <li key={instruction} className="flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 flex-none rounded-full bg-[#5E8F73] dark:bg-[#7DB394]" />
                {instruction}
              </li>
            ))}
          </ul>

          <div className="mt-5">{currentExercise && <IntensityGauge intensity={currentExercise.intensity} />}</div>
        </section>

        {/* Rappel signal d'arrêt */}
        {currentExercise && currentExercise.stopSignals.length > 0 && (
          <div className="mt-6 rounded-2xl bg-[#F0DFC6] px-4 py-3 text-center text-[14px] text-[#5A4020] dark:bg-[#3A3022] dark:text-[#F0DFC6]">
            Arrête-toi si : {currentExercise.stopSignals.join(", ")}
          </div>
        )}

        {/* Contrôles */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <button
            type="button"
            aria-label="Étape précédente"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#CBD8D8] text-xl dark:border-[#26404A]"
            onClick={() => engineRef.current?.previousStep()}
          >
            <Rewind />
          </button>
          {state.status === "running" ? (
            <button
              type="button"
              aria-label="Mettre en pause"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#16303A] text-2xl text-[#F6F9F8] dark:bg-[#E6EFEF] dark:text-[#0F1E24]"
              onClick={() => engineRef.current?.pause()}
            >
              <Pause />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Démarrer la séance"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#16303A] text-2xl text-[#F6F9F8] dark:bg-[#E6EFEF] dark:text-[#0F1E24]"
              onClick={() => {
                if (state.status === "idle") {
                  engineRef.current?.start()
                } else {
                  engineRef.current?.resume()
                }
              }}
            >
              <Play />
            </button>
          )}
          <button
            type="button"
            aria-label="Passer l'étape"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#CBD8D8] text-xl dark:border-[#26404A]"
            onClick={() => engineRef.current?.nextStep()}
          >
            <FastForward />
          </button>
        </div>

        {/* Prochaine étape */}
        <p className="mt-6 text-center text-[13px] text-[#5B7079] dark:text-[#93A9B0]">Ensuite : {nextLabel}</p>
      </main>
      {confirmQuit && <ConfirmQuitModal onCancel={cancelQuit} onConfirm={() => navigate("/")} />}
    </div>
  )
}
