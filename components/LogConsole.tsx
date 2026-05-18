"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { LogLine } from "@/lib/types";

interface Props {
  logs: LogLine[];
}

const LV_COLOR: Record<LogLine["lv"], string> = {
  INF: "text-cyber-400",
  WRN: "text-amber-400",
  ERR: "text-blood-400",
  OK: "text-acid-400",
};

export function LogConsole({ logs }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);

  return (
    <div
      ref={ref}
      className="bg-black/70 border border-white/5 rounded-md text-mono text-[11px] leading-relaxed p-3 max-h-60 overflow-y-auto crt-flicker"
      style={{ scrollBehavior: "smooth" }}
    >
      {logs.map((log, i) => (
        <motion.div
          key={`${i}-${log.ts}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.18, duration: 0.2 }}
          className="flex items-start gap-2 py-0.5"
        >
          <span className="text-gray-600 shrink-0 w-[68px]">{log.ts}</span>
          <span className={`shrink-0 w-9 font-bold ${LV_COLOR[log.lv]}`}>{log.lv}</span>
          <span
            className="text-gray-300 break-words [&_b]:text-white [&_b]:font-semibold"
            dangerouslySetInnerHTML={{ __html: log.msg }}
          />
        </motion.div>
      ))}
    </div>
  );
}
