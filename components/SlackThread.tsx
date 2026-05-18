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

// Pick recap persona based on incident — engineering for tech bugs, legal for compliance, etc.
function recapPersona(incident: Incident) {
  const title = incident.title.toLowerCase();
  if (title.includes("vazamento") || title.includes("viesado") || title.includes("discriminação")) {
    return SLACK_PERSONAS[5]; // Diana (Legal)
  }
  if (title.includes("alucinador") || title.includes("rekognition") || title.includes("loop") || title.includes("cascade")) {
    return SLACK_PERSONAS[2]; // Ricardo (SRE)
  }
  if (title.includes("custo") || title.includes("endpoint") || title.includes("treinamento")) {
    return SLACK_PERSONAS[1]; // Amy (CTO)
  }
  return SLACK_PERSONAS[2]; // default Ricardo
}

function fallbackRecap(incident: Incident): string {
  return `Resumindo o que descobrimos: <b>${incident.short}</b>. Tem que decidir a próxima ação.`;
}

// Don't append "AM" — relative times like "há 2 sem" already look right
function formatTime(t: string): string {
  if (!t) return "agora";
  return t;
}

export function SlackThread({ incident, playerName }: Props) {
  const timeline = incident.timeline?.slice(0, 3) ?? [];

  const messages: Array<{
    persona: typeof SLACK_PERSONAS[0];
    time: string;
    text: string;
    tone: "alert" | "bad" | "normal" | "recap";
  }> = [
    {
      persona: SLACK_PERSONAS[0],
      time: timeline[0]?.t ?? "agora",
      text: `<b>SEV-${incident.sev} ALERT</b> · ${incident.title.replace(/^🔥\s*/, "")} · cliente: ${incident.customer}`,
      tone: "alert",
    },
  ];

  timeline.slice(1).forEach((ev, i) => {
    messages.push({
      persona: SLACK_PERSONAS[(i % (SLACK_PERSONAS.length - 2)) + 1],
      time: ev.t,
      text: ev.ev,
      tone: ev.bad ? "bad" : "normal",
    });
  });

  // ── PROBLEM RECAP ── A teammate restates what was found, so player remembers the issue.
  const recap = incident.slackRecap ?? fallbackRecap(incident);
  const recapBy = recapPersona(incident);
  messages.push({
    persona: recapBy,
    time: "agora",
    text: recap,
    tone: "recap",
  });

  messages.push({
    persona: { name: "you", avatar: "👤", display: playerName, color: "text-duo-blue-dark" },
    time: "agora",
    text: "entendido. <b>qual a melhor ação?</b>",
    tone: "normal",
  });

  return (
    <div className="duo-card overflow-hidden">
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
              m.tone === "recap" ? "bg-duo-yellow-light" :
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
                <span className="text-[10px] text-duo-ink-faded font-medium">{formatTime(m.time)}</span>
              </div>
              {m.tone === "recap" && (
                <div className="mb-1.5 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-duo-yellow-dark bg-duo-yellow-light px-2 py-0.5 rounded-full">
                  📋 resumo do que descobrimos
                </div>
              )}
              <div
                className={`text-sm font-medium leading-snug ${
                  m.tone === "alert" ? "text-duo-red-dark" :
                  m.tone === "bad" ? "text-duo-orange-dark" :
                  "text-duo-ink"
                } [&_b]:font-black [&_b]:text-current [&_code]:bg-duo-yellow-light [&_code]:text-duo-ink [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-mono [&_code]:font-bold [&_code]:text-xs`}
                dangerouslySetInnerHTML={{ __html: m.text }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-duo-line-soft border-t-2 border-duo-line px-4 py-2.5 text-[11px] text-duo-ink-faded font-bold flex items-center gap-2">
        <span>↳</span>
        <span>responder com uma decisão abaixo ↓</span>
      </div>
    </div>
  );
}
