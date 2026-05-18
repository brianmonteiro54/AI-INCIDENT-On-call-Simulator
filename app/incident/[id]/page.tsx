"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlayerBar } from "@/components/PlayerBar";
import { AchievementToasts } from "@/components/AchievementToasts";
import { WarRoom } from "@/components/WarRoom";
import { getIncidentById } from "@/lib/incidents";
import { useGame } from "@/lib/store";
import { getLevelIdx } from "@/lib/levels";

export default function IncidentPage() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const player = useGame((s) => s.player);
  const hydrated = useGame((s) => s.hydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const incident = getIncidentById(id);
  const isDaily = search?.get("daily") === "1";

  if (!mounted || !hydrated) {
    return (
      <>
        <PlayerBar />
        <div className="max-w-7xl mx-auto px-6 pt-20 text-center text-mono text-xs text-gray-500">
          carregando…
        </div>
      </>
    );
  }

  if (!incident) {
    return (
      <>
        <PlayerBar />
        <div className="max-w-7xl mx-auto px-6 pt-20 text-center">
          <h1 className="text-display text-3xl font-bold text-blood-400 mb-2">404 · incident not found</h1>
          <p className="text-gray-500 mb-6">Esse incidente não existe.</p>
          <button onClick={() => router.push("/")} className="btn-ghost">
            voltar pro dashboard
          </button>
        </div>
      </>
    );
  }

  const lvlIdx = getLevelIdx(player.xp);
  if (incident.minLevel > lvlIdx) {
    return (
      <>
        <PlayerBar />
        <div className="max-w-7xl mx-auto px-6 pt-20 text-center">
          <h1 className="text-display text-3xl font-bold text-amber-400 mb-2">🔒 locked</h1>
          <p className="text-gray-400 mb-6">
            Tu precisa de level <b>{incident.minLevel + 1}+</b> pra acessar esse incidente.
          </p>
          <button onClick={() => router.push("/")} className="btn-ghost">
            voltar
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <PlayerBar />
      <AchievementToasts />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <WarRoom incident={incident} isDaily={isDaily} />
      </motion.div>
    </>
  );
}
