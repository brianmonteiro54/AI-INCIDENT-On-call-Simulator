"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Search, BookOpen, X } from "lucide-react";
import { GLOSSARY, type GlossaryTerm } from "@/lib/glossary";
import { playSound } from "@/lib/sound";
import { Mascot } from "@/components/Mascot";

export default function GlossarioPage() {
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Filter terms by search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GLOSSARY;
    return GLOSSARY.map((section) => ({
      ...section,
      terms: section.terms.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.short.toLowerCase().includes(q) ||
          t.long.toLowerCase().includes(q)
      ),
    })).filter((s) => s.terms.length > 0);
  }, [query]);

  const totalTerms = GLOSSARY.reduce((sum, s) => sum + s.terms.length, 0);
  const filteredCount = filtered.reduce((sum, s) => sum + s.terms.length, 0);

  // Scroll-spy: highlight the section chip whose section is currently in view.
  // Only meaningful when not searching (the chip bar is hidden during search).
  useEffect(() => {
    if (query) return;
    const els = GLOSSARY
      .map((s) => document.getElementById(`section-${s.id}`))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id.replace("section-", ""));
        }
      },
      // Activate a section once its heading clears the sticky header (~80px),
      // and keep it active through the upper part of the viewport.
      { rootMargin: "-80px 0px -55% 0px", threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [query]);

  return (
    <div className="min-h-screen bg-duo-cream">
      <header className="sticky top-0 z-30 bg-duo-cream/95 backdrop-blur-sm border-b-2 border-duo-line">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link
            href="/"
            onClick={() => playSound("page")}
            aria-label="voltar pra home"
            className="text-duo-ink-soft hover:text-duo-ink tap-target rounded-full hover:bg-duo-line-soft transition"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </Link>
          <h1 className="text-display text-xl font-black text-duo-ink">Glossário</h1>
          <div className="flex-1" />
          <div className="text-duo-ink-faded text-xs font-bold tabular">
            {query ? `${filteredCount}/${totalTerms}` : `${totalTerms} termos`}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        <div className="duo-card p-5 sm:p-6 flex items-center gap-4 sm:gap-5 bg-duo-blue-light border-duo-blue">
          <Mascot expression="happy" size={100} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <h2 className="text-display text-2xl sm:text-3xl font-black text-duo-blue-dark leading-tight mb-1">
              Conceitos da prova 📚
            </h2>
            <p className="text-duo-ink-soft text-sm sm:text-base font-medium leading-snug">
              Referência rápida pra revisar antes do AWS AI Practitioner. Pode consultar no meio de uma missão também.
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-5">
        <div className="duo-card p-3 flex items-center gap-3">
          <Search className="w-5 h-5 text-duo-ink-faded shrink-0" strokeWidth={2.5} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="buscar termo... (ex: recall, RAG, polly)"
            className="flex-1 bg-transparent outline-none font-bold text-duo-ink placeholder:text-duo-ink-faded placeholder:font-medium"
            aria-label="buscar termo no glossário"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="limpar busca"
              className="text-duo-ink-faded hover:text-duo-ink p-1 rounded-full hover:bg-duo-line-soft"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* Section navigation chips */}
      {!query && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-4 overflow-x-auto pb-1">
          <div className="flex gap-2 pb-2">
            {GLOSSARY.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  playSound("tick");
                  setActiveSection(s.id);
                  const el = document.getElementById(`section-${s.id}`);
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`shrink-0 chip border-duo-line bg-white hover:bg-duo-line-soft text-duo-ink text-xs font-black flex items-center gap-1.5 px-3 py-2 transition ${
                  activeSection === s.id ? "border-duo-blue bg-duo-blue-light" : ""
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.title}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-5 pb-12 space-y-8">
        {filtered.length === 0 ? (
          <div className="duo-card p-10 text-center">
            <Mascot expression="thinking" size={120} className="mx-auto mb-3" />
            <div className="text-display text-xl font-black text-duo-ink mb-1">nada encontrado</div>
            <div className="text-duo-ink-soft text-sm font-bold">tenta outro termo</div>
          </div>
        ) : (
          filtered.map((section) => (
            <div key={section.id} id={`section-${section.id}`} className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">{section.icon}</div>
                <h2 className="text-display text-xl sm:text-2xl font-black text-duo-ink uppercase tracking-wider">
                  {section.title}
                </h2>
                <div className="h-1 flex-1 bg-duo-line rounded-full" />
                <span className="text-duo-ink-faded text-xs font-black tabular">{section.terms.length}</span>
              </div>
              <div className="space-y-2.5">
                {section.terms.map((term) => (
                  <TermCard key={term.term} term={term} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function TermCard({ term }: { term: GlossaryTerm }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="duo-card overflow-hidden"
    >
      <button
        onClick={() => { playSound("tick"); setOpen((v) => !v); }}
        className="w-full text-left p-4 hover:bg-duo-line-soft transition flex items-start gap-3"
        aria-expanded={open}
      >
        <div className="shrink-0 w-9 h-9 rounded-xl bg-duo-blue-light text-duo-blue-dark flex items-center justify-center">
          <BookOpen className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-duo-ink text-base sm:text-lg leading-tight">
            {term.term}
          </div>
          <div className="text-duo-ink-soft text-sm font-medium mt-0.5 leading-snug">
            {term.short}
          </div>
        </div>
        <motion.div
          animate={{ rotate: open ? 90 : 0 }}
          className="shrink-0 text-duo-ink-faded mt-1 select-none font-black"
        >
          ▶
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 ml-12">
              <div
                className="text-duo-ink text-sm leading-relaxed [&_b]:font-black [&_b]:text-duo-blue-dark [&_code]:bg-duo-yellow-light [&_code]:text-duo-ink [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-mono [&_code]:font-bold [&_code]:text-xs"
                dangerouslySetInnerHTML={{ __html: term.long }}
              />
              {term.missions && term.missions.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-xs">
                  <span className="text-duo-ink-faded font-bold">cobre em:</span>
                  {term.missions.map((mid) => (
                    <Link
                      key={mid}
                      href={`/incident/${mid}`}
                      onClick={() => playSound("page")}
                      className="chip border-duo-green-dark bg-duo-green-light text-duo-green-dark text-[10px] px-2 py-0.5 hover:bg-duo-green hover:text-white transition"
                    >
                      {mid}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
