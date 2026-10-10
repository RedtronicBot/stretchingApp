/** Déclenche le téléchargement d'un fichier texte, sans serveur. */
export function downloadTextFile(filename: string, content: string, mimeType = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  // On laisse un instant au navigateur pour démarrer le téléchargement avant de libérer l'URL
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
