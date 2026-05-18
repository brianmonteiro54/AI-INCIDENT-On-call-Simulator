"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Download, Copy, Check, Linkedin } from "lucide-react";
import type { IncidentResult, Incident } from "@/lib/types";
import { formatTime, formatMoney } from "@/lib/levels";
import { playSound } from "@/lib/sound";

interface Props {
  result: IncidentResult;
  incident: Incident;
  playerName: string;
  onClose: () => void;
}

export function ShareCard({ result, incident, playerName, onClose }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [copied, setCopied] = useState(false);

  const gradeBg =
    result.grade.startsWith("A") ? "#34d399" :
    result.grade.startsWith("B") ? "#22d3ee" :
    result.grade.startsWith("C") ? "#fbbf24" :
    "#ff3355";

  const W = 1200;
  const H = 630;

  function downloadSvg() {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-incident-${result.id}-${result.grade.replace("+", "plus")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    playSound("success");
  }

  async function downloadPng() {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgRef.current);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `ai-incident-${result.id}-${result.grade.replace("+", "plus")}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
        playSound("success");
      });
    };
    img.src = url;
  }

  function copyText() {
    const text = `Acabei de tirar ${result.grade} no AI Incident — simulador AWS AI Practitioner.

Incidente: ${incident.title}
Tempo: ${formatTime(result.elapsed)}
Salvei: ${formatMoney(result.saved)} pro cliente
Decisão: ${result.actionLabel}

Aprende AWS sob pressão: [link da sua deploy]`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      playSound("success");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function openLinkedIn() {
    const text = encodeURIComponent(`Acabei de tirar ${result.grade} no AI Incident · simulador de AWS AI Practitioner. Incidente: ${incident.title}. Salvei ${formatMoney(result.saved)} pro cliente em ${formatTime(result.elapsed)}.`);
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}`, "_blank");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl"
      >
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-2 rounded-full glass-elev hover:bg-white/10 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="rounded-2xl overflow-hidden shadow-2xl mb-4 bg-void-950">
          <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ display: "block" }}
          >
            <defs>
              <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0a0c10" />
                <stop offset="100%" stopColor="#050608" />
              </linearGradient>
              <radialGradient id="glow" cx="0.3" cy="0.4" r="0.5">
                <stop offset="0%" stopColor={gradeBg} stopOpacity="0.18" />
                <stop offset="100%" stopColor={gradeBg} stopOpacity="0" />
              </radialGradient>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
              </pattern>
              <linearGradient id="gradeBgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradeBg} stopOpacity="0.25" />
                <stop offset="100%" stopColor={gradeBg} stopOpacity="0.05" />
              </linearGradient>
            </defs>

            <rect width={W} height={H} fill="url(#bg)" />
            <rect width={W} height={H} fill="url(#grid)" />
            <rect width={W} height={H} fill="url(#glow)" />

            {/* scan-line decoration */}
            <line x1="0" y1="0" x2={W} y2="0" stroke={gradeBg} strokeWidth="3" opacity="0.6" />
            <line x1="0" y1={H} x2={W} y2={H} stroke={gradeBg} strokeWidth="3" opacity="0.6" />

            {/* logo */}
            <circle cx="80" cy="80" r="8" fill="#ff3355" />
            <text x="100" y="86" fill="white" fontFamily="Georgia, serif" fontSize="28" fontWeight="900" letterSpacing="-0.5">
              AI <tspan fill="#ff3355">INCIDENT</tspan>
            </text>
            <text x="100" y="108" fill="#6b7280" fontFamily="Menlo, monospace" fontSize="13" letterSpacing="2">
              ON-CALL SIMULATOR
            </text>

            {/* SEV badge */}
            <rect x={W - 200} y="60" width="140" height="36" rx="6" fill="#ff3355" opacity="0.95" />
            <text x={W - 130} y="84" fill="white" fontFamily="Menlo, monospace" fontSize="16" fontWeight="900" letterSpacing="3" textAnchor="middle">
              {incident.isBoss ? "SEV-0 BOSS" : `SEV-${incident.sev}`}
            </text>

            {/* grade box */}
            <rect x="80" y="180" width="320" height="320" rx="20" fill="url(#gradeBgGrad)" stroke={gradeBg} strokeWidth="2" />
            <text
              x="240"
              y="385"
              fill={gradeBg}
              fontFamily="Georgia, serif"
              fontSize="220"
              fontWeight="900"
              textAnchor="middle"
              letterSpacing="-8"
            >
              {result.grade}
            </text>
            <text x="240" y="450" fill="#9ca3af" fontFamily="Menlo, monospace" fontSize="14" letterSpacing="3" textAnchor="middle">
              FINAL GRADE
            </text>

            {/* details */}
            <text x="440" y="220" fill="#6b7280" fontFamily="Menlo, monospace" fontSize="12" letterSpacing="3">
              INCIDENT
            </text>
            <text x="440" y="265" fill="white" fontFamily="Georgia, serif" fontSize="38" fontWeight="900">
              {incident.title.length > 22 ? incident.title.slice(0, 22) + "…" : incident.title}
            </text>
            <text x="440" y="295" fill="#6b7280" fontFamily="Menlo, monospace" fontSize="14">
              {incident.incId.length > 36 ? incident.incId.slice(0, 36) + "…" : incident.incId}
            </text>

            {/* stat blocks */}
            <StatBlock x={440} y={335} label="TIME" value={formatTime(result.elapsed)} valueColor="white" />
            <StatBlock x={620} y={335} label="SAVED" value={formatMoney(result.saved)} valueColor="#34d399" />
            <StatBlock x={800} y={335} label="XP" value={`+${result.xp}`} valueColor="#fbbf24" />

            {/* engineer line */}
            <line x1="440" y1="445" x2="1120" y2="445" stroke="rgba(255,255,255,0.1)" />
            <text x="440" y="475" fill="#6b7280" fontFamily="Menlo, monospace" fontSize="12" letterSpacing="3">
              ENGINEER ON-CALL
            </text>
            <text x="440" y="510" fill="white" fontFamily="Georgia, serif" fontSize="28" fontWeight="700">
              @{playerName}
            </text>

            {/* footer tagline */}
            <text x="80" y={H - 35} fill="#6b7280" fontFamily="Menlo, monospace" fontSize="13" letterSpacing="2">
              Aprende AWS AI Practitioner sob pressão de produção.
            </text>
          </svg>
        </div>

        {/* controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <button onClick={downloadPng} className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>PNG</span>
          </button>
          <button onClick={downloadSvg} className="btn-ghost flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>SVG</span>
          </button>
          <button onClick={copyText} className="btn-ghost flex items-center gap-2">
            {copied ? <Check className="w-4 h-4 text-acid-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "copiado!" : "copiar texto"}</span>
          </button>
          <button onClick={openLinkedIn} className="btn-ghost flex items-center gap-2 text-cyber-300 border-cyber-500/30">
            <Linkedin className="w-4 h-4" />
            <span>LinkedIn</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatBlock({ x, y, label, value, valueColor }: { x: number; y: number; label: string; value: string; valueColor: string }) {
  return (
    <g>
      <text x={x} y={y} fill="#6b7280" fontFamily="Menlo, monospace" fontSize="11" letterSpacing="3">{label}</text>
      <text x={x} y={y + 38} fill={valueColor} fontFamily="Georgia, serif" fontSize="32" fontWeight="900">{value}</text>
    </g>
  );
}
