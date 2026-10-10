import { useId, useState } from "react"
import { LIMITS } from "../features/settings/settings"
import { useSettings } from "../hooks/useSettings"
import SessionsData from "../components/SessionsData"
import AddExerciseForm from "../components/AddExerciseForm"

const display = "font-['Bricolage_Grotesque',system-ui,sans-serif]"

type DurationFieldProps = {
  label: string
  description: string
  value: number
  min: number
  max: number
  onCommit: (value: number) => void
}

function DurationField({ label, description, value, min, max, onCommit }: DurationFieldProps) {
  const id = useId()
  // Texte tapé : on le garde en string pour pouvoir effacer le champ librement,
  // et on ne valide qu'à la sortie du champ (blur ou Entrée).
  const [draft, setDraft] = useState(String(value))

  const validate = () => {
    const parsed = Number(draft)
    if (draft.trim() === "" || !Number.isFinite(parsed)) {
      setDraft(String(value))
      return
    }
    const clamped = Math.min(max, Math.max(min, Math.round(parsed)))
    setDraft(String(clamped))
    onCommit(clamped)
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#CBD8D8] bg-[#F6F9F8] p-4 dark:border-[#26404A] dark:bg-[#172A32]">
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className={`${display} block text-base font-bold`}>
          {label}
        </label>
        <p className="mt-0.5 text-[13px] text-[#5B7079] dark:text-[#93A9B0]">{description}</p>
      </div>
      <div className="flex flex-none items-center gap-1.5">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={validate}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur()
          }}
          className="w-20 rounded-xl border border-[#CBD8D8] bg-[#E8EEEE] px-3 py-2 text-right text-base font-semibold focus-visible:outline-2 focus-visible:outline-[#5E8F73] dark:border-[#26404A] dark:bg-[#0F1E24] dark:focus-visible:outline-[#7DB394]"
        />
        <span className="text-sm text-[#5B7079] dark:text-[#93A9B0]">s</span>
      </div>
    </div>
  )
}

export default function Settings() {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="min-h-screen bg-[#E8EEEE] pt-[env(safe-area-inset-top,0px)] font-['Figtree',system-ui,sans-serif] text-base leading-normal text-[#16303A] dark:bg-[#0F1E24] dark:text-[#E6EFEF]">
      <main className="mx-auto max-w-110 px-5 pt-7 pb-24">
        <header>
          <h1 className={`${display} text-[28px] leading-tight font-bold`}>Réglages</h1>
          <p className="mt-1.5 text-[#5B7079] dark:text-[#93A9B0]">Ajuste le rythme et le contenu de tes séances.</p>
        </header>

        <h2 className={`${display} mt-8 mb-3 text-lg font-bold`}>Durées</h2>
        <div className="flex flex-col gap-3">
          <DurationField
            label="Changement de côté"
            description="Pause entre le côté gauche et le côté droit d'un même exercice."
            value={settings.transitionDuration}
            min={LIMITS.transitionDuration.min}
            max={LIMITS.transitionDuration.max}
            onCommit={(transitionDuration) => updateSettings({ transitionDuration })}
          />
          <DurationField
            label="Repos entre exercices"
            description="Récupération entre deux exercices. 0 pour enchaîner directement."
            value={settings.restDuration}
            min={LIMITS.restDuration.min}
            max={LIMITS.restDuration.max}
            onCommit={(restDuration) => updateSettings({ restDuration })}
          />
        </div>

        <h2 className={`${display} mt-8 mb-3 text-lg font-bold`}>Séances</h2>
        <SessionsData />

        <h2 className={`${display} mt-8 mb-3 text-lg font-bold`}>Ajouter un exercice</h2>
        <AddExerciseForm />
      </main>
    </div>
  )
}
