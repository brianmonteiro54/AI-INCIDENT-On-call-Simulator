"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Player, IncidentResult, Grade } from "./types";
import { gradeRank, ACHIEVEMENTS } from "./achievements";
import { setSoundEnabled } from "./sound";

interface GameState {
  player: Player;
  history: IncidentResult[];
  hydrated: boolean;
  newAchievements: string[];

  setName: (name: string) => void;
  setSoundOn: (on: boolean) => void;
  recordResult: (r: IncidentResult) => void;
  clearNewAchievements: () => void;
  reset: () => void;
  setHydrated: (b: boolean) => void;
}

const initialPlayer: Player = {
  name: "anon",
  xp: 0,
  totalSaved: 0,
  totalCost: 0,
  streak: 0,
  lastDailyAt: null,
  achievements: [],
  soundOn: true,
};

function evalAchievements(player: Player, history: IncidentResult[]): { player: Player; newOnes: string[] } {
  const newOnes: string[] = [];
  const updated = { ...player, achievements: [...player.achievements] };
  for (const ach of ACHIEVEMENTS) {
    if (!updated.achievements.includes(ach.id) && ach.check({ player: updated, history })) {
      updated.achievements.push(ach.id);
      newOnes.push(ach.id);
    }
  }
  return { player: updated, newOnes };
}

function bestGradeByIncident(history: IncidentResult[]): Record<string, Grade> {
  const out: Record<string, Grade> = {};
  for (const h of history) {
    const cur = out[h.id];
    if (!cur || gradeRank(h.grade) > gradeRank(cur)) out[h.id] = h.grade;
  }
  return out;
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      player: initialPlayer,
      history: [],
      hydrated: false,
      newAchievements: [],

      setName: (name: string) =>
        set((s) => ({ player: { ...s.player, name: name.trim() || "anon" } })),

      setSoundOn: (on: boolean) => {
        setSoundEnabled(on);
        set((s) => ({ player: { ...s.player, soundOn: on } }));
      },

      recordResult: (r: IncidentResult) => {
        const { player, history } = get();
        const nextHistory = [...history, r];

        // streak: consecutive A+ from end
        let streak = 0;
        for (let i = nextHistory.length - 1; i >= 0; i--) {
          if (nextHistory[i].grade === "A+") streak++;
          else break;
        }

        const nextPlayer: Player = {
          ...player,
          xp: player.xp + r.xp,
          totalSaved: player.totalSaved + r.saved,
          totalCost: player.totalCost + r.cost,
          streak,
          lastDailyAt: r.isDaily ? Date.now() : player.lastDailyAt,
        };

        const evaluated = evalAchievements(nextPlayer, nextHistory);
        set({
          player: evaluated.player,
          history: nextHistory,
          newAchievements: evaluated.newOnes,
        });
      },

      clearNewAchievements: () => set({ newAchievements: [] }),

      reset: () => set({ player: initialPlayer, history: [], newAchievements: [] }),

      setHydrated: (b: boolean) => set({ hydrated: b }),
    }),
    {
      name: "ai-incident-v2",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} } as unknown as Storage)),
      partialize: (s) => ({ player: s.player, history: s.history }),
      onRehydrateStorage: () => (state, error) => {
        // Always mark hydrated even if state is null (first visit) or errored
        if (state) {
          state.setHydrated(true);
          setSoundEnabled(state.player.soundOn ?? true);
        } else {
          // No persisted state — manually trigger hydrated after a tick
          setTimeout(() => {
            try { useGame.setState({ hydrated: true }); } catch {}
          }, 0);
        }
        if (error) console.error("rehydrate error", error);
      },
    }
  )
);

export { bestGradeByIncident };
