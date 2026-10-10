import { Link } from "react-router"
import { useSessions } from "../hooks/useSessions"
import { sessionDuration } from "../features/session/timeline"
import { useSettings } from "../hooks/useSettings"
import { formatTimer } from "../utils/formatTimer"
import { useHistory } from "../hooks/useHistory"
import { formatRelativeDate } from "../utils/formatRelativeDate"
import { summarizeWeek, type DayState } from "../features/history/stats"

type Day = { letter: string; state: DayState }

const display = "font-['Bricolage_Grotesque',system-ui,sans-serif]"

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-[#5E8F73]/20 px-2.5 py-0.5 text-[13px] whitespace-nowrap dark:bg-[#7DB394]/20">{children}</span>
}

function DayDot({ day }: { day: Day }) {
  const done = day.state === "done"
  const isToday = day.state === "today"
  return (
    <div
      className={`flex-1 text-center text-[13px] ${isToday ? "font-semibold text-[#16303A] dark:text-[#E6EFEF]" : "text-[#5B7079] dark:text-[#93A9B0]"}`}
    >
      <div>{day.letter}</div>
      <div
        className={`mx-auto mt-1.5 flex aspect-square w-full max-w-10 items-center justify-center rounded-full text-sm ${
          done
            ? "border-[1.5px] border-[#5E8F73] bg-[#5E8F73] text-[#F6F9F8] dark:border-[#7DB394] dark:bg-[#7DB394] dark:text-[#0F1E24]"
            : isToday
              ? "border-2 border-[#16303A] dark:border-[#E6EFEF]"
              : "border-[1.5px] border-[#CBD8D8] dark:border-[#26404A]"
        }`}
      >
        {done ? "✓" : ""}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { settings } = useSettings()
  const sessions = useSessions()
  const session = sessions[0]
  const history = useHistory()
  const latest = [...history].sort((a, b) => b.endDate - a.endDate).slice(0, 3)
  const summary = summarizeWeek(history, new Date())
  const todayLabel = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
  return (
    <div className="min-h-screen bg-[#E8EEEE] pt-[env(safe-area-inset-top,0px)] font-['Figtree',system-ui,sans-serif] text-base leading-normal text-[#16303A] dark:bg-[#0F1E24] dark:text-[#E6EFEF]">
      <main className="mx-auto max-w-110 px-5 pt-7 pb-24">
        {/* En-tête */}
        <header>
          <p className="mt-1.5 text-[#5B7079] first-letter:uppercase dark:text-[#93A9B0]">
            {todayLabel} · {summary.sessionCount} {summary.sessionCount > 1 ? "séances" : "séance"} cette semaine
          </p>
        </header>

        {/* Séance du jour */}
        {session ? (
          <section aria-label="Séance du jour" className="mt-7 mb-2 text-center">
            <Link
              to={`/session/${session.id}`}
              className="mx-auto flex h-52.5 w-52.5 cursor-pointer flex-col items-center justify-center rounded-full bg-[#5E8F73] text-[#F6F9F8] shadow-[0_0_0_14px_rgba(94,143,115,0.22),0_0_0_30px_rgba(94,143,115,0.10)] focus-visible:outline-2 focus-visible:outline-offset-34 focus-visible:outline-[#16303A] dark:bg-[#7DB394] dark:text-[#0F1E24] dark:shadow-[0_0_0_14px_rgba(125,179,148,0.22),0_0_0_30px_rgba(125,179,148,0.10)] dark:focus-visible:outline-[#E6EFEF]"
            >
              <span className={`${display} text-[30px] leading-tight font-bold`}>{session.name}</span>
              <span className="mt-1 text-[15px] opacity-90">
                {formatTimer(sessionDuration(session, settings))} · {session.exercises.length} exercices
              </span>
            </Link>
            <p className="mt-11 font-semibold text-[#16303A] dark:text-[#E6EFEF]">Appuie pour commencer.</p>
          </section>
        ) : (
          <section className="mt-7 mb-2 rounded-2xl border border-dashed border-[#CBD8D8] p-6 text-center dark:border-[#26404A]">
            <p className={`${display} text-lg font-bold`}>Aucune séance disponible</p>
            <p className="mt-1.5 text-[#5B7079] dark:text-[#93A9B0]">Importe un fichier de séances depuis les Réglages.</p>
            <Link
              to="/settings"
              className="mt-5 inline-block rounded-full bg-[#16303A] px-6 py-3 font-semibold text-[#F6F9F8] dark:bg-[#E6EFEF] dark:text-[#0F1E24]"
            >
              Ouvrir les Réglages
            </Link>
          </section>
        )}

        {/* Semaine */}
        <h2 className={`${display} mt-8 mb-3 text-lg font-bold`}>Cette semaine</h2>
        <div className="flex justify-between gap-1.5">
          {summary.days.map((day, i) => (
            <DayDot key={i} day={day} />
          ))}
        </div>
        <p className="mt-3 text-[15px] text-[#5B7079] dark:text-[#93A9B0]">{Math.round(summary.totalSeconds / 60)} min cumulées</p>

        {/* Dernières séances */}
        <h2 className={`${display} mt-8 mb-3 text-lg font-bold`}>Dernières séances</h2>
        <div className="rounded-2xl border border-[#CBD8D8] bg-[#F6F9F8] p-4 dark:border-[#26404A] dark:bg-[#172A32]">
          {latest.map((record, i) => (
            <div
              key={record.id}
              className={`flex items-baseline justify-between gap-3 ${i > 0 ? "mt-2.5 border-t border-[#CBD8D8] pt-2.5 dark:border-[#26404A]" : ""}`}
            >
              <div>
                <b>{formatRelativeDate(record.endDate)}</b>
                <br />
                <small className="text-[13px] text-[#5B7079] dark:text-[#93A9B0]">
                  {sessions.find((session) => session.id === record.sessionId)?.name ?? "Séance inconnue"} · {formatTimer(record.actualDuration)}
                </small>
              </div>
              <Tag>Dos : {record.feeling === undefined ? "Non précisé" : record.feeling}</Tag>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
