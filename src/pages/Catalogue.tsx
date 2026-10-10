import { Play } from "lucide-react"
import { exerciseDuration, sessionDuration } from "../features/session/timeline"
import type { Session } from "../features/session/types"
import { formatTimer } from "../utils/formatTimer"
import { useState } from "react"
import { Link } from "react-router"
import { useSettings } from "../hooks/useSettings"
import { useSessions } from "../hooks/useSessions"

const display = "font-['Bricolage_Grotesque',system-ui,sans-serif]"

function SessionCard({ session, isOpen, onToggle }: { session: Session; isOpen: boolean; onToggle: () => void }) {
  const { settings } = useSettings()
  return (
    <div className="overflow-hidden rounded-2xl border border-[#CBD8D8] bg-[#F6F9F8] dark:border-[#26404A] dark:bg-[#172A32]">
      <div className="flex items-center gap-3">
        <Link to={`/session/${session.id}`} aria-label={`Lancer ${session.name}`} className="py-4 pl-4">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#5E8F73] text-[#F6F9F8] dark:bg-[#7DB394] dark:text-[#0F1E24]">
            <Play />
          </span>
        </Link>
        <button
          type="button"
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 items-center gap-3 self-stretch pr-4 text-left"
          onClick={onToggle}
        >
          <span className="min-w-0 flex-1">
            <span className={`${display} block truncate text-base font-bold`}>{session.name}</span>
          </span>
          <span className="flex flex-none flex-col items-end gap-1">
            <span className="text-sm font-semibold">{formatTimer(sessionDuration(session, settings))}</span>
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-[#CBD8D8] px-4 pt-1 pb-4 dark:border-[#26404A]">
          {session.exercises.map((exercise, i) => (
            <div
              key={exercise.id}
              className={`flex items-center justify-between gap-3 py-2 text-[15px] ${i > 0 ? "border-t border-[#CBD8D8]/60 dark:border-[#26404A]/60" : ""}`}
            >
              <span className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 flex-none rounded-full bg-[#5E8F73] dark:bg-[#7DB394]" />
                {exercise.name}
              </span>
              <span className="flex-none text-[#5B7079] dark:text-[#93A9B0]">
                {formatTimer(exerciseDuration(exercise, settings.transitionDuration))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Catalogue() {
  const sessions = useSessions()
  const [openId, setOpenId] = useState<string | null>(sessions[0]?.id ?? null)
  return (
    <div className="min-h-screen bg-[#E8EEEE] pt-[env(safe-area-inset-top,0px)] font-['Figtree',system-ui,sans-serif] text-base leading-normal text-[#16303A] dark:bg-[#0F1E24] dark:text-[#E6EFEF]">
      <main className="mx-auto max-w-110 px-5 pt-7 pb-24">
        {/* En-tête */}
        <header>
          <h1 className={`${display} text-[28px] leading-tight font-bold`}>Catalogue</h1>
          <p className="mt-1.5 text-[#5B7079] dark:text-[#93A9B0]">Choisis un format à lancer.</p>
        </header>

        {/* Liste des formats */}
        <h2 className={`${display} mt-8 mb-3 text-lg font-bold`}>Tes formats</h2>
        {sessions.length === 0 && (
          <p className="text-[#5B7079] dark:text-[#93A9B0]">Aucune séance pour l'instant. Importe un fichier depuis les Réglages.</p>
        )}
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isOpen={session.id === openId}
              onToggle={() => setOpenId(session.id === openId ? null : session.id)}
            />
          ))}
        </div>

        {/* Rappel sécurité */}
        <div className="mt-8 rounded-2xl border border-[#CBD8D8] bg-[#F6F9F8] p-4 text-[15px] text-[#5B7079] dark:border-[#26404A] dark:bg-[#172A32] dark:text-[#93A9B0]">
          Sensation forte mais respirable, jamais piquante. Arrête-toi si ça pince à l'aine, au genou ou au bas du dos.
        </div>
      </main>
    </div>
  )
}
