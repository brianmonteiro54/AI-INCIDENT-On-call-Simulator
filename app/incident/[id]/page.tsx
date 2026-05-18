"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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
      <div className="min-h-screen flex items-center justify-center text-mono text-xs text-gray-500">
        ● connecting to incident channel…
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-mono text-[10px] uppercase tracking-[0.3em] text-blood-400 mb-3">404 · not found</div>
          <h1 className="text-display text-5xl sm:text-7xl font-black text-white mb-4">no signal.</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">esse incidente não existe ou foi resolvido por outra pessoa.</p>
          <Link href="/" className="btn-ghost">← back to dashboard</Link>
        </div>
      </div>
    );
  }

  const lvlIdx = getLevelIdx(player.xp);
  if (incident.minLevel > lvlIdx) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-mono text-[10px] uppercase tracking-[0.3em] text-amber-400 mb-3">access denied · level gate</div>
          <h1 className="text-display text-5xl sm:text-7xl font-black text-white mb-4">not yet.</h1>
          <p className="text-gray-400 mb-8">
            esse incidente requer <b className="text-amber-300">level {incident.minLevel + 1}</b> ou superior. continua acumulando XP nos cases anteriores.
          </p>
          <Link href="/" className="btn-ghost">← back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <AchievementToasts />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <WarRoom incident={incident} isDaily={isDaily} />
      </motion.div>
    </>
  );
}
