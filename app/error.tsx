"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home } from "lucide-react";
import { Mascot } from "@/components/Mascot";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for debugging — without exposing internals to the player.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-duo-cream flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <Mascot expression="sad" size={120} />
        <h1 className="mt-4 font-display font-black text-2xl sm:text-3xl text-duo-ink">
          Eita, algo quebrou aqui
        </h1>
        <p className="mt-2 text-duo-ink-soft font-medium leading-snug">
          Deu um erro inesperado nesse incidente. Pode tentar de novo — seu progresso está salvo.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="duo-btn duo-green inline-flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <RotateCcw size={18} strokeWidth={3} />
            Tentar de novo
          </button>
          <Link
            href="/"
            className="duo-btn duo-blue inline-flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Home size={18} strokeWidth={3} />
            Voltar pra home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-5 text-xs text-duo-ink-faded font-mono">ref: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
