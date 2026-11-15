import type { Exercise, Session } from "../../features/session/types"

const exercice1: Exercise = {
  id: "exercice-marche-genou",
  name: "Marche / montées de genoux",
  duration: 60,
  instructions: ["rythme tranquille", "bras actifs", "respiration naturelle"],
  intensity: 2,
  mode: "timed",
  stopSignals: [],
}

const exercice2: Exercise = {
  id: "exercice-hanche-jambe",
  name: "Cercles de hanches + balancements de jambe",
  duration: 90,
  instructions: ["appui au mur", "balancement avant/arrière puis latéral", "amplitude progressive"],
  intensity: [2, 3],
  mode: "timed",
  stopSignals: [],
}

const exercice3: Exercise = {
  id: "exercice-fente",
  name: "Fente basse",
  duration: 45,
  sides: 2,
  instructions: ["genou arrière sur coussin", "bassin légèrement rentré", "buste droit", "souffler en descendant"],
  intensity: [6, 7],
  mode: "timed",
  stopSignals: ["douleur piquante"],
}

const exercice4: Exercise = {
  id: "exercice-pied-fesse",
  name: "Pied vers la fesse",
  duration: 30,
  sides: 2,
  instructions: ["genoux proches", "bassin droit", "tension devant la cuisse, pas dans le genou"],
  intensity: [5, 6],
  mode: "timed",
  stopSignals: ["douleur dans le genou"],
}

const exercice5: Exercise = {
  id: "exercice-papillon",
  name: "Papillon surélevé",
  duration: 120,
  instructions: ["fesses sur coussin", "yeux fermés", "respiration lente", "avant-bras sur les cuisses"],
  intensity: [5, 6],
  mode: "timed",
  stopSignals: ["douleur piquante à l'aine"],
}

const exercice6: Exercise = {
  id: "exercice-adducteurs",
  name: "Adducteurs jambes écartées",
  duration: 40,
  sides: 2,
  instructions: ["dos long", "ne pas s'effondrer", "descendre depuis les hanches"],
  intensity: 6,
  mode: "timed",
  stopSignals: ["douleur piquante"],
}

const exercice7: Exercise = {
  id: "exercice-ischio-jambiers",
  name: "Ischio-jambiers avec serviette",
  duration: 45,
  sides: 2,
  instructions: ["serviette sous le pied", "légère flexion du genou si nécessaire", "bassin au sol"],
  intensity: 6,
  mode: "timed",
  stopSignals: ["douleur piquante"],
}

const exercice8: Exercise = {
  id: "exercice-contraction",
  name: "Contracter-relâcher",
  sides: 2,
  repetitions: 3,
  instructions: ["pousser 5s contre la serviette", "relâcher 2s", "avancer légèrement", "maintenir 15s"],
  intensity: 6,
  mode: "contractRelease",
  stopSignals: ["douleur"],
}

const exercice9: Exercise = {
  id: "exercice-pied-visage",
  name: "Pied vers le visage",
  duration: 40,
  sides: 2,
  instructions: ["tenir", "aller légèrement plus loin", "relâcher légèrement", "bassin au sol"],
  intensity: 6,
  mode: "timed",
  stopSignals: ["douleur"],
}

const exercice10: Exercise = {
  id: "exercice-chat-vache",
  name: "Chat-vache",
  repetitions: 10,
  repetitionDuration: 4,
  instructions: ["position quadrupède", "mouvement lent", "une respiration par mouvement"],
  intensity: 3,
  mode: "repetitions",
  stopSignals: ["douleur"],
}

const exercice11: Exercise = {
  id: "exercice-sphinx",
  name: "Sphinx",
  duration: 40,
  instructions: ["sur le ventre", "appui sur les avant-bras", "arrêter si pincement lombaire"],
  intensity: [3, 4],
  mode: "timed",
  stopSignals: ["pincement lombaire"],
}

const exercice12: Exercise = {
  id: "exercice-fin",
  name: "Retour au calme + pieds",
  duration: 90,
  instructions: ["massage / câlins des pieds", "puis rester assis 30s avant de se relever"],
  intensity: 1,
  mode: "timed",
  stopSignals: [],
}

export const completeSession: Session = {
  id: "seance-complete",
  name: "Séance complète",
  exercises: [exercice1, exercice2, exercice3, exercice4, exercice5, exercice6, exercice7, exercice8, exercice9, exercice10, exercice11, exercice12],
}
