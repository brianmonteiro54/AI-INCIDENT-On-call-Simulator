"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Search, ArrowRight, ChevronLeft } from "lucide-react";
import { playSound } from "@/lib/sound";

interface Props {
  actionName: string;
  pendingCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DecisionConfirmModal({ actionName, pendingCount, onConfirm, onCancel }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[65] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-elev rounded-xl border-amber-500/40 max-w-md w-full overflow-hidden glow-amber"
      >
        <div className="bg-amber-500/10 px-5 py-3 border-b border-amber-500/20 flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
          >
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </motion.div>
          <div className="text-mono text-xs uppercase tracking-widest font-bold text-amber-300">
            chutando no escuro?
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-display text-xl font-bold text-white mb-2">
            Tu não investigou ainda.
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Tem <b className="text-amber-300">{pendingCount} {pendingCount === 1 ? "pista" : "pistas"}</b> ainda sem checar. Sêniores investigam antes de agir — não pra ganhar XP, mas pra <em className="text-acid-400 not-italic">não escolher errado</em>.
          </p>

          <div className="bg-black/40 border border-white/5 rounded-md p-3 mb-5">
            <div className="text-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1">
              tua decisão
            </div>
            <div className="text-white font-semibold text-sm">{actionName}</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => { playSound("click"); onCancel(); }}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>voltar e investigar</span>
            </button>
            <button
              onClick={() => { playSound("click"); onConfirm(); }}
              className="flex-1 btn-ghost flex items-center justify-center gap-2 text-gray-400 border-white/10"
            >
              <span>decidir assim mesmo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-mono text-[10px] text-gray-600 text-center mt-3">
            esc · cancelar
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
