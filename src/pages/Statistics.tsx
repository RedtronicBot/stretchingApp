import { Link } from "react-router"
import { useHistory } from "../hooks/useHistory"
import { WEEKS_SHOWN, computeGlobalStats } from "../features/history/globalStats"
import type { FeelingKey, WeekStat } from "../features/history/globalStats"
import { formatDuration } from "../utils/formatDuration"

const display = "font-['Bricolage_Grotesque',system-ui,sans-serif]"
const muted = "text-[#5B7079] dark:text-[#93A9B0]"
const card = "rounded-2xl border border-[#CBD8D8] bg-[#F6F9F8] p-4 dark:border-[#26404A] dark:bg-[#172A32]"

const BAR_AREA = 96 // hauteur maximale d'une barre, en px

const FEELINGS: { key: FeelingKey; label: string; swatch: string }[] = [
  { key: "mieux", label: "Mieux", swatch: "bg-[#5E8F73] dark:bg-[#7DB394]" },
  { key: "pareil", label: "Pareil", swatch: "bg-[#93A9B0] dark:bg-[#5B7079]" },
  { key: "moins bien", label: "Moins bien", swatch: "bg-[#D2A45C] dark:bg-[#D8B070]" },
  { key: "unspecified", label: "Non précisé", swatch: "bg-[#CBD8D8] dark:bg-[#26404A]" },
]

const days = (count: number) => `${count} ${count > 1 ? "jours" : "jour"}`

function Streak({ current, best }: { current: number; best: number }) {
  let message: string
  if (current === 0) message = `Pas de série en cours. Ta meilleure : ${days(best)}.`
  else if (current >= best) message = "C'est ta meilleure série."
  else message = `Ta meilleure série : ${days(best)}.`

  return (
    <section aria-label="Série en cours" className="mt-7">
      <p className="flex items-baseline gap-3">
        <span className={`${display} text-[64px] leading-none font-bold`}>{current}</span>
        <span className="text-lg">{current > 1 ? "jours d'affilée" : "jour d'affilée"}</span>
      </p>
      <p className={`mt-2 text-[15px] ${muted}`}>{message}</p>
    </section>
  )
}

function Figure({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="px-4 first:pl-0 last:pr-0">
      <p className={`${display} text-2xl leading-tight font-bold`}>{value}</p>
      <p className={`text-[13px] ${muted}`}>{label}</p>
    </div>
  )
}

function WeeklyChart({ weeks }: { weeks: WeekStat[] }) {
  const max = Math.max(...weeks.map((week) => week.seconds), 1)
  const weekLabel = (week: WeekStat) => week.start.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
  const summary = weeks.map((week) => `semaine du ${weekLabel(week)} : ${formatDuration(week.seconds)}`).join(", ")

  return (
    <div role="img" aria-label={`Temps de pratique par semaine, ${summary}`}>
      {/* Barres, alignées sur une même ligne de base */}
      <div className="flex gap-2" style={{ height: BAR_AREA + 24 }}>
        {weeks.map((week, i) => {
          const isCurrent = i === weeks.length - 1
          const height = week.seconds > 0 ? Math.max(6, Math.round((week.seconds / max) * BAR_AREA)) : 0
          const minutes = Math.max(1, Math.round(week.seconds / 60))
          return (
            <div key={week.start.getTime()} className="flex flex-1 flex-col items-center justify-end">
              {height > 0 ? (
                <>
                  <span className="mb-1 text-[12px]">{minutes}</span>
                  <div
                    className={`w-full rounded-t-md ${isCurrent ? "bg-[#5E8F73] dark:bg-[#7DB394]" : "bg-[#5E8F73]/40 dark:bg-[#7DB394]/40"}`}
                    style={{ height }}
                  />
                </>
              ) : (
                <div className="h-0.5 w-full rounded-full bg-[#CBD8D8] dark:bg-[#26404A]" />
              )}
            </div>
          )
        })}
      </div>

      {/* Dates des lundis */}
      <div className="mt-2 flex gap-2 border-t border-[#CBD8D8] pt-2 dark:border-[#26404A]">
        {weeks.map((week, i) => (
          <span key={week.start.getTime()} className={`flex-1 text-center text-[12px] ${i === weeks.length - 1 ? "font-semibold" : muted}`}>
            {weekLabel(week)}
          </span>
        ))}
      </div>
    </div>
  )
}

function FeelingBreakdown({ counts, total }: { counts: Record<FeelingKey, number>; total: number }) {
  const summary = FEELINGS.filter((feeling) => counts[feeling.key] > 0)
    .map((feeling) => `${feeling.label.toLowerCase()} : ${counts[feeling.key]}`)
    .join(", ")

  return (
    <>
      <div role="img" aria-label={`Ressenti après la séance, ${summary}`} className="flex h-3 gap-0.5 overflow-hidden rounded-full">
        {FEELINGS.filter((feeling) => counts[feeling.key] > 0).map((feeling) => (
          <div key={feeling.key} className={feeling.swatch} style={{ width: `${(counts[feeling.key] / total) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-4 flex flex-col gap-2 text-[15px]">
        {FEELINGS.map((feeling) => (
          <li key={feeling.key} className="flex items-center gap-2.5">
            <span className={`h-2.5 w-2.5 flex-none rounded-full ${feeling.swatch}`} />
            <span className="flex-1">{feeling.label}</span>
            <span className="font-semibold">{counts[feeling.key]}</span>
            <span className={`w-12 text-right text-[13px] ${muted}`}>{Math.round((counts[feeling.key] / total) * 100)} %</span>
          </li>
        ))}
      </ul>
    </>
  )
}

function EmptyState() {
  return (
    <section className="mt-10 rounded-2xl border border-dashed border-[#CBD8D8] p-6 text-center dark:border-[#26404A]">
      <p className={`${display} text-lg font-bold`}>Aucune séance enregistrée</p>
      <p className={`mt-1.5 ${muted}`}>Termine une séance pour voir ici ta régularité et ton ressenti.</p>
      <Link
        to="/catalogue"
        className="mt-5 inline-block rounded-full bg-[#16303A] px-6 py-3 font-semibold text-[#F6F9F8] dark:bg-[#E6EFEF] dark:text-[#0F1E24]"
      >
        Choisir une séance
      </Link>
    </section>
  )
}

export default function Statistics() {
  const history = useHistory()
  const stats = computeGlobalStats(history, new Date())

  return (
    <div className="min-h-screen bg-[#E8EEEE] pt-[env(safe-area-inset-top,0px)] font-['Figtree',system-ui,sans-serif] text-base leading-normal text-[#16303A] dark:bg-[#0F1E24] dark:text-[#E6EFEF]">
      <main className="mx-auto max-w-110 px-5 pt-7 pb-24">
        <header>
          <h1 className={`${display} text-[28px] leading-tight font-bold`}>Statistiques</h1>
          <p className={`mt-1.5 ${muted}`}>Ta régularité, semaine après semaine.</p>
        </header>

        {stats.sessionCount === 0 ? (
          <EmptyState />
        ) : (
          <>
            <Streak current={stats.currentStreak} best={stats.bestStreak} />

            <div className="mt-8 flex border-y border-[#CBD8D8] py-4 dark:border-[#26404A]">
              <Figure value={stats.sessionCount} label={stats.sessionCount > 1 ? "séances" : "séance"} />
              <div className="w-px self-stretch bg-[#CBD8D8] dark:bg-[#26404A]" />
              <Figure value={formatDuration(stats.totalSeconds)} label="au total" />
              <div className="w-px self-stretch bg-[#CBD8D8] dark:bg-[#26404A]" />
              <Figure value={formatDuration(stats.averageSeconds)} label="par séance" />
            </div>

            <h2 className={`${display} mt-8 mb-3 text-lg font-bold`}>Par semaine</h2>
            <div className={card}>
              <WeeklyChart weeks={stats.weeks} />
              <p className={`mt-3 text-[13px] ${muted}`}>Minutes de pratique sur les {WEEKS_SHOWN} dernières semaines.</p>
            </div>

            <h2 className={`${display} mt-8 mb-3 text-lg font-bold`}>Ressenti après la séance</h2>
            <div className={card}>
              <FeelingBreakdown counts={stats.feelings} total={stats.sessionCount} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
