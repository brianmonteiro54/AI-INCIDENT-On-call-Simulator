import type { Achievement, Grade } from "./types";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-blood",
    title: "First Blood",
    description: "Resolveu o primeiro incidente",
    icon: "🩸",
    check: ({ history }) => history.length >= 1,
  },
  {
    id: "perfect-start",
    title: "Perfect Start",
    description: "A+ no primeiro incidente",
    icon: "✨",
    check: ({ history }) => history.length >= 1 && history[0].grade === "A+",
  },
  {
    id: "no-blame",
    title: "Blameless Engineer",
    description: "5 incidentes resolvidos sem nenhum F",
    icon: "🕊️",
    check: ({ history }) =>
      history.length >= 5 && !history.some((h) => h.grade === "F"),
  },
  {
    id: "speed-runner",
    title: "Speed Runner",
    description: "Resolveu um incidente em menos de 3 minutos elapsed-game",
    icon: "⚡",
    check: ({ history }) => history.some((h) => h.elapsed < 60 * 18),
  },
  {
    id: "frugal",
    title: "Cost Hawk",
    description: "Economizou mais de $200k acumulado",
    icon: "🦅",
    check: ({ player }) => player.totalSaved >= 200_000,
  },
  {
    id: "millionaire",
    title: "Millionaire Saver",
    description: "Mais de $1M economizado pra clientes",
    icon: "💰",
    check: ({ player }) => player.totalSaved >= 1_000_000,
  },
  {
    id: "five-aplus",
    title: "Streak Master",
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
    title: "The Investigator",
    description: "Investigou antes de agir em 3 incidentes",
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
    id: "completionist",
    title: "Completionist",
    description: "Resolveu todos os 9 incidentes",
    icon: "💎",
    check: ({ history }) => {
      const ids = new Set(history.map((h) => h.id));
      return ids.size >= 9;
    },
  },
  {
    id: "all-aplus",
    title: "Untouchable",
    description: "A+ em todos os 9 incidentes",
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
      return ids.length >= 9 && ids.every((id) => bestByIncident[id] === "A+");
    },
  },
];

export const GRADES_ORDER: Grade[] = ["F", "D", "C-", "C", "B-", "B", "A-", "A", "A+"];

export function gradeRank(g: Grade): number {
  return GRADES_ORDER.indexOf(g);
}
