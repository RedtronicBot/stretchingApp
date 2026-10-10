import defaultFile from "../../data/session/defaultSessions.json"
import { sessionsFileSchema } from "./schema"
import type { Exercise, Session } from "./schema"

const STORAGE_KEY = "sessions"

/** Les séances livrées avec l'appli. Si ce fichier est invalide, c'est une erreur de développement : on laisse planter. */
function defaultSessions(): Session[] {
  return sessionsFileSchema.parse(defaultFile).sessions
}

/**
 * Premier lancement, contenu illisible ou invalide : séances par défaut.
 * Liste vide enregistrée par l'utilisateur (via un import) : on la respecte.
 */
function read(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return defaultSessions()
    const result = sessionsFileSchema.safeParse(JSON.parse(raw))
    return result.success ? result.data.sessions : defaultSessions()
  } catch {
    return defaultSessions()
  }
}

let sessions: Session[] = read()
const listeners = new Set<() => void>()

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getSnapshot() {
  return sessions
}

/** Retourne false si la sauvegarde dans le navigateur a échoué (les séances restent utilisables jusqu'au rechargement). */
function commit(next: Session[]): boolean {
  sessions = next
  let saved = true
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, sessions: next }))
  } catch {
    saved = false
  }
  listeners.forEach((listener) => listener())
  return saved
}

/** Remplace toutes les séances. À n'appeler qu'avec des données déjà validées par sessionsFileSchema. */
export function replaceSessions(next: Session[]): boolean {
  return commit(next)
}

/** Revient aux séances livrées avec l'appli. */
export function resetSessions(): boolean {
  return commit(defaultSessions())
}

/** Ajoute un exercice à la fin d'une séance. L'exercice doit déjà avoir été validé par exerciseSchema. */
export function addExercise(sessionId: string, exercise: Exercise): boolean {
  return commit(sessions.map((session) => (session.id === sessionId ? { ...session, exercises: [...session.exercises, exercise] } : session)))
}
