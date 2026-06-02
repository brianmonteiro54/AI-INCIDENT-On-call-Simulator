import type { Achievement, Grade } from "./types";

// Total number of missions in the game — used by completionist & all-aplus.
// Update if missions are added.
const TOTAL_MISSIONS = 19;
const HALF_MISSIONS = 10;

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-blood",
    title: "Primeiro Sangue",
    description: "Resolveu o primeiro incidente",
    icon: "🩸",
    check: ({ history }) => history.length >= 1,
  },
  {
    id: "perfect-start",
    title: "Estreia Perfeita",
    description: "A+ no primeiro incidente",
    icon: "✨",
    check: ({ history }) => history.length >= 1 && history[0].grade === "A+",
  },
  {
    id: "no-blame",
    title: "Blameless Engineer",
    description: "5 incidentes resolvidos sem nenhuma nota F",
    icon: "🕊️",
    check: ({ history }) =>
      history.length >= 5 && !history.some((h) => h.grade === "F"),
  },
  {
    id: "speed-runner",
    title: "Speed Runner",
    description: "Resolveu uma missão em menos de 90 segundos",
    icon: "⚡",
    check: ({ history }) => history.some((h) => h.elapsed > 0 && h.elapsed < 90),
  },
  {
    id: "frugal",
    title: "Olho na Conta",
    description: "Economizou mais de $200k pra clientes",
    icon: "🦅",
    check: ({ player }) => player.totalSaved >= 200_000,
  },
  {
    id: "millionaire",
    title: "Milionário do Save",
    description: "Mais de $1M economizado pra clientes",
    icon: "💰",
    check: ({ player }) => player.totalSaved >= 1_000_000,
  },
  {
    id: "five-aplus",
    title: "Mestre da Sequência",
    description: "5 A+ consecutivos",
    icon: "🔥",
    check: ({ history }) => {
      let streak = 0;
      let best = 0;
      for (const h of history) {
        if (h.grade === "A+") {
          streak++;
          best = Math.max(best, streak);
        } else streak = 0;
      }
      return best >= 5;
    },
  },
  {
    id: "investigator",
    title: "O Investigador",
    description: "Investigou tudo antes de decidir em 3 incidentes",
    icon: "🔍",
    check: ({ history }) => history.filter((h) => h.perfect).length >= 3,
  },
  {
    id: "daily-warrior",
    title: "Daily Warrior",
    description: "7 daily challenges completados",
    icon: "📅",
    check: ({ history }) => history.filter((h) => h.isDaily).length >= 7,
  },
  {
    id: "boss-slayer",
    title: "Boss Slayer",
    description: "Sobreviveu ao CASCADE com A+",
    icon: "👑",
    check: ({ history }) =>
      history.some((h) => h.id === "the-cascade" && h.grade === "A+"),
  },
  {
    id: "halfway",
    title: "Meio do Caminho",
    description: `Resolveu ${HALF_MISSIONS} incidentes`,
    icon: "🚀",
    check: ({ history }) => {
      const ids = new Set(history.map((h) => h.id));
      return ids.size >= HALF_MISSIONS;
    },
  },
  {
    id: "completionist",
    title: "Completionist",
    description: `Resolveu todas as ${TOTAL_MISSIONS} missões`,
    icon: "💎",
    check: ({ history }) => {
      const ids = new Set(history.map((h) => h.id));
      return ids.size >= TOTAL_MISSIONS;
    },
  },
  {
    id: "all-aplus",
    title: "Intocável",
    description: `A+ em todas as ${TOTAL_MISSIONS} missões`,
    icon: "🌟",
    check: ({ history }) => {
      const bestByIncident: Record<string, Grade> = {};
      for (const h of history) {
        const cur = bestByIncident[h.id];
        if (!cur || gradeRank(h.grade) > gradeRank(cur)) {
          bestByIncident[h.id] = h.grade;
        }
      }
      const ids = Object.keys(bestByIncident);
      return ids.length >= TOTAL_MISSIONS && ids.every((id) => bestByIncident[id] === "A+");
    },
  },
];

export const GRADES_ORDER: Grade[] = ["F", "D", "C-", "C", "B-", "B", "A-", "A", "A+"];

export function gradeRank(g: Grade): number {
  return GRADES_ORDER.indexOf(g);
}
