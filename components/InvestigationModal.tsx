"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Terminal,
  GitBranch,
  MessageSquare,
  Database,
  Settings,
  Bell,
  Sheet,
  GitCommit,
  Mail,
  Workflow,
  FileText,
  Check,
} from "lucide-react";
import type { Finding } from "@/lib/types";
import { playSound } from "@/lib/sound";

interface ToolSkin {
  app: string;
  tab: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: string; // tailwind text color class
  border: string; // tailwind border color class
  glow: string;   // tailwind box shadow / glow
  bootLines: string[];
}

const TOOL_BY_KEY: Record<string, ToolSkin> = {
  logs: {
    app: "CloudWatch · Logs Insights",
    tab: "/aws/lambda/helix-prod-bedrock-handler",
    Icon: Terminal,
    accent: "text-cyber-400",
    border: "border-cyber-500/30",
    glow: "shadow-[0_0_60px_rgba(34,211,238,0.18)]",
    bootLines: [
      "> connecting to cloudwatch us-east-1",
      "> filter @logStream like 'bedrock-prod' | last 3h",
      "> 47 entries match · rendering",
    ],
  },
  deploys: {
    app: "GitHub · helix-labs/chatbot",
    tab: "Pull Requests · merged · last 24h",
    Icon: GitCommit,
    accent: "text-acid-400",
    border: "border-acid-500/30",
    glow: "shadow-[0_0_60px_rgba(52,211,153,0.18)]",
    bootLines: [
      "> auth · github oauth · ok",
      "> fetching commits since 02:30",
      "> 3 deploys identified",
    ],
  },
  prompt: {
    app: "VSCode · prompt-templates",
    tab: "main.prompt.md · diff with v2.4.0",
    Icon: GitBranch,
    accent: "text-amber-400",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_60px_rgba(251,191,36,0.18)]",
    bootLines: [
      "> opening prompt-templates/main.prompt.md",
      "> computing diff against v2.4.0",
      "> 12 lines changed",
    ],
  },
  leaks: {
    app: "Slack · #war-room-trustly",
    tab: "Pinned · response audit · last 2h",
    Icon: MessageSquare,
    accent: "text-fuchsia-400",
    border: "border-fuchsia-500/30",
    glow: "shadow-[0_0_60px_rgba(217,70,239,0.18)]",
    bootLines: [
      "> connecting to slack workspace",
      "> loading thread: audit-bot-responses",
      "> 47 flagged sessions found",
    ],
  },
  features: {
    app: "SageMaker · Model Explorer",
    tab: "personalize-prod · feature importance",
    Icon: Database,
    accent: "text-cyber-400",
    border: "border-cyber-500/30",
    glow: "shadow-[0_0_60px_rgba(34,211,238,0.18)]",
    bootLines: [
      "> loading model artifact · v18",
      "> computing SHAP values · 64 features",
      "> ranking by importance",
    ],
  },
  data: {
    app: "S3 · training-data-prod",
    tab: "personalize-2024-q1.parquet · audit",
    Icon: Sheet,
    accent: "text-amber-400",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_60px_rgba(251,191,36,0.18)]",
    bootLines: [
      "> athena · scanning 47GB parquet",
      "> demographics breakdown · running",
      "> stats ready",
    ],
  },
  recursion: {
    app: "X-Ray · Distributed Trace",
    tab: "auto-reply pipeline · last 12min",
    Icon: Mail,
    accent: "text-blood-400",
    border: "border-blood-500/30",
    glow: "shadow-[0_0_60px_rgba(255,51,85,0.22)]",
    bootLines: [
      "> tracing session 4471",
      "> follow request chain · 234 spans",
      "> recursion detected",
    ],
  },
  model: {
    app: "AWS Console · Bedrock",
    tab: "Model invocations · catbird-prod",
    Icon: Settings,
    accent: "text-amber-400",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_60px_rgba(251,191,36,0.18)]",
    bootLines: [
      "> describing endpoint catbird-prod",
      "> fetching model id · pricing tier",
      "> done",
    ],
  },
  cron: {
    app: "CloudWatch · Alarms",
    tab: "kb-sync · last 100 runs",
    Icon: Bell,
    accent: "text-blood-400",
    border: "border-blood-500/30",
    glow: "shadow-[0_0_60px_rgba(255,51,85,0.22)]",
    bootLines: [
      "> querying eventbridge schedules",
      "> kb-sync · history · 100 runs",
      "> 47 failures · 0 alerts fired",
    ],
  },
  config: {
    app: "AWS Console · Transcribe",
    tab: "active config · medtech-prod",
    Icon: FileText,
    accent: "text-cyber-400",
    border: "border-cyber-500/30",
    glow: "shadow-[0_0_60px_rgba(34,211,238,0.18)]",
    bootLines: [
      "> describing transcribe job config",
      "> fetching custom vocabularies",
      "> done",
    ],
  },
  glossary: {
    app: "Google Sheets · localization",
    tab: "GameForge · master glossary",
    Icon: Sheet,
    accent: "text-acid-400",
    border: "border-acid-500/30",
    glow: "shadow-[0_0_60px_rgba(52,211,153,0.18)]",
    bootLines: [
      "> opening sheet · 340 rows",
      "> filtering by domain: gaming",
      "> export targets: TMX, CSV",
    ],
  },
  threshold: {
    app: "CloudTrail · Config History",
    tab: "rekognition-moderation · 12mo",
    Icon: GitBranch,
    accent: "text-amber-400",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_60px_rgba(251,191,36,0.18)]",
    bootLines: [
      "> querying CloudTrail",
      "> filter: PutModerationConfig",
      "> 7 changes found",
    ],
  },
  pipeline: {
    app: "AWS Architecture · loop-social",
    tab: "moderation-pipeline · resource graph",
    Icon: Workflow,
    accent: "text-cyber-400",
    border: "border-cyber-500/30",
    glow: "shadow-[0_0_60px_rgba(34,211,238,0.18)]",
    bootLines: [
      "> loading CDK stack · moderation-pipeline",
      "> resolving resources",
      "> 6 nodes mapped",
    ],
  },
};

interface Props {
  findingKey: string;
  finding: Finding;
  onClose: () => void;
}

export function InvestigationModal({ findingKey, finding, onClose }: Props) {
  const skin = TOOL_BY_KEY[findingKey] || TOOL_BY_KEY.logs;
  const [bootStep, setBootStep] = useState(0);
  const [showBody, setShowBody] = useState(false);
  const Icon = skin.Icon;

  useEffect(() => {
    playSound("investigate");
    const timers: ReturnType<typeof setTimeout>[] = [];
    skin.bootLines.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setBootStep(i + 1);
          playSound("tick");
        }, 120 + i * 180)
      );
    });
    timers.push(setTimeout(() => setShowBody(true), 120 + skin.bootLines.length * 180 + 100));
    return () => timers.forEach(clearTimeout);
  }, [skin]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playSound("click");
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={() => { playSound("click"); onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl rounded-lg overflow-hidden glass-elev ${skin.border} ${skin.glow}`}
      >
        {/* Window chrome — fake mac/IDE traffic lights */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 bg-black/40">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blood-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-acid-500/80" />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon className={`w-3.5 h-3.5 ${skin.accent} shrink-0`} />
            <span className={`text-mono text-[11px] font-semibold ${skin.accent} truncate`}>{skin.app}</span>
          </div>
          <button
            onClick={() => { playSound("click"); onClose(); }}
            className="text-gray-500 hover:text-white transition-colors"
            aria-label="close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab / breadcrumb */}
        <div className="px-4 py-2 border-b border-white/5 bg-white/[0.015] flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${skin.accent.replace("text-", "bg-")}`} />
          <span className="text-mono text-[10px] text-gray-400 truncate">{skin.tab}</span>
        </div>

        {/* Boot/loading sequence */}
        <div className="px-5 pt-4 pb-2 min-h-[64px]">
          {skin.bootLines.slice(0, bootStep).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-mono text-[11px] ${skin.accent} opacity-80 leading-relaxed`}
            >
              {line}
            </motion.div>
          ))}
          {bootStep > 0 && bootStep < skin.bootLines.length && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className={`inline-block w-2 h-3 ${skin.accent.replace("text-", "bg-")} ml-1 align-middle`}
            />
          )}
        </div>

        {/* Body — revealed after boot */}
        <AnimatePresence>
          {showBody && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="px-5 pb-5"
            >
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
              <div className={`text-display text-lg font-bold ${skin.accent} mb-3`}>
                {finding.title}
              </div>
              <div
                className="text-sm text-gray-200 leading-relaxed bg-black/30 border border-white/5 rounded-md p-4 [&_b]:text-white [&_b]:font-semibold [&_em]:text-amber-300 [&_em]:not-italic [&_code]:text-mono [&_code]:text-acid-300 [&_code]:bg-black/60 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_ul]:space-y-2 [&_ul]:list-none [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:rounded-full [&_li]:before:bg-current [&_li]:before:opacity-50"
                style={{ color: undefined }}
                dangerouslySetInnerHTML={{ __html: finding.body }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {showBody && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="border-t border-white/5 bg-black/30 px-4 py-3 flex items-center justify-between"
          >
            <div className="text-mono text-[10px] text-gray-500 flex items-center gap-1.5">
              <Check className="w-3 h-3 text-acid-400" />
              <span>nota salva no notebook</span>
            </div>
            <button
              onClick={() => { playSound("click"); onClose(); }}
              className="btn-ghost text-xs"
            >
              fechar · <span className="text-gray-500 text-mono">esc</span>
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
