"use client";

import { motion } from "framer-motion";
import type { Incident } from "@/lib/types";

interface Props {
  incident: Incident;
  playerName: string;
}

const SLACK_PERSONAS = [
  { name: "pagerduty", avatar: "🚨", display: "PagerDuty", bot: true, color: "text-duo-red-dark" },
  { name: "amy-cto", avatar: "👩‍💼", display: "Amy (CTO)", color: "text-duo-purple-dark" },
  { name: "ricardo-sre", avatar: "🛠️", display: "Ricardo (SRE)", color: "text-duo-blue-dark" },
  { name: "kate-product", avatar: "📋", display: "Kate (Product)", color: "text-duo-orange-dark" },
  { name: "lucas-support", avatar: "🎧", display: "Lucas (Support)", color: "text-duo-yellow-dark" },
  { name: "diana-legal", avatar: "⚖️", display: "Diana (Legal)", color: "text-duo-green-dark" },
];

export function SlackThread({ incident, playerName }: Props) {
  // Build messages from timeline events + a final "you're up" prompt
  const timeline = incident.timeline?.slice(0, 4) ?? [];

  // First message: PagerDuty alert
  const messages: Array<{
    persona: typeof SLACK_PERSONAS[0];
    time: string;
    text: string;
    tone: "alert" | "bad" | "normal";
  }> = [
    {
      persona: SLACK_PERSONAS[0],
      time: timeline[0]?.t ?? "03:17",
      text: `<b>SEV-${incident.sev} ALERT</b> · ${incident.title.replace(/^🔥\s*/, "")} · customer: ${incident.customer}`,
      tone: "alert",
    },
  ];

  // Map timeline events to messages (skip first which becomes the alert)
  timeline.slice(1).forEach((ev, i) => {
    messages.push({
      persona: SLACK_PERSONAS[(i % (SLACK_PERSONAS.length - 1)) + 1],
      time: ev.t,
      text: ev.ev,
      tone: ev.bad ? "bad" : "normal",
    });
  });

  // Final message from "you"
  const lastTime = timeline[timeline.length - 1]?.t ?? "03:25";
  messages.push({
    persona: { name: "you", avatar: "👤", display: playerName, color: "text-duo-blue-dark" },
    time: lastTime,
    text: "ok, tô analisando. <b>qual a melhor ação agora?</b>",
    tone: "normal",
  });

  return (
    <div className="duo-card overflow-hidden">
      {/* Slack-style channel header */}
      <div className="bg-[#3F0F40] text-white px-4 py-2.5 flex items-center gap-2">
        <div className="text-base font-bold text-white">#</div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-sm leading-tight truncate">{incident.slack.replace("#", "")}</div>
          <div className="text-[10px] opacity-70 leading-tight">canal de war room · 6 pessoas</div>
        </div>
        <div className="flex items-center gap-1 text-[10px] opacity-70">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span>ao vivo</span>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white p-3 sm:p-4 space-y-3">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-2.5"
          >
            <div className={`shrink-0 w-9 h-9 rounded-md flex items-center justify-center text-lg ${
              m.tone === "alert" ? "bg-duo-red-light" :
              m.tone === "bad" ? "bg-duo-orange-light" :
              "bg-duo-line-soft"
            }`}>
              {m.persona.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                <span className={`font-black text-sm ${m.persona.color}`}>{m.persona.display}</span>
                {m.persona.bot && (
                  <span className="text-[9px] font-black uppercase tracking-widest bg-duo-ink-faded text-white px-1 py-0.5 rounded-sm">APP</span>
                )}
                <span className="text-[10px] text-duo-ink-faded font-medium">{m.time} AM</span>
              </div>
              <div
                className={`text-sm font-medium leading-snug ${
                  m.tone === "alert" ? "text-duo-red-dark" :
                  m.tone === "bad" ? "text-duo-orange-dark" :
                  "text-duo-ink"
                } [&_b]:font-black [&_b]:text-current`}
                dangerouslySetInnerHTML={{ __html: m.text }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Slack-style input footer */}
      <div className="bg-duo-line-soft border-t-2 border-duo-line px-4 py-2.5 text-[11px] text-duo-ink-faded font-bold flex items-center gap-2">
        <span>↳</span>
        <span>responder com uma decisão abaixo ↓</span>
      </div>
    </div>
  );
}
