# AI INCIDENT · On-call Simulator

> **3:17AM. A produção tá pegando fogo.**
> Bedrock alucinando, custo subindo $400/min, cliente reclamando no Twitter. Tu é o(a) engineer de plantão.

Simulador gamificado pra estudar pro **AWS Certified AI Practitioner** sob pressão de produção real. Em vez de decorar flashcard, tu apaga incêndio. Cada incidente é uma situação plausível em prod, com console da AWS, thread de Slack do war room, logs e métricas, e cada decisão te ensina um pedaço da AWS porque tu *viu* a coisa quebrar.

Visual no estilo **Duolingo**: chunky, colorido, com mascote, XP, streak, conquistas e trilha de missões.

---

## Features

- **19 missões** mapeadas a serviços de AI/ML da AWS: Bedrock Guardrails, Comprehend (PII), Clarify (bias), seleção de modelo (custo), Knowledge Bases (RAG stale), Transcribe Medical, Translate (terminologia), Rekognition (moderação), Polly (pronúncia), Personalize (cold start), Lex (fallback), Forecast, SageMaker (algoritmo/treinamento), e mais.
- **1 BOSS SEV-0 · "The Cascade"** com fases multi-stage (falha em cascata na Black Friday) e timer por fase.
- **Fluxo de gameplay**: briefing → investigar pistas (console AWS simulado) → recap no Slack → decidir → feedback → **quiz de fixação** (pergunta no estilo prova, +XP).
- **Scoring**: bônus de velocidade por faixa de tempo, multiplicador de acurácia (cada erro reduz), bônus por investigar tudo, e downgrade de nota por tentativa.
- **Sound design** com Web Audio API puro (sem libs): clicks, sucesso, falha, conquista, ambiente. Áudio de pronúncia do Polly via SpeechSynthesis nativa do navegador.
- **Haptics** no mobile (`navigator.vibrate`) — no-op em iOS Safari.
- **13 conquistas**: Primeiro Sangue, Speed Runner, Boss Slayer, Intocável, etc — sincadas via Zustand persist.
- **Desafio do dia** determinístico por data UTC — destaca uma missão por dia (sem multiplicador de XP) e alimenta a conquista *Daily Warrior*.
- **Streak system** · A+ consecutivos contam.
- **Leaderboard global** com Upstash Redis — **Sorted Set + Hash** (submissões por jogador, sem condição de corrida; mantém só o top 100), com fallback em memória, auto-publicação e validação anti-cheat no servidor.
- **Instalável (PWA)**: manifest + ícones (`Add to Home Screen`, modo standalone) e `theme-color` pra integrar a barra do navegador no mobile.
- **Card de compartilhamento (Open Graph)**: imagem 1200×630 gerada na identidade do app — o link rende com preview no WhatsApp, X/Twitter (card grande), LinkedIn, Discord, iMessage etc.
- **Progresso de missão persistente**: refresh no meio de um incidente não perde o avanço (saves expiram em 6h).
- **Glossário** pesquisável com os conceitos da prova, linkando pras missões que cobrem cada termo.
- **Acessibilidade**: foco de teclado visível, `prefers-reduced-motion` (CSS + Framer Motion via `MotionConfig`), alvos de toque ≥44px nos controles.

---

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript (strict)
- Tailwind CSS · tema custom estilo Duolingo (green / blue / yellow / red / orange / purple)
- Framer Motion 11 · Web Audio API + Web Speech API (sem libs de áudio externas)
- Zustand 5 com persist em localStorage
- **Upstash Redis** (free tier) pro leaderboard — opcional, com fallback em memória

---

## Rodar local

```bash
npm install
cp .env.example .env.local   # opcional · só pra leaderboard persistente
npm run dev
```

Abre `http://localhost:3000`. Sem `.env`, o leaderboard funciona em memória (reseta no restart).

> O `next/font/google` baixa as fontes (Bricolage Grotesque, DM Sans, JetBrains Mono, Instrument Serif) em build/dev — precisa de internet na primeira vez.

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

### Card de compartilhamento (Open Graph)

A imagem de preview do link já vem pronta (`app/opengraph-image.png`). Pra ela aparecer com URL absoluta:

- **Vercel**: nada a fazer — a URL do deploy é detectada automaticamente.
- **Render / domínio próprio**: define `NEXT_PUBLIC_SITE_URL` (ex: `https://ai-incident.seudominio.com`) nas env vars, senão alguns apps (WhatsApp, X) podem não puxar a imagem.

Pra testar depois do deploy: cola o link no [opengraph.xyz](https://www.opengraph.xyz) ou no [Post Inspector do LinkedIn](https://www.linkedin.com/post-inspector/).

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
  layout.tsx            → fontes, metadata, MotionProvider
  page.tsx              → home: header (streak/XP/A+), daily, stats, trilha de missões, conquistas
  incident/[id]/        → war room (gameplay) — usa <WarRoom/>
  leaderboard/          → ranking global (skeleton, sync, anti-cheat)
  glossario/            → glossário pesquisável dos conceitos da prova
  globals.css           → tema Duolingo (botões/cards chunky, progress, animações, .tap-target)
  manifest.ts           → PWA manifest (/manifest.webmanifest)
  icon.svg / apple-icon.png → favicon + ícone de toque (gerados do mascote)
  opengraph-image.png / twitter-image.png → card de compartilhamento (1200×630)
  api/
    leaderboard/        → GET top 50
    submit/             → POST score (caps, consistência, sanitização, rate-limit, origin check)
components/
  WarRoom               → o jogo: briefing, investigação, decisão, feedback, quiz, boss
  ConsoleFrame          → frame do AWS Console (logs/code/metrics/table/prose)
  SlackThread           → recap do incidente em thread de Slack
  PollyFindingInteractive / SpeakButton → pronúncia via Web Speech API
  ResultScreen          → tela de resultado: nota, XP, veredicto, teoria da prova
  Mascot                → mascote SVG animado (6 expressões)
  WelcomeScreen         → onboarding (nome → ranking)
  AchievementToasts     → notificações de unlock
  MotionProvider        → MotionConfig reducedMotion="user"
lib/
  incidents.ts          → todos os incidentes + boss (data)
  findings.ts           → conteúdo das pistas investigáveis
  console-mocks.ts      → contexto/tema do AWS Console por pista
  glossary.ts           → termos do glossário
  achievements.ts       → 13 conquistas + checkers
  levels.ts             → progressão Junior → Principal + daily helpers
  sound.ts              → synth manager (Web Audio API)
  haptic.ts             → vibração no mobile
  store.ts              → Zustand store persistente + anti-tamper
  mission-progress.ts   → persistência de missão em andamento
  leaderboard-storage   → Upstash com fallback em memória
  types.ts              → todos os tipos
```

---

## Customizar

**Adicionar missão nova:** edita `lib/incidents.ts`, segue o shape `Incident`. Pra pistas investigáveis, adiciona em `lib/findings.ts` (e o contexto de console em `lib/console-mocks.ts`). Pra boss multi-fase, popula o array `phases`. Pra quiz de fixação, preenche `quizQuestion`.

> Se mudar o número de missões, atualiza `TOTAL_MISSIONS` em `lib/achievements.ts`, `lib/store.ts` e `app/api/submit/route.ts`.

**Trocar paleta:** `tailwind.config.ts` → seção `colors.duo`.

**Trocar fontes:** `app/layout.tsx` → importa de `next/font/google`.

---

## Por que isso é melhor que flashcard

Memória episódica > memória semântica. Quando tu vê o threshold do Rekognition subir pra 99% e o feed encher de conteúdo gráfico, tu **nunca mais esquece** que confidence threshold é parâmetro crítico. Quando tu enfrenta o boss CASCADE e percebe que sem exponential backoff Lambda derruba Bedrock derruba Comprehend derruba CloudFront, tu sabe pra sempre porquê Step Functions existe.

O exame é só consequência.

---

Licença: MIT. Use à vontade.
