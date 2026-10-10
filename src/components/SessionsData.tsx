import { useCallback, useState } from "react"
import ConfirmDialog from "./ConfirmDialog"
import ErrorNotice from "./ErrorNotice"
import { useSessions } from "../hooks/useSessions"
import { replaceSessions, resetSessions } from "../features/session/store"
import { parseSessionsFile, serializeSessions } from "../features/session/sessionsFile"
import type { Session } from "../features/session/schema"
import { downloadTextFile } from "../utils/downloadFile"

const display = "font-['Bricolage_Grotesque',system-ui,sans-serif]"
const muted = "text-[#5B7079] dark:text-[#93A9B0]"
const MAX_FILE_SIZE = 1_000_000 // 1 Mo

const secondaryButton =
  "rounded-full border border-[#CBD8D8] px-4 py-2 text-[15px] font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#5E8F73] disabled:opacity-40 dark:border-[#26404A] dark:focus-visible:outline-[#7DB394]"

const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? "s" : ""}`

function ActionRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#CBD8D8] bg-[#F6F9F8] p-4 dark:border-[#26404A] dark:bg-[#172A32]">
      <div className="min-w-0 flex-1">
        <p className={`${display} text-base font-bold`}>{title}</p>
        <p className={`mt-0.5 text-[13px] ${muted}`}>{description}</p>
      </div>
      <div className="flex-none">{children}</div>
    </div>
  )
}

export default function SessionsData() {
  const sessions = useSessions()
  const [pendingImport, setPendingImport] = useState<Session[] | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [status, setStatus] = useState<string | null>(null)

  const cancelImport = useCallback(() => setPendingImport(null), [])
  const cancelReset = useCallback(() => setConfirmReset(false), [])

  const handleExport = () => {
    downloadTextFile(`seances-${new Date().toLocaleDateString("sv-SE")}.json`, serializeSessions(sessions))
    setErrors([])
    setStatus("Fichier exporté.")
  }

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = "" // permet de choisir deux fois le même fichier
    if (!file) return

    setStatus(null)
    if (file.size > MAX_FILE_SIZE) {
      setErrors(["Ce fichier est trop volumineux (1 Mo maximum)."])
      return
    }

    const result = parseSessionsFile(await file.text())
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setErrors([])
    setPendingImport(result.sessions)
  }

  const confirmImport = () => {
    if (pendingImport === null) return
    const saved = replaceSessions(pendingImport)
    setStatus(
      saved
        ? `${plural(pendingImport.length, "séance")} importée${pendingImport.length > 1 ? "s" : ""}.`
        : "Importé, mais la sauvegarde dans ce navigateur a échoué : les séances disparaîtront au rechargement.",
    )
    setPendingImport(null)
  }

  const confirmResetSessions = () => {
    const saved = resetSessions()
    setErrors([])
    setStatus(saved ? "Séances par défaut restaurées." : "Restaurées, mais la sauvegarde dans ce navigateur a échoué.")
    setConfirmReset(false)
  }

  const importedExerciseCount = pendingImport?.reduce((total, session) => total + session.exercises.length, 0) ?? 0

  return (
    <>
      <div className="flex flex-col gap-3">
        <ActionRow title="Exporter" description="Télécharge tes séances dans un fichier JSON, pour les sauvegarder ou les partager.">
          <button type="button" onClick={handleExport} disabled={sessions.length === 0} className={secondaryButton}>
            Exporter
          </button>
        </ActionRow>

        <ActionRow title="Importer" description="Remplace tes séances par celles d'un fichier JSON. Ton historique est conservé.">
          <label className={`${secondaryButton} inline-block cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-[#5E8F73]`}>
            Importer
            <input type="file" accept="application/json,.json" onChange={handleFile} className="sr-only" />
          </label>
        </ActionRow>

        <ActionRow title="Séances par défaut" description="Revient aux séances livrées avec l'appli.">
          <button type="button" onClick={() => setConfirmReset(true)} className={secondaryButton}>
            Restaurer
          </button>
        </ActionRow>
      </div>

      <ErrorNotice title="Import impossible, rien n'a été modifié." errors={errors} />
      {status && (
        <p role="status" className={`mt-3 text-[15px] ${muted}`}>
          {status}
        </p>
      )}

      {pendingImport !== null && (
        <ConfirmDialog
          title="Remplacer tes séances ?"
          message={
            pendingImport.length === 0
              ? "Le fichier ne contient aucune séance : toutes tes séances actuelles seront supprimées. Ton historique est conservé."
              : `Le fichier contient ${plural(pendingImport.length, "séance")} (${plural(importedExerciseCount, "exercice")}). Elles remplaceront toutes tes séances actuelles. Ton historique est conservé.`
          }
          confirmLabel="Remplacer"
          onConfirm={confirmImport}
          onCancel={cancelImport}
        />
      )}

      {confirmReset && (
        <ConfirmDialog
          title="Restaurer les séances par défaut ?"
          message="Tes séances actuelles seront remplacées par celles livrées avec l'appli. Ton historique est conservé."
          confirmLabel="Restaurer"
          onConfirm={confirmResetSessions}
          onCancel={cancelReset}
        />
      )}
    </>
  )
}
