import { useId, useState } from "react"
import ErrorNotice from "./ErrorNotice"
import { useSessions } from "../hooks/useSessions"
import { addExercise } from "../features/session/store"
import { EMPTY_EXERCISE_FORM, buildExercise } from "../features/session/exerciseForm"
import type { ExerciseFormValues } from "../features/session/exerciseForm"

const muted = "text-[#5B7079] dark:text-[#93A9B0]"
const inputClass =
  "w-full rounded-xl border border-[#CBD8D8] bg-[#E8EEEE] px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-[#5E8F73] dark:border-[#26404A] dark:bg-[#0F1E24] dark:focus-visible:outline-[#7DB394]"

const MODES = [
  { value: "timed", label: "Durée fixe" },
  { value: "repetitions", label: "Répétitions" },
] as const

type FieldControlProps = { id: string; "aria-describedby"?: string }

function Field({ label, hint, children }: { label: string; hint?: string; children: (props: FieldControlProps) => React.ReactNode }) {
  const id = useId()
  const hintId = `${id}-hint`
  return (
    <div>
      <label htmlFor={id} className="block text-[15px] font-semibold">
        {label}
      </label>
      {hint && (
        <p id={hintId} className={`text-[13px] ${muted}`}>
          {hint}
        </p>
      )}
      <div className="mt-1.5">{children({ id, "aria-describedby": hint ? hintId : undefined })}</div>
    </div>
  )
}

export default function AddExerciseForm() {
  const sessions = useSessions()
  const [values, setValues] = useState<ExerciseFormValues>(EMPTY_EXERCISE_FORM)
  const [sessionId, setSessionId] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [added, setAdded] = useState<string | null>(null)

  const update = <K extends keyof ExerciseFormValues>(key: K, value: ExerciseFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  // Si la séance choisie n'existe plus (après un import, par exemple), on retombe sur la première
  const target = sessions.find((session) => session.id === sessionId) ?? sessions[0]

  if (target === undefined) {
    return <p className={muted}>Aucune séance pour l'instant : importe un fichier ou restaure les séances par défaut pour pouvoir y ajouter des exercices.</p>
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const result = buildExercise(
      values,
      target.exercises.map((exercise) => exercise.id),
    )
    if (!result.ok) {
      setErrors(result.errors)
      setAdded(null)
      return
    }

    const saved = addExercise(target.id, result.exercise)
    setErrors([])
    setValues(EMPTY_EXERCISE_FORM)
    setAdded(
      saved
        ? `« ${result.exercise.name} » ajouté à « ${target.name} ».`
        : `« ${result.exercise.name} » ajouté, mais la sauvegarde dans ce navigateur a échoué : il disparaîtra au rechargement.`,
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-[#CBD8D8] bg-[#F6F9F8] p-4 dark:border-[#26404A] dark:bg-[#172A32]"
    >
      {sessions.length > 1 && (
        <Field label="Séance">
          {(props) => (
            <select {...props} value={target.id} onChange={(e) => setSessionId(e.target.value)} className={inputClass}>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
          )}
        </Field>
      )}

      <Field label="Nom">{(props) => <input {...props} type="text" value={values.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />}</Field>

      <fieldset>
        <legend className="text-[15px] font-semibold">Type d'exercice</legend>
        <div className="mt-1.5 flex gap-2">
          {MODES.map((mode) => (
            <label
              key={mode.value}
              className="flex-1 cursor-pointer rounded-xl border border-[#CBD8D8] px-3 py-2 text-center text-[15px] has-[:checked]:border-[#16303A] has-[:checked]:bg-[#16303A] has-[:checked]:font-semibold has-[:checked]:text-[#F6F9F8] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#5E8F73] dark:border-[#26404A] dark:has-[:checked]:border-[#E6EFEF] dark:has-[:checked]:bg-[#E6EFEF] dark:has-[:checked]:text-[#0F1E24]"
            >
              <input
                type="radio"
                name="exercise-mode"
                value={mode.value}
                checked={values.mode === mode.value}
                onChange={() => update("mode", mode.value)}
                className="sr-only"
              />
              {mode.label}
            </label>
          ))}
        </div>
      </fieldset>

      {values.mode === "timed" ? (
        <>
          <Field label="Durée (secondes)" hint="Par côté si tu fais les deux côtés.">
            {(props) => (
              <input {...props} type="number" inputMode="numeric" min={1} step={1} value={values.duration} onChange={(e) => update("duration", e.target.value)} className={inputClass} />
            )}
          </Field>
          <label className="flex items-center gap-2.5 text-[15px]">
            <input type="checkbox" checked={values.bothSides} onChange={(e) => update("bothSides", e.target.checked)} className="h-4 w-4 accent-[#5E8F73]" />
            Faire les deux côtés (gauche puis droite)
          </label>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Répétitions">
            {(props) => (
              <input {...props} type="number" inputMode="numeric" min={1} step={1} value={values.repetitions} onChange={(e) => update("repetitions", e.target.value)} className={inputClass} />
            )}
          </Field>
          <Field label="Secondes par répétition">
            {(props) => (
              <input
                {...props}
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={values.repetitionDuration}
                onChange={(e) => update("repetitionDuration", e.target.value)}
                className={inputClass}
              />
            )}
          </Field>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Intensité (1 à 10)">
          {(props) => (
            <input {...props} type="number" inputMode="numeric" min={1} max={10} step={1} value={values.intensityMin} onChange={(e) => update("intensityMin", e.target.value)} className={inputClass} />
          )}
        </Field>
        <Field label="Maximum" hint="Facultatif.">
          {(props) => (
            <input {...props} type="number" inputMode="numeric" min={1} max={10} step={1} value={values.intensityMax} onChange={(e) => update("intensityMax", e.target.value)} className={inputClass} />
          )}
        </Field>
      </div>

      <Field label="Instructions" hint="Une par ligne. Facultatif.">
        {(props) => <textarea {...props} rows={3} value={values.instructions} onChange={(e) => update("instructions", e.target.value)} className={inputClass} />}
      </Field>

      <Field label="Arrête-toi si" hint="Un signal par ligne. Facultatif.">
        {(props) => <textarea {...props} rows={2} value={values.stopSignals} onChange={(e) => update("stopSignals", e.target.value)} className={inputClass} />}
      </Field>

      <ErrorNotice title="L'exercice n'a pas été ajouté." errors={errors} />

      <button type="submit" className="rounded-full bg-[#16303A] px-6 py-3 font-semibold text-[#F6F9F8] dark:bg-[#E6EFEF] dark:text-[#0F1E24]">
        Ajouter l'exercice
      </button>

      {added && (
        <p role="status" className={`text-[15px] ${muted}`}>
          {added}
        </p>
      )}
    </form>
  )
}
