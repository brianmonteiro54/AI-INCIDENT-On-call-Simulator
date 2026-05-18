import type { LevelDef, Severity } from "./types";

export const LEVELS: LevelDef[] = [
  { name: "Junior", min: 0, max: 400, perks: "missões básicas — 1 serviço por vez" },
  { name: "Mid", min: 400, max: 1200, perks: "desbloqueia algoritmos e inferência" },
  { name: "Senior", min: 1200, max: 2400, perks: "métricas e otimização de custo" },
  { name: "Staff", min: 2400, max: 4500, perks: "Bedrock, segurança e IA responsável" },
  { name: "Principal", min: 4500, max: Infinity, perks: "mestre supremo · todas missões" },
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
