import { formatIssues } from "./issues"
import { sessionsFileSchema } from "./schema"
import type { Session } from "./schema"

export type ParseResult = { ok: true; sessions: Session[] } | { ok: false; errors: string[] }

/** Lit le texte d'un fichier de séances. Ne lève jamais d'exception : retourne soit les séances, soit des messages d'erreur. */
export function parseSessionsFile(text: string): ParseResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, errors: ["Ce fichier n'est pas un JSON valide."] }
  }

  const result = sessionsFileSchema.safeParse(data)
  if (!result.success) return { ok: false, errors: formatIssues(result.error) }
  return { ok: true, sessions: result.data.sessions }
}

/** Le contenu du fichier exporté : le même format que celui qu'on sait importer. */
export function serializeSessions(sessions: Session[]): string {
  return JSON.stringify({ version: 1, sessions }, null, 2) + "\n"
}
