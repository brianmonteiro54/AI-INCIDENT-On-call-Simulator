import type { LevelDef, Grade, Severity } from "./types";

export const LEVELS: LevelDef[] = [
  { name: "Junior", min: 0, max: 500, perks: "casos SEV-2 e SEV-3" },
  { name: "Mid", min: 500, max: 1500, perks: "desbloqueia casos SEV-1" },
  { name: "Senior", min: 1500, max: 3500, perks: "casos avançados" },
  { name: "Staff", min: 3500, max: 8000, perks: "BOSS incidents" },
  { name: "Principal", min: 8000, max: Infinity, perks: "mestre supremo" },
];

export function getLevel(xp: number): LevelDef {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getLevelIdx(xp: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return i;
  }
  return 0;
}

export function getNextLevel(xp: number): LevelDef | null {
  const idx = getLevelIdx(xp);
  if (idx >= LEVELS.length - 1) return null;
  return LEVELS[idx + 1];
}

export function formatTime(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function formatMoney(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return "$" + n.toLocaleString();
  return "$" + Math.round(n);
}

export function gradeColor(g: Grade): string {
  if (g === "A+" || g === "A") return "text-acid-400";
  if (g === "A-" || g === "B") return "text-cyber-400";
  if (g === "B-" || g === "C") return "text-amber-400";
  if (g === "C-" || g === "D") return "text-orange-400";
  return "text-blood-500";
}

export function gradeGlow(g: Grade): string {
  if (g === "A+" || g === "A") return "shadow-[0_0_60px_rgba(52,211,153,0.5)]";
  if (g === "A-" || g === "B") return "shadow-[0_0_60px_rgba(34,211,238,0.4)]";
  if (g === "B-" || g === "C") return "shadow-[0_0_60px_rgba(251,191,36,0.4)]";
  if (g === "C-" || g === "D") return "shadow-[0_0_60px_rgba(251,146,60,0.4)]";
  return "shadow-[0_0_60px_rgba(255,51,85,0.5)]";
}

export function sevColor(s: Severity): string {
  if (s === 0) return "text-fuchsia-400"; // boss
  if (s === 1) return "text-blood-500";
  if (s === 2) return "text-amber-400";
  return "text-cyber-400";
}

export function sevBg(s: Severity): string {
  if (s === 0) return "bg-fuchsia-500";
  if (s === 1) return "bg-blood-500";
  if (s === 2) return "bg-amber-400";
  return "bg-cyber-400";
}

export function sevBgSoft(s: Severity): string {
  if (s === 0) return "bg-fuchsia-500/10 border-fuchsia-500/30";
  if (s === 1) return "bg-blood-500/10 border-blood-500/30";
  if (s === 2) return "bg-amber-400/10 border-amber-400/30";
  return "bg-cyber-400/10 border-cyber-400/30";
}

export function sevLabel(s: Severity): string {
  return s === 0 ? "SEV-0" : `SEV-${s}`;
}

// Daily challenge: deterministic incident-id by date
export function getTodaysDailyId(allIds: string[]): string {
  const now = new Date();
  const seed = now.getUTCFullYear() * 1000 + (now.getUTCMonth() + 1) * 31 + now.getUTCDate();
  return allIds[seed % allIds.length];
}

export function getDailyKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${(now.getUTCMonth() + 1).toString().padStart(2, "0")}-${now
    .getUTCDate()
    .toString()
    .padStart(2, "0")}`;
}
