# AI INCIDENT · On-call Simulator

> **3:17AM. A produção tá pegando fogo.**
> Bedrock alucinando, custo subindo $400/min, cliente reclamando no Twitter. Tu é o(a) engineer de plantão.

Simulador gamificado pra estudar pro **AWS Certified AI Practitioner** sob pressão de produção real. Em vez de decorar flashcard, tu apaga incêndio. Cada incidente é uma situação plausível em prod com dashboards, logs, métricas e decisões — e cada decisão te ensina um pedaço da AWS porque tu *viu* a coisa quebrar.

---

## Features

- **9 incidentes** mapeados a serviços AWS de AI/ML: Bedrock Guardrails, Comprehend (PII), Clarify (bias), modelo selection (cost), Knowledge Bases (RAG stale), Transcribe Medical, Translate Custom Terminology, Rekognition moderation
- **BOSS SEV-0 · "The Cascade"** com 3 fases multi-stage (cascading failure em Black Friday)
- **Sound design** completo com Web Audio API: alarmes, ambient drone, click feedback, achievement chimes
- **Achievements** (12): First Blood, Boss Slayer, Untouchable, etc — sincados via Zustand persist
- **Daily challenge** determinístico por data UTC com badge especial
- **Streak system** · A+ consecutivos contam multiplicador
- **Leaderboard global** com Upstash Redis (com fallback em memória)
- **Share card SVG/PNG** pra LinkedIn — gerado client-side
- **Cinemático**: glassmorphism, scan-line CRT, breath/pulse motion via Framer Motion, vignette overlay, boot sequence intro

---

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript
- Tailwind CSS · custom theme (acid green / blood red / cyber cyan / fuchsia boss)
- Framer Motion 11 · Web Audio API (sem libs externas)
- Zustand 5 com persist localStorage
- **Upstash Redis** (free tier) pra leaderboard — opcional, com fallback em memória

---

## Rodar local

```bash
npm install
cp .env.example .env.local   # opcional · só pra leaderboard persistente
npm run dev
```

Abre `http://localhost:3000`. Sem `.env`, o leaderboard funciona em memória (reseta no restart).

---

## Deploy

### Opção A · Vercel (recomendado, 30s)

1. Sobe o repo no GitHub.
2. Importa em [vercel.com/new](https://vercel.com/new).
3. (Opcional) Em **Settings → Environment Variables** adiciona:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Deploy. Pronto.

### Opção B · Render

1. Sobe o repo no GitHub.
2. Em [render.com](https://render.com) → **New → Blueprint**, aponta pro repo.
3. O `render.yaml` já tá pronto. Adiciona as 2 env vars do Upstash (opcional).
4. Deploy. Free tier funciona, mas dorme após 15min de inatividade.

### Upstash Redis (opcional, mas recomendado)

Pra leaderboard persistente entre restarts:

1. Cria conta grátis em [upstash.com](https://upstash.com).
2. Cria um Redis database.
3. Na aba **REST API**, copia `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`.
4. Cola nas env vars do Vercel/Render.

Free tier: 10k commands/dia. Pra esse caso de uso, sobra.

---

## Estrutura

```
app/
  page.tsx              → home/dashboard
  incident/[id]/        → war room (gameplay)
  leaderboard/          → global leaderboard
  api/
    leaderboard/        → GET top 50
    submit/             → POST player score
components/
  PlayerBar             → header com nome, level, XP, som
  IncidentCard          → card de incidente no grid
  WarRoom               → o jogo em si (metrics, logs, ações, fases boss)
  CostTicker            → contador animado de custo
  Spark                 → sparkline SVG
  LogConsole            → terminal CRT-style
  ResultScreen          → modal de grade + stats + share
  ShareCard             → gerador SVG/PNG pra LinkedIn
  BootSequence          → intro cinematográfica
  AchievementToasts     → notificações de unlocks
lib/
  incidents.ts          → todos os 9 incidentes (data)
  achievements.ts       → 12 achievements + checkers
  levels.ts             → progressão Junior → Principal
  sound.ts              → Web Audio API synth manager
  store.ts              → Zustand store persistente
  leaderboard-storage   → Upstash com fallback em memória
  types.ts              → todos os tipos
```

---

## Customizar

**Adicionar incidente novo:** edita `lib/incidents.ts`, segue o shape `Incident`. Pra investigações reveláveis, adiciona no `lib/findings.ts`. Pra boss multi-fase, popula o array `phases`.

**Trocar paleta:** `tailwind.config.ts` → seção `colors`. Acid/blood/cyber/fuchsia.

**Trocar fontes:** `app/layout.tsx` → importa de `next/font/google`.

---

## Por que isso é melhor que flashcard

Memória episódica > memória semântica. Quando tu vê o threshold do Rekognition subir pra 99% e o feed encher de conteúdo gráfico, tu **nunca mais esquece** que confidence threshold é parâmetro crítico. Quando tu enfrenta o boss CASCADE e percebe que sem exponential backoff Lambda derruba Bedrock derruba Comprehend derruba CloudFront, tu sabe pra sempre porquê Step Functions existe.

O exame é só consequência.

---

Licença: MIT. Use à vontade.
