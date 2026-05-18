"use client";

import { Search, Bell, User as UserIcon, ChevronRight, RefreshCw } from "lucide-react";
import { CONSOLE_CONTEXT, SERVICE_THEMES } from "@/lib/console-mocks";

interface Props {
  findingKey: string;
  children: React.ReactNode;
}

export function ConsoleFrame({ findingKey, children }: Props) {
  const ctx = CONSOLE_CONTEXT[findingKey];
  const service = ctx?.service ?? "AWS";
  const breadcrumb = ctx?.breadcrumb ?? ["Services"];
  const region = ctx?.region ?? "us-east-1";
  const theme = ctx ? SERVICE_THEMES[ctx.serviceKey] ?? SERVICE_THEMES.default : SERVICE_THEMES.default;
  const viewType = ctx?.viewType ?? "prose";

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-duo-line bg-white shadow-md" style={{ borderBottomWidth: 4 }}>
      {/* AWS top bar */}
      <div className="bg-[#161e2d] text-white px-3 py-2 flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="text-duo-orange font-black text-base leading-none tracking-tighter" style={{ fontFamily: "var(--font-bricolage), sans-serif" }}>aws</div>
        </div>
        <div className="text-slate-500">|</div>
        <button className="px-2 py-1 hover:bg-white/5 rounded text-slate-300 font-medium hidden sm:flex items-center gap-1">
          Services <ChevronRight className="w-3 h-3" />
        </button>
        <div className="flex-1 max-w-md hidden md:flex items-center gap-1.5 bg-white/5 rounded px-2 py-1">
          <Search className="w-3 h-3 text-slate-500" />
          <span className="text-slate-500">Search</span>
        </div>
        <div className="flex-1 md:flex-none" />
        <div className="hidden sm:flex items-center gap-1 text-slate-400 px-2">
          <Bell className="w-3.5 h-3.5" />
        </div>
        <div className="hidden sm:flex items-center gap-1 text-slate-300">
          <span className="text-[10px] uppercase tracking-wider">{region}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-300">
          <UserIcon className="w-3.5 h-3.5" />
          <span className="text-[10px] hidden sm:inline">engineer@</span>
        </div>
      </div>

      {/* Service header */}
      <div className={`${theme.bg} border-b border-slate-200 px-4 py-3 flex items-center gap-3`}>
        <div className="text-2xl shrink-0">{theme.icon}</div>
        <div className="min-w-0">
          <div className={`text-xs font-bold uppercase tracking-widest ${theme.color}`}>aws service</div>
          <div className="font-black text-duo-ink text-lg leading-tight">{service}</div>
        </div>
        <div className="flex-1" />
        <button className="hidden sm:flex items-center gap-1 text-xs text-slate-600 font-bold px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50">
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 text-[11px] text-slate-600 flex items-center gap-1 flex-wrap font-medium">
        {breadcrumb.map((c, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
            <span className={i === breadcrumb.length - 1 ? "text-slate-900 font-bold" : "hover:text-blue-600 cursor-pointer"}>{c}</span>
          </span>
        ))}
      </div>

      {/* Content area */}
      <div className={`${viewType === "logs" ? "bg-[#0d1117] text-slate-200 p-4" : "p-5 bg-white"}`}>
        {viewType === "logs" ? (
          <div className="font-mono text-xs">
            <div className="text-slate-500 mb-2 pb-2 border-b border-slate-700 flex items-center gap-2">
              <span className="text-pink-400">●</span>
              <span>Log events · streaming</span>
              <span className="ml-auto text-[10px] text-slate-600">UTC</span>
            </div>
            <div className="prose-console-logs">{children}</div>
          </div>
        ) : viewType === "code" || viewType === "json" ? (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 flex items-center gap-2">
              <span>{viewType === "json" ? "Configuration" : "System prompt"}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-400">read only</span>
            </div>
            <div className="bg-slate-900 rounded-md p-4 text-slate-200 font-mono text-xs leading-relaxed prose-console-code">
              {children}
            </div>
          </div>
        ) : viewType === "metrics" ? (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Metrics · last 1h</div>
            <div className="prose-console-metrics text-duo-ink">{children}</div>
          </div>
        ) : viewType === "table" ? (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Resources</div>
            <div className="prose-console-table text-duo-ink">{children}</div>
          </div>
        ) : (
          <div className="prose-console text-duo-ink">{children}</div>
        )}
      </div>

      <style jsx global>{`
        .prose-console b, .prose-console-table b, .prose-console-metrics b { color: #3C3C3C; font-weight: 800; }
        .prose-console code, .prose-console-table code, .prose-console-metrics code {
          background: #FFF1AA;
          color: #3C3C3C;
          padding: 1px 5px;
          border-radius: 4px;
          font-family: var(--font-jetbrains), monospace;
          font-size: 0.9em;
          font-weight: 700;
        }
        .prose-console p, .prose-console-table p, .prose-console-metrics p { margin: 0.55em 0; line-height: 1.6; }
        .prose-console ul, .prose-console-table ul, .prose-console-metrics ul { margin: 0.5em 0; padding-left: 1.2em; list-style: disc; }
        .prose-console li, .prose-console-table li, .prose-console-metrics li { margin: 0.3em 0; }

        .prose-console-logs b { color: #f87171; font-weight: 700; }
        .prose-console-logs code {
          background: rgba(255,255,255,0.06);
          color: #e2e8f0;
          padding: 1px 4px;
          border-radius: 3px;
          font-family: var(--font-jetbrains), monospace;
          font-size: 0.95em;
        }
        .prose-console-logs p { margin: 0.3em 0; line-height: 1.7; }
        .prose-console-logs ul { margin: 0.4em 0; padding-left: 1.2em; list-style: none; }
        .prose-console-logs li { margin: 0.2em 0; }
        .prose-console-logs li::before { content: "▸ "; color: #fb923c; }

        .prose-console-code { color: #e2e8f0; }
        .prose-console-code b { color: #fbbf24; font-weight: 700; }
        .prose-console-code code {
          background: rgba(255,255,255,0.08);
          color: #93c5fd;
          padding: 0 4px;
          border-radius: 3px;
        }
        .prose-console-code p { margin: 0.5em 0; }
      `}</style>
    </div>
  );
}
