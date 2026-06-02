"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { m } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { AchievementToasts } from "@/components/AchievementToasts";
import { WarRoom } from "@/components/WarRoom";
import { Mascot } from "@/components/Mascot";
import { getIncidentById } from "@/lib/incidents";
import { useGame } from "@/lib/store";
import { getLevelIdx } from "@/lib/levels";

export default function IncidentPage() {
  const params = useParams();
  const search = useSearchParams();
  const player = useGame((s) => s.player);
  const hydrated = useGame((s) => s.hydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const incident = getIncidentById(id);
  const isDaily = search?.get("daily") === "1";

  if (!mounted || !hydrated) {
    return (
      <div className="min-h-screen bg-duo-cream flex items-center justify-center">
        <div className="text-center">
          <Mascot expression="thinking" size={120} />
          <div className="mt-3 text-duo-ink-soft font-bold text-sm">carregando incidente…</div>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-duo-cream flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <Mascot expression="sad" size={140} className="mx-auto mb-4" />
          <div className="text-xs font-black uppercase tracking-widest text-duo-red-dark mb-2">404 · não encontrado</div>
          <h1 className="text-display text-3xl sm:text-4xl font-black text-duo-ink mb-3">missão não existe</h1>
          <p className="text-duo-ink-soft mb-6 font-medium">
            essa missão não existe ou já foi resolvida por outra pessoa.
          </p>
          <Link href="/" className="duo-btn duo-green inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span>voltar pra home</span>
          </Link>
        </div>
      </div>
    );
  }

  const lvlIdx = getLevelIdx(player.xp);
  if (incident.minLevel > lvlIdx) {
    return (
      <div className="min-h-screen bg-duo-cream flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <Mascot expression="thinking" size={140} className="mx-auto mb-4" />
          <div className="text-xs font-black uppercase tracking-widest text-duo-yellow-dark mb-2">🔒 missão bloqueada</div>
          <h1 className="text-display text-3xl sm:text-4xl font-black text-duo-ink mb-3">ainda não!</h1>
          <p className="text-duo-ink-soft mb-6 font-medium">
            essa missão precisa de <b className="text-duo-yellow-dark">level {incident.minLevel + 1}+</b>. continua resolvendo as missões anteriores pra ganhar XP.
          </p>
          <Link href="/" className="duo-btn duo-green inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span>voltar pra home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <AchievementToasts />
      <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <WarRoom incident={incident} isDaily={isDaily} />
      </m.div>
    </>
  );
}
