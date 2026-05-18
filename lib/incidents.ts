import type { Incident } from "./types";

export const INCIDENTS: Incident[] = [
  // ============================================================
  // SEV-1: The Hallucinator
  // ============================================================
  {
    id: "hallucination",
    sev: 1,
    title: "O Alucinador",
    incId: "incident.helix-prod.bedrock-hallucination",
    customer: "Helix Labs (saúde digital)",
    slack: "#war-room-helix",
    desc: "Chatbot médico começou a recomendar dosagens inventadas. Cliente legal já enviou screenshot.",
    short: "Bedrock alucinando · resposta médica perigosa",
    ratePerMin: 412,
    initialCost: 5847,
    initialElapsed: 14 * 60 + 32,
    minLevel: 0,
    sparkType: "spike",
    metrics: [
      { label: "Hallucination rate", value: "34.2%", cls: "red", delta: "↑ +29% (1h)", deltaCls: "up" },
      { label: "p99 latency", value: "2,847ms", cls: "amber", delta: "↑ +180%", deltaCls: "up" },
      { label: "Customer complaints", value: "127", cls: "red", delta: "↑ +89 (15min)", deltaCls: "up" },
    ],
    timeline: [
      { t: "03:02:14", ev: "<b>Deploy v2.4.1</b> · bedrock prompt template alterado", bad: true },
      { t: "03:08:47", ev: "Hallucination rate começa a subir" },
      { t: "03:15:22", ev: "<b>Cliente legal</b> envia print de resposta inventada", bad: true },
      { t: "03:17:01", ev: "<b>PagerDuty</b> escalou pra você", bad: true },
    ],
    logs: [
      { ts: "03:17:42", lv: "INF", msg: "bedrock.invoke completed · 2841ms" },
      { ts: "03:17:43", lv: "WRN", msg: "guardrail.check skipped · <b>flag=disabled</b>" },
      { ts: "03:17:44", lv: "ERR", msg: 'customer ticket #44182 · <b>"AI told me to take 80mg of ibuprofen"</b>' },
      { ts: "03:17:45", lv: "INF", msg: "prompt v2.4.1 in use · removed safety preamble" },
      { ts: "03:17:46", lv: "WRN", msg: "no Bedrock Guardrails attached to this endpoint" },
      { ts: "03:17:47", lv: "ERR", msg: 'customer ticket #44183 · "<b>recommended a fake medication</b>"' },
    ],
    actions: [
      { id: "investigate-logs", type: "investigate", name: "Read logs detalhadamente", hint: "+30s · grátis", reveals: "logs", timeCost: 30 },
      { id: "investigate-deploys", type: "investigate", name: "Verificar últimos deploys", hint: "+30s · grátis", reveals: "deploys", timeCost: 30 },
      { id: "rollback", name: "↩ Rollback v2.4.0", hint: "~3min downtime · custo médio", grade: "A-", costDelta: 1200, xp: 180, verdict: "Bom. Rápido.", sub: "Mas a causa-raiz (falta de Guardrails) continua latente." },
      { id: "scale", name: "↑ Scale infra", hint: "não resolve a raiz", grade: "D", costDelta: 5400, xp: 30, verdict: "Errou o alvo.", sub: "Throughput não era o problema. Custo subiu, alucinação continua." },
      { id: "guard", name: "🛡 Enable Bedrock Guardrails", hint: "+30s a aplicar · resolve definitivo", grade: "A+", costDelta: 600, xp: 280, verdict: "Excelente.", sub: "Resolveu causa-raiz sem rollback. Eficiente." },
      { id: "escalate", name: "↗ Page o staff engineer", hint: "acordo o sênior às 3h", grade: "C", costDelta: 2800, xp: 80, verdict: "Funcional, mas escalou cedo demais.", sub: "OK em emergência real, ruim como hábito." },
    ],
    rootCause:
      'O deploy v2.4.1 removeu o "safety preamble" do prompt do Bedrock e a flag de Guardrails estava desabilitada nesse endpoint específico (legado de migração). Sem barreira, o modelo passou a responder qualquer coisa — inclusive recomendações médicas que não tinha autorização pra dar.',
    services: [
      { name: "Bedrock", role: "Foundation model", description: "O LLM que tava gerando as respostas. O modelo em si não tem culpa — ele responde o que o prompt pede. A culpa foi de quem tirou as instruções de segurança." },
      { name: "Bedrock Guardrails", role: "Solução", description: "Camada de segurança que bloqueia tópicos proibidos (medicina, finanças, política) antes da resposta sair. Definida 1x, aplica em todas as chamadas." },
      { name: "Comprehend Medical", role: "Defesa extra", description: "Detecta se a resposta menciona medicamentos, dosagens, sintomas — e bloqueia se sim. Camada extra além do Guardrails." },
    ],
    examNote: "Domínio 5 do exame · Responsible AI. Bedrock Guardrails é praticamente certo de cair. Memoriza: <code>Guardrails</code> bloqueia tópicos sensíveis, palavras-chave, PII, e prompts maliciosos. Funciona em qualquer modelo do Bedrock.",
  },

  // ============================================================
  // SEV-1: PII Leak
  // ============================================================
  {
    id: "pii-leak",
    sev: 1,
    title: "O Vazamento",
    incId: "incident.support-bot.pii-exposed",
    customer: "Trustly Bank",
    slack: "#war-room-trustly",
    desc: "Bot de atendimento bancário tá ecoando CPF e número do cartão dos clientes nas próprias respostas. LGPD à vista.",
    short: "PII vazando em respostas do bot · LGPD risk",
    ratePerMin: 680,
    initialCost: 9120,
    initialElapsed: 11 * 60 + 8,
    minLevel: 0,
    sparkType: "flat-spike",
    metrics: [
      { label: "PII em output", value: "14.3%", cls: "red", delta: "↑ era 0% ontem", deltaCls: "up" },
      { label: "Calls 24h", value: "8,420", cls: "amber", delta: "normal" },
      { label: "Tickets jurídicos", value: "3", cls: "red", delta: "↑ +3 (1h)", deltaCls: "up" },
    ],
    timeline: [
      { t: "02:50:00", ev: '<b>Deploy</b> · novo prompt mais "amigável" entrou em prod', bad: true },
      { t: "02:55:12", ev: "Primeira resposta com CPF detectada por scan", bad: true },
      { t: "03:05:44", ev: "Cliente postou print no Twitter" },
      { t: "03:08:01", ev: '<b>Time jurídico no Slack:</b> "PARAR ISSO AGORA"', bad: true },
    ],
    logs: [
      { ts: "03:08:30", lv: "INF", msg: "bot.respond · session=84772" },
      { ts: "03:08:31", lv: "WRN", msg: "output contains pattern: <b>CPF</b> (11 digits)" },
      { ts: "03:08:32", lv: "ERR", msg: "no PII redaction on response pipeline" },
      { ts: "03:08:33", lv: "INF", msg: 'new prompt encourages "personalização: cite dados do cliente"' },
      { ts: "03:08:34", lv: "WRN", msg: "no Comprehend.detect_pii_entities() call before response" },
      { ts: "03:08:35", lv: "ERR", msg: "session 84772 leaked <b>3 CPFs + 1 card number</b>" },
    ],
    actions: [
      { id: "investigate-prompt", type: "investigate", name: "Verificar novo prompt", hint: "+30s · grátis", reveals: "prompt", timeCost: 30 },
      { id: "investigate-logs2", type: "investigate", name: "Auditar últimas respostas", hint: "+30s · grátis", reveals: "leaks", timeCost: 30 },
      { id: "shutdown", name: "⛔ Desligar o bot inteiro", hint: "sem atendimento, mas zero leak", grade: "B", costDelta: 3200, xp: 140, verdict: "Seguro. Bruto.", sub: 'Parou o sangue. Mas deixa milhares sem atendimento. Senior diria "porque não usou Comprehend?".' },
      { id: "comprehend", name: "🛡 Pipe Comprehend pra redact PII", hint: "~2min · resposta volta em 30s", grade: "A+", costDelta: 1400, xp: 300, verdict: "Excelente.", sub: "Causa-raiz tratada sem derrubar serviço. Amazon Comprehend detecta e mascara PII automaticamente." },
      { id: "rollback-prompt", name: "↩ Rollback do prompt", hint: "~1min downtime", grade: "A-", costDelta: 1800, xp: 200, verdict: "Bom.", sub: "Volta o prompt antigo que não pede dados pessoais. Resolve mas não previne o próximo deploy ruim." },
      { id: "manual-review", name: "👁 Time humano revisa cada resposta", hint: "impossível em escala", grade: "F", costDelta: 18000, xp: 10, verdict: "Inviável.", sub: "8 mil chamadas/dia, ninguém revisa. SLA vai pro espaço." },
    ],
    rootCause: "Deploy do prompt novo encorajou personalização: o bot passou a citar dados do cliente nas respostas (CPF, cartão). Não havia camada de PII redaction no pipeline — o modelo respondia, ia direto pro cliente.",
    services: [
      { name: "Comprehend", role: "Solução", description: 'Detecta PII (CPF, SSN, telefone, email, cartão) em texto. Pode redact automático: troca "123.456.789-00" por "[CPF]". 100ms, custa centavos.' },
      { name: "Bedrock Guardrails", role: "Alternativa", description: "Guardrails também tem filtro de PII configurável. Em casos onde já se usa Bedrock, pode resolver no mesmo lugar sem chamar Comprehend." },
      { name: "Macie", role: "Auditoria", description: "Pra escanear o S3 onde logs ficam guardados e ver se PII vazou pra disco. Próximo passo: auditoria pós-incidente." },
    ],
    examNote: "Comprehend pra PII detection é tema clássico. Memoriza as 4 ferramentas pra dados sensíveis: <code>Comprehend</code> (runtime), <code>Macie</code> (S3), <code>Bedrock Guardrails</code> (inline), <code>KMS</code> (encryption).",
  },

  // ============================================================
  // SEV-2: Bias
  // ============================================================
  {
    id: "bias",
    sev: 2,
    title: "O Viesado",
    incId: "incident.personalize.discrimination",
    customer: "Lar Doce Lar (imobiliária)",
    slack: "#ml-fairness",
    desc: "Sistema de recomendação de imóveis tá filtrando candidatos por CEP — e na prática, por raça. Reportagem publicada.",
    short: "Personalize discriminando por CEP · viés racial",
    ratePerMin: 90,
    initialCost: 14200,
    initialElapsed: 48 * 60,
    minLevel: 1,
    sparkType: "slow-rise",
    metrics: [
      { label: "Approval rate (CEP A)", value: "68%", cls: "green", delta: "baseline" },
      { label: "Approval rate (CEP B)", value: "12%", cls: "red", delta: "mesma renda", deltaCls: "up" },
      { label: "Disparate impact", value: "5.6x", cls: "red", delta: "> limite legal 1.25x", deltaCls: "up" },
    ],
    timeline: [
      { t: "há 2 sem", ev: "<b>Modelo Personalize retreinado</b> com novo dataset", bad: true },
      { t: "há 3 dias", ev: "Time de fairness recebe primeiro alerta" },
      { t: "ontem 18h", ev: "<b>Reportagem do Globo</b> publicada", bad: true },
      { t: "há 1h", ev: "Ministério Público abre inquérito", bad: true },
    ],
    logs: [
      { ts: "08:30:00", lv: "INF", msg: "personalize.get_recommendations · userId=8472" },
      { ts: "08:30:01", lv: "WRN", msg: 'feature "neighborhood_cep" tem alta correlação com "race"' },
      { ts: "08:30:02", lv: "WRN", msg: "no Clarify report on last retraining" },
      { ts: "08:30:03", lv: "ERR", msg: "disparate impact = 5.6x · <b>limite legal: 1.25x</b>" },
      { ts: "08:30:04", lv: "INF", msg: "training data sample: 87% white in approved class" },
      { ts: "08:30:05", lv: "WRN", msg: "no bias detection in CI/CD pipeline" },
    ],
    actions: [
      { id: "inv-features", type: "investigate", name: "Inspecionar features do modelo", hint: "+1min", reveals: "features", timeCost: 60 },
      { id: "inv-data", type: "investigate", name: "Auditar training data", hint: "+1min", reveals: "data", timeCost: 60 },
      { id: "remove-cep", name: "✂ Remover feature CEP", hint: "rápido, mas paliativo", grade: "C", costDelta: 1200, xp: 80, verdict: "Trata sintoma, não doença.", sub: "CEP correlaciona com nome de rua, escola, transporte — o viés volta por outras features. Clarify mostraria isso." },
      { id: "clarify-retrain", name: "🔬 Clarify report + retrain balanceado", hint: "~2h offline", grade: "A+", costDelta: 2400, xp: 350, verdict: "Excelente.", sub: "SageMaker Clarify gera relatório de bias pre/post training. Tu rebalanceia dataset, retreina, valida." },
      { id: "shutdown-personalize", name: "⛔ Desligar Personalize", hint: "volta pra ordem manual", grade: "D", costDelta: 8200, xp: 40, verdict: "Excessivo.", sub: 'Resolve, mas perde 60% de eficiência. PR ruim ("tiraram o ML porque não souberam consertar").' },
      { id: "manual-rules", name: '📜 Adicionar regras manuais "anti-viés"', hint: "2 dias de trabalho", grade: "B-", costDelta: 3400, xp: 160, verdict: "Funciona, escala mal.", sub: "Hard-coding regras é frágil. Mês que vem outro viés surge." },
    ],
    rootCause: "O modelo foi retreinado com dataset que sub-representava bairros de baixa renda. CEP é proxy de raça no Brasil. Sem auditoria de bias (Clarify) antes do deploy, o modelo aprendeu a discriminar.",
    services: [
      { name: "SageMaker Clarify", role: "Solução", description: "Detecta bias em datasets e modelos. Roda antes do training (data bias) e depois (model bias). Gera relatório com métricas: disparate impact, demographic parity, equal opportunity." },
      { name: "SageMaker Model Monitor", role: "Prevenção", description: "Monitora drift no modelo em produção. Avisa quando distribuição de outputs muda — bias emergente entra aqui." },
      { name: "Personalize", role: "O culpado", description: "O serviço não é ruim — ele faz o que tu treinou pra fazer. Garbage in, garbage out. Sem Clarify no pipeline, ninguém sabia que o input tava tóxico." },
    ],
    examNote: "<code>SageMaker Clarify</code> é a resposta padrão pra bias/fairness no exame. Memoriza: detecta <em>pre-training bias</em> (dataset) e <em>post-training bias</em> (modelo). Decora as métricas: disparate impact, DPL, KL divergence.",
  },

  // ============================================================
  // SEV-2: Cost Explosion
  // ============================================================
  {
    id: "cost-explosion",
    sev: 2,
    title: "O Caro-Pra-Caramba",
    incId: "incident.bedrock-prod.cost-spike",
    customer: "Catbird E-commerce",
    slack: "#finance-alert",
    desc: "Conta da AWS deste mês tá projetada em $84k. No mês passado foi $9k. Algo tá invocando Bedrock sem parar.",
    short: "Custo Bedrock explodiu 9x · loop infinito?",
    ratePerMin: 140,
    initialCost: 18400,
    initialElapsed: 6 * 60 + 22,
    minLevel: 1,
    sparkType: "exponential",
    metrics: [
      { label: "Bedrock calls/min", value: "24,800", cls: "red", delta: "normal: 800", deltaCls: "up" },
      { label: "Avg tokens/call", value: "12,400", cls: "red", delta: "normal: 800", deltaCls: "up" },
      { label: "Custo projetado", value: "$84,200", cls: "red", delta: "orçado: $9k", deltaCls: "up" },
    ],
    timeline: [
      { t: "há 3 dias", ev: '<b>Deploy</b> · feature "AI auto-reply" lançada', bad: true },
      { t: "há 2 dias", ev: "Volume de chamadas começa a subir" },
      { t: "ontem", ev: "CFO recebe alerta de billing", bad: true },
      { t: "agora", ev: '<b>CTO no DM:</b> "explica isso em 10 min"', bad: true },
    ],
    logs: [
      { ts: "14:22:01", lv: "INF", msg: "bedrock.invoke · model=claude-opus · tokens=14k" },
      { ts: "14:22:02", lv: "WRN", msg: "same conversation invoking bedrock 8x in 4s" },
      { ts: "14:22:03", lv: "INF", msg: "auto-reply triggered auto-reply triggered auto-reply..." },
      { ts: "14:22:04", lv: "ERR", msg: "<b>recursion detected</b> · email → bot → email → bot..." },
      { ts: "14:22:05", lv: "WRN", msg: "no rate limit on outbound emails" },
      { ts: "14:22:06", lv: "INF", msg: "using claude-opus for FAQ replies · could be haiku" },
    ],
    actions: [
      { id: "inv-recursion", type: "investigate", name: "Investigar logs de email", hint: "+1min", reveals: "recursion", timeCost: 60 },
      { id: "inv-model", type: "investigate", name: "Ver qual modelo tá sendo usado", hint: "+30s", reveals: "model", timeCost: 30 },
      { id: "kill-feature", name: "⛔ Desligar AI auto-reply", hint: "feature down", grade: "B", costDelta: 4200, xp: 160, verdict: "Para o sangue.", sub: "Perde feature. CTO satisfeito por agora. Mas não aprendeu nada." },
      { id: "switch-model", name: "🔄 Trocar Opus → Haiku", hint: "mantém feature, custo /10", grade: "A-", costDelta: 2800, xp: 220, verdict: "Bom.", sub: "Haiku é 10x mais barato, suficiente pra FAQ. Mas o problema do loop continua latente." },
      { id: "rate-limit", name: "🛡 Adicionar rate limit + circuit breaker", hint: "~30min", grade: "A+", costDelta: 1200, xp: 340, verdict: "Excelente.", sub: "Loop infinito não acontece de novo. Circuit breaker é boa prática. CTO te elogia no all-hands." },
      { id: "provisioned", name: "📦 Comprar Provisioned Throughput", hint: "reduz custo unitário", grade: "D", costDelta: 24000, xp: 30, verdict: "Pior decisão.", sub: "PT tem custo fixo alto. Resolve preço por token, não o volume insano." },
    ],
    rootCause: 'A feature "AI auto-reply" não tinha proteção contra loop: cliente recebia email do bot, respondia automático, bot respondia de novo. Pior: tava usando Claude Opus pra responder FAQs simples — 10x mais caro que Haiku resolveria.',
    services: [
      { name: "Bedrock", role: "Onde queimou", description: "O serviço expõe vários modelos: Claude Opus (caro, smart), Sonnet (médio), Haiku (rápido, barato). Escolher o modelo certo é FinOps básico." },
      { name: "Provisioned Throughput", role: "Pra alto volume", description: "Compra throughput fixo. Caro como base, vale se tu tem volume previsível. Pra pico de incidente, NÃO é solução." },
      { name: "CloudWatch + Cost Anomaly", role: "Prevenção", description: "CloudWatch alarms pra calls/min + AWS Cost Anomaly Detection pra spikes de billing. Teria pegado isso no dia 1." },
    ],
    examNote: "Trade-off Opus vs Sonnet vs Haiku cai no exame. <code>Haiku</code> = rápido e barato, <code>Sonnet</code> = balanceado, <code>Opus</code> = mais inteligente, mais caro. Pra FAQ → Haiku. Pra reasoning complexo → Sonnet/Opus.",
  },

  // ============================================================
  // SEV-2: RAG Stale
  // ============================================================
  {
    id: "rag-stale",
    sev: 2,
    title: "O Manual Desatualizado",
    incId: "incident.support.rag-outdated",
    customer: "Petrópolis Software",
    slack: "#support-eng",
    desc: 'Bot de suporte tá citando manual de 2 anos atrás. Cliente ligando dizendo "isso já não existe mais no produto".',
    short: "Knowledge Base com documento desatualizado",
    ratePerMin: 60,
    initialCost: 3400,
    initialElapsed: 32 * 60,
    minLevel: 0,
    sparkType: "flat",
    metrics: [
      { label: "Rejection rate", value: "42%", cls: "red", delta: "↑ +28%", deltaCls: "up" },
      { label: "KB last refresh", value: "94 dias", cls: "amber", delta: "política: 7 dias", deltaCls: "up" },
      { label: "Tickets reabertos", value: "31", cls: "amber", delta: "↑ +18 (1d)", deltaCls: "up" },
    ],
    timeline: [
      { t: "há 3 meses", ev: "<b>Última sync do Knowledge Base</b>", bad: true },
      { t: "há 2 meses", ev: "Time de produto lançou v3 (nova UI)" },
      { t: "há 1 mês", ev: "Job de sync do KB começa a falhar silenciosamente", bad: true },
      { t: "há 3 dias", ev: 'Reclamações de "info errada" começam' },
    ],
    logs: [
      { ts: "14:45:00", lv: "INF", msg: "bedrock.retrieve_and_generate · kb=support-docs" },
      { ts: "14:45:01", lv: "WRN", msg: "retrieved chunk dated 2023-11-12 (very old)" },
      { ts: "14:45:02", lv: "ERR", msg: "cron job <b>kb-sync</b> failed 47 times · last success 94d ago" },
      { ts: "14:45:03", lv: "INF", msg: "IAM error: kb-sync role lost s3:GetObject after audit" },
      { ts: "14:45:04", lv: "WRN", msg: "no alert configured on kb-sync failure" },
      { ts: "14:45:05", lv: "INF", msg: "OpenSearch index size: same as 3 months ago" },
    ],
    actions: [
      { id: "inv-cron", type: "investigate", name: "Verificar jobs de sync", hint: "+30s", reveals: "cron", timeCost: 30 },
      { id: "manual-refresh", name: "🔄 Refresh manual do KB", hint: "~10min", grade: "C", costDelta: 1800, xp: 90, verdict: "Resolve hoje.", sub: "Mês que vem desatualiza de novo. Não atacou a raiz (IAM + alerting)." },
      { id: "fix-iam", name: "🔐 Corrigir IAM + reativar cron", hint: "~30min", grade: "A-", costDelta: 900, xp: 240, verdict: "Bom.", sub: "Job volta. Mas se falhar de novo, ninguém vai saber." },
      { id: "fix-plus-alert", name: "🔔 IAM + alert + auto-sync no push", hint: "~1h", grade: "A+", costDelta: 600, xp: 330, verdict: "Excelente.", sub: "Resolve hoje, previne futuro, automatiza sync quando docs mudarem. Sênior level." },
      { id: "just-tell-customer", name: "📞 Suporte humano cobre", hint: "sem tech change", grade: "F", costDelta: 6200, xp: 10, verdict: "Falha em pensar a longo prazo.", sub: "Equipe inteira apagando incêndio que tu causou." },
    ],
    rootCause: "O job que sincronizava S3 → Knowledge Base tava falhando silenciosamente há 3 meses por mudança de IAM. Sem alerting, ninguém viu. O bot continuou respondendo com base no que tinha indexado lá atrás.",
    services: [
      { name: "Bedrock Knowledge Bases", role: "Onde tava o problema", description: "O KB indexa documentos do S3 em embeddings usando OpenSearch ou Aurora pgvector. Pra RAG funcionar, esse índice precisa estar fresh." },
      { name: "S3 Event Notifications", role: "Solução", description: "Quando arquivo muda no S3, dispara Lambda que atualiza o KB. Sync automático em vez de cron." },
      { name: "CloudWatch Alarms", role: "Prevenção", description: 'Alarm em "cron job falhou X vezes" + SNS pra Slack. Job falhando 47x sem ninguém ver não pode acontecer.' },
    ],
    examNote: "RAG pipeline: <code>S3</code> → <code>Knowledge Base (Titan embeddings)</code> → <code>OpenSearch</code> → <code>Bedrock (LLM)</code>. Cada peça pode falhar. Conhece o fluxo todo.",
  },

  // ============================================================
  // SEV-2: Transcribe Medical
  // ============================================================
  {
    id: "transcribe-medical",
    sev: 2,
    title: "O Médico Erra Diagnóstico",
    incId: "incident.medtech.transcribe-wrong",
    customer: "ClinicAI",
    slack: "#medtech-urgent",
    desc: 'App que transcreve consultas tá grafando "5mg" como "50mg" e "asma" como "afta". Médico já errou prescrição.',
    short: "Transcribe genérico em contexto médico",
    ratePerMin: 300,
    initialCost: 7800,
    initialElapsed: 18 * 60 + 12,
    minLevel: 2,
    sparkType: "spike",
    metrics: [
      { label: "Word error rate", value: "18.4%", cls: "red", delta: "aceitável: <5%", deltaCls: "up" },
      { label: "Termos clínicos errados", value: "~38%", cls: "red", delta: "crítico", deltaCls: "up" },
      { label: "Diagnósticos afetados", value: "47", cls: "red", delta: "↑ +47 (1d)", deltaCls: "up" },
    ],
    timeline: [
      { t: "há 6 meses", ev: "<b>Sistema lançado</b> com Transcribe padrão", bad: true },
      { t: "há 3 meses", ev: "Médico reportou primeiro erro" },
      { t: "há 1 mês", ev: 'Time de QA disse "vamos investigar"' },
      { t: "ontem", ev: "<b>Paciente teve reação a dose errada</b>", bad: true },
    ],
    logs: [
      { ts: "10:14:22", lv: "INF", msg: "transcribe.start_transcription_job · audio=consult_4471.mp3" },
      { ts: "10:14:24", lv: "WRN", msg: "medical vocabulary not loaded" },
      { ts: "10:14:25", lv: "ERR", msg: 'detected: "five megrams" → transcribed as "five megabytes"' },
      { ts: "10:14:26", lv: "WRN", msg: "no custom vocabulary for drug names" },
      { ts: "10:14:27", lv: "INF", msg: "transcribe variant: <b>standard (not medical)</b>" },
      { ts: "10:14:28", lv: "ERR", msg: 'word "amoxicilina" not in default vocabulary' },
    ],
    actions: [
      { id: "inv-config", type: "investigate", name: "Ver config do Transcribe", hint: "+30s", reveals: "config", timeCost: 30 },
      { id: "add-vocab", name: "📚 Custom Vocabulary com termos clínicos", hint: "~2h trabalho", grade: "B-", costDelta: 3200, xp: 170, verdict: "Bom paliativo.", sub: "Reduz erro pra ~8%. Mas ainda fica abaixo do médico humano. Tem solução melhor." },
      { id: "switch-medical", name: "🏥 Migrar pra Transcribe Medical", hint: "~1 dia migração", grade: "A+", costDelta: 1800, xp: 380, verdict: "Excelente.", sub: "Modelo treinado em termos médicos. WER cai pra ~3%. Existe variante específica do serviço — usa." },
      { id: "human-review", name: "👁 Toda transcrição revisada por humano", hint: "não escala", grade: "D", costDelta: 9400, xp: 40, verdict: "Burra.", sub: "Vira gargalo, custa fortuna. Defeats the purpose." },
      { id: "shutdown-feature", name: "⛔ Desliga até resolver", hint: "sem AI por enquanto", grade: "C-", costDelta: 4800, xp: 60, verdict: "Conservador.", sub: "Reduz risco mas perde valor do produto. Médicos voltam pro papel." },
    ],
    rootCause: "O time usou <code>Amazon Transcribe</code> padrão (treinado em fala genérica). Há uma variante especializada — <code>Transcribe Medical</code> — treinada em vocabulário clínico, conversas médico-paciente, ditados de prontuário. Custa o mesmo, performa muito melhor.",
    services: [
      { name: "Transcribe Medical", role: "A solução", description: "Variante especializada de Transcribe. Treinada em dicionário médico, termos farmacêuticos, dosagens. HIPAA-eligible. WER ~3% em consultas vs ~15% do Transcribe padrão." },
      { name: "Custom Vocabulary", role: "Complemento", description: "Mesmo no Transcribe Medical, dá pra adicionar jargão específico da clínica (procedimentos internos, abreviações da equipe)." },
      { name: "Comprehend Medical", role: "Próximo passo", description: "Depois de transcrever, Comprehend Medical extrai entidades clínicas (medicação, dosagem, sintoma) num formato pra prontuário eletrônico (FHIR)." },
    ],
    examNote: "<code>Transcribe Medical</code> e <code>Comprehend Medical</code> são serviços específicos. Cai em pergunta tipo \"qual serviço usar pra transcrever consulta médica\" → resposta: Transcribe Medical (NÃO Transcribe).",
  },

  // ============================================================
  // SEV-3: Translation
  // ============================================================
  {
    id: "translation-domain",
    sev: 3,
    title: "O Lost in Translation",
    incId: "incident.intl.translate-jargon",
    customer: "GameForge Studios",
    slack: "#intl-launch",
    desc: 'Lançamento global do jogo. Tradução tá zoada — "headshot" virou "tiro na cabeça da galinha". Reviewers rindo no Reddit.',
    short: "Translate sem custom terminology · gaming",
    ratePerMin: 25,
    initialCost: 850,
    initialElapsed: 120 * 60,
    minLevel: 2,
    sparkType: "flat",
    metrics: [
      { label: "Term accuracy", value: "58%", cls: "red", delta: "esperado: 95%+", deltaCls: "up" },
      { label: "Review score Reddit", value: "2.4/10", cls: "red", delta: "caiu de 8.1", deltaCls: "up" },
      { label: "Refund requests", value: "1,420", cls: "amber", delta: "↑ (24h)", deltaCls: "up" },
    ],
    timeline: [
      { t: "há 5 dias", ev: "<b>Time fez review</b> · falou que tradução tava ok" },
      { t: "há 3 dias", ev: "Lançamento JP/CN/FR/ES" },
      { t: "há 2 dias", ev: "Streamers japoneses começaram a rir" },
      { t: "ontem", ev: '<b>Thread no Reddit:</b> "translation is hilariously bad"', bad: true },
    ],
    logs: [
      { ts: "12:00:00", lv: "INF", msg: 'translate.translate_text · "headshot" → "tiro na cabeça"' },
      { ts: "12:00:01", lv: "WRN", msg: "no custom terminology dictionary loaded" },
      { ts: "12:00:02", lv: "INF", msg: 'general gaming terms missing: "crit", "buff", "nerf", "AOE"' },
      { ts: "12:00:03", lv: "ERR", msg: '"crit chance" → "chance crítica" (correto seria não traduzir)' },
    ],
    actions: [
      { id: "inv-glossary", type: "investigate", name: "Ver se há glossário do jogo", hint: "+30s", reveals: "glossary", timeCost: 30 },
      { id: "custom-term", name: "📚 Custom Terminology no Translate", hint: "~4h pra carregar glossário", grade: "A+", costDelta: 600, xp: 280, verdict: "Excelente.", sub: 'Translate aceita TMX/CSV com termos do domínio. "headshot" fica "headshot" em todas as línguas. Solução nativa, barata.' },
      { id: "manual-team", name: "👥 Contratar tradutor humano por idioma", hint: "1 mês de delay", grade: "C", costDelta: 4200, xp: 80, verdict: "Caro e lento.", sub: "Funciona, mas mata o lançamento. Translate + Custom Terminology faz o mesmo em 4h." },
      { id: "switch-bedrock", name: "🧠 Trocar pra Bedrock (LLM)", hint: "mais caro mas contexto", grade: "B", costDelta: 1800, xp: 150, verdict: "Funciona, é over.", sub: "LLM entende contexto melhor, mas custa 50x mais que Translate. Pra strings curtas é desperdício." },
      { id: "apologize", name: "📢 Pedir desculpa, manter ruim", hint: "gerência ri", grade: "F", costDelta: 8200, xp: 10, verdict: "Pior decisão de carreira.", sub: "Refunds explodem. CEO te procura." },
    ],
    rootCause: 'Translate é otimizado pra texto genérico. Em domínios com jargão (gaming, jurídico, médico), traduções literais quebram. A solução é Custom Terminology — um dicionário de "esses termos NÃO traduz" ou "esses termos traduz assim".',
    services: [
      { name: "Translate", role: "Onde tava errado", description: "Tradução neural rápida, barata (~$15/1M chars). Cobre 75 idiomas. Default é tradução literal — boa pra texto comum." },
      { name: "Translate Custom Terminology", role: "A solução", description: "Tu sobe um arquivo (TMX, CSV) com pares termo origem → termo destino pra cada idioma. Translate respeita." },
      { name: "Bedrock (LLM)", role: "Alternativa cara", description: "Pra casos onde Custom Terminology não basta (literatura, marketing copy com nuance), LLM entrega tradução criativa. Mas custa 50-100x mais." },
    ],
    examNote: "<code>Custom Terminology</code> é solução padrão do Translate pra domínios específicos. Memoriza: TMX (padrão da indústria) ou CSV são os formatos aceitos.",
  },

  // ============================================================
  // SEV-1: Image Moderation
  // ============================================================
  {
    id: "image-mod-fail",
    sev: 1,
    title: "O Moderador Cego",
    incId: "incident.social.moderation-bypass",
    customer: "Loop Social",
    slack: "#trust-and-safety",
    desc: 'Plataforma social com 2M users. Conteúdo ofensivo passando pela moderação. Diretoria perguntando "cadê a IA?".',
    short: "Rekognition moderação labels desconfiguradas",
    ratePerMin: 520,
    initialCost: 11800,
    initialElapsed: 22 * 60 + 45,
    minLevel: 2,
    sparkType: "spike",
    metrics: [
      { label: "Flagged por user", value: "2,847", cls: "red", delta: "↑ +400% (3d)", deltaCls: "up" },
      { label: "Tempo médio remoção", value: "14h", cls: "red", delta: "SLA: 5min", deltaCls: "up" },
      { label: "Reports IRL (DSA)", value: "3", cls: "red", delta: "risco regulatório", deltaCls: "up" },
    ],
    timeline: [
      { t: "há 1 mês", ev: "<b>Engenheiro saiu</b> sem doc do moderation pipeline" },
      { t: "há 2 sem", ev: "Rekognition config alterada por outro time" },
      { t: "há 1 sem", ev: "Confidence threshold subiu pra 99% silenciosamente", bad: true },
      { t: "ontem", ev: "<b>Mídia internacional</b> publicou matéria", bad: true },
    ],
    logs: [
      { ts: "15:30:00", lv: "INF", msg: "rekognition.detect_moderation_labels · img=8472.jpg" },
      { ts: "15:30:01", lv: "INF", msg: "returned: label=Violence confidence=87%" },
      { ts: "15:30:02", lv: "WRN", msg: "label IGNORED · threshold set to 99%" },
      { ts: "15:30:03", lv: "INF", msg: "image NOT flagged · posted to feed" },
      { ts: "15:30:04", lv: "WRN", msg: "sister image flagged 2 weeks ago at 80% threshold" },
      { ts: "15:30:05", lv: "ERR", msg: "config drift: moderation_threshold = 99% (was 80%)" },
    ],
    actions: [
      { id: "inv-threshold", type: "investigate", name: "Ver config histórica", hint: "+30s", reveals: "threshold", timeCost: 30 },
      { id: "inv-pipeline", type: "investigate", name: "Inspecionar pipeline completo", hint: "+1min", reveals: "pipeline", timeCost: 60 },
      { id: "reset-threshold", name: "🔧 Voltar threshold pra 80%", hint: "~5min", grade: "A-", costDelta: 1200, xp: 240, verdict: "Bom.", sub: 'Resolve imediato. Mas e o próximo "engineer" que mexer sem doc?' },
      { id: "reset-plus-iac", name: "📜 Threshold + IaC + alerts", hint: "~2h", grade: "A+", costDelta: 800, xp: 360, verdict: "Excelente.", sub: "Resolve agora, codifica config em Terraform, alerta se alguém mudar. Próxima geração não passa por isso." },
      { id: "human-mod", name: "👥 Contratar 50 moderadores", hint: "mês de onboarding", grade: "D", costDelta: 14200, xp: 40, verdict: "Cara e lenta.", sub: "Não escala pra 2M users. Custo: $300k/ano. Rekognition custa $1/1k images." },
      { id: "hide-all", name: "🙈 Hide tudo até revisar", hint: "feed vazio", grade: "F", costDelta: 24000, xp: 10, verdict: "Mata o produto.", sub: "Users vão pra concorrência. Stock cai. Demitido na sexta." },
    ],
    rootCause: "Rekognition retorna labels (Violence, Nudity, Drugs, etc) com confidence score. Threshold padrão é 80% — abaixo disso o flag é ignorado. Alguém subiu pra 99% (talvez pra reduzir falso-positivo) sem entender que isso deixa quase tudo passar. Sem IaC, sem alerta, ninguém viu.",
    services: [
      { name: "Rekognition", role: "O moderador", description: "Tem API <code>detect_moderation_labels</code> que retorna categorias (Violence, Hate, Drugs, Suggestive) com confidence. Funciona em image E video." },
      { name: "Confidence threshold", role: "A pegadinha", description: "Muito baixo = falso positivo. Muito alto = passa coisa. Ideal: 80-90% pra moderação geral, 95%+ se contexto exige." },
      { name: "Step Functions", role: "Pipeline", description: "Em pipelines críticos, cada step deve ter rollback e versionamento. Mudança de config = PR + review + IaC. Não tem botão \"mudar threshold em prod\" sem trilha." },
    ],
    examNote: "<code>Rekognition</code> moderation labels é caso clássico. Categorias top-level: Violence, Visually Disturbing, Nudity, Hate Symbols, Drugs/Alcohol. Confidence threshold é parâmetro da call.",
  },

  // ============================================================
  // SEV-0: BOSS — Multi-Phase Catastrophe
  // ============================================================
  {
    id: "the-cascade",
    sev: 0,
    title: "🔥 THE CASCADE",
    incId: "incident.global.everything-on-fire",
    customer: "Anthrofin Insurance (mission-critical)",
    slack: "#war-room-CEO-watching",
    desc: "Black Friday. Tudo conectado tá quebrando em cascata: Bedrock loop → KB stale → Comprehend rate limit → CloudFront 503. Cliente perdendo $4k/segundo. CEO no Slack.",
    short: "BOSS · 3 fases · cascading failure em todo o stack AI",
    ratePerMin: 1850,
    initialCost: 42000,
    initialElapsed: 4 * 60 + 12,
    minLevel: 3,
    sparkType: "chaotic",
    isBoss: true,
    metrics: [
      { label: "Revenue lost/sec", value: "$4,200", cls: "red", delta: "↑ Black Friday", deltaCls: "up" },
      { label: "Services down", value: "7 / 12", cls: "red", delta: "cascading", deltaCls: "up" },
      { label: "Stack trace depth", value: "∞", cls: "red", delta: "loop infinito", deltaCls: "up" },
    ],
    timeline: [
      { t: "T-12min", ev: "<b>Spike de tráfego</b> · Black Friday começou", bad: true },
      { t: "T-9min", ev: "Bedrock entrou em throttling" },
      { t: "T-7min", ev: "App começou a fazer retry agressivo · loop", bad: true },
      { t: "T-5min", ev: "<b>Knowledge Base começou a timeout</b>", bad: true },
      { t: "T-3min", ev: "Comprehend hit rate limit", bad: true },
      { t: "T-1min", ev: "<b>CEO no slack:</b> 'WHAT IS HAPPENING'", bad: true },
    ],
    logs: [
      { ts: "23:46:00", lv: "ERR", msg: "bedrock.invoke · <b>ThrottlingException</b> · retry 47" },
      { ts: "23:46:01", lv: "ERR", msg: "knowledge_base.retrieve · timeout 30s" },
      { ts: "23:46:02", lv: "WRN", msg: "comprehend.detect_pii · <b>RateLimitExceeded</b>" },
      { ts: "23:46:03", lv: "ERR", msg: "cloudfront origin response 503 · retry storm" },
      { ts: "23:46:04", lv: "ERR", msg: "lambda concurrent executions: <b>10,000 / 10,000</b>" },
      { ts: "23:46:05", lv: "ERR", msg: "DLQ flooding · <b>40k messages</b>" },
      { ts: "23:46:06", lv: "ERR", msg: "CEO is typing..." },
    ],
    actions: [], // boss uses phases instead
    phases: [
      // PHASE 1 — Stop the bleeding
      {
        name: "FASE 1 · Stop the bleeding",
        description: "Cascade tá expandindo. Tu precisa cortar circuit breakers em algum lugar.",
        duration: 90,
        metrics: [
          { label: "Bedrock retries/sec", value: "8,400", cls: "red", delta: "exponencial", deltaCls: "up" },
          { label: "Lambda concurrency", value: "100%", cls: "red", delta: "throttling", deltaCls: "up" },
          { label: "Error rate", value: "92%", cls: "red", delta: "↑↑↑", deltaCls: "up" },
        ],
        logs: [
          { ts: "23:47:01", lv: "ERR", msg: "lambda retry storm · 8400 invokes/sec" },
          { ts: "23:47:02", lv: "ERR", msg: "no exponential backoff configured" },
          { ts: "23:47:03", lv: "WRN", msg: "DLQ at 40k · growing 200/sec" },
        ],
        actions: [
          { id: "boss-p1-circuit", name: "🚨 Ativar Circuit Breaker via SSM", hint: "para cascading", grade: "A+", costDelta: 1200, xp: 200, verdict: "🟢 Fase 1 OK", sub: "Para o sangramento. Próxima fase: limpar a fila." },
          { id: "boss-p1-scale", name: "↑ Aumentar Lambda concurrency", hint: "vai piorar", grade: "F", costDelta: 12000, xp: 0, verdict: "💀 Game over phase 1", sub: "Mais concurrency = mais retry = pior. CFO acordou." },
          { id: "boss-p1-rollback", name: "↩ Rollback do deploy", hint: "demora 5min", grade: "C", costDelta: 6800, xp: 80, verdict: "🟡 Funciona mas lento", sub: "Para a cascata. Mas em Black Friday cada segundo são $4k." },
        ],
      },
      // PHASE 2 — Drain the queue
      {
        name: "FASE 2 · Drain the queue",
        description: "Sangramento parou. Agora tem 40k mensagens em DLQ pra reprocessar SEM derrubar tudo de novo.",
        duration: 90,
        metrics: [
          { label: "DLQ size", value: "41,847", cls: "amber", delta: "estabilizou", deltaCls: "down" },
          { label: "Bedrock health", value: "75%", cls: "amber", delta: "recuperando", deltaCls: "down" },
          { label: "SLA breach risk", value: "HIGH", cls: "red", delta: "60min restantes", deltaCls: "up" },
        ],
        logs: [
          { ts: "23:48:30", lv: "OK", msg: "circuit breaker active · bleeding stopped" },
          { ts: "23:48:31", lv: "WRN", msg: "DLQ: 41,847 messages waiting" },
          { ts: "23:48:32", lv: "INF", msg: "Bedrock throttling recovering" },
        ],
        actions: [
          { id: "boss-p2-replay-fast", name: "🚀 Replay tudo de uma vez", hint: "loop de novo", grade: "D", costDelta: 18000, xp: 30, verdict: "💀 Voltou pra fase 1", sub: "Mesma cascade. Tu não aprendeu nada." },
          { id: "boss-p2-replay-controlled", name: "🐌 Replay com rate limit + Haiku", hint: "30min mas seguro", grade: "A+", costDelta: 2400, xp: 250, verdict: "🟢 Fase 2 OK", sub: "Throttle no replay. Troca pra Haiku que tem mais throughput. Drena a fila sem nova cascade." },
          { id: "boss-p2-drop", name: "🗑 Dropar a fila inteira", hint: "perde requests", grade: "C-", costDelta: 8200, xp: 50, verdict: "🟡 Funciona com dano", sub: "41k clientes não vão receber resposta. Twitter PR ruim, mas serviço volta." },
        ],
      },
      // PHASE 3 — Root cause + post-mortem
      {
        name: "FASE 3 · Root cause permanente",
        description: "Serviço estabilizou. Agora a pergunta cara: por que aconteceu E como garantir que não acontece de novo na próxima Black Friday?",
        duration: 120,
        metrics: [
          { label: "Service health", value: "98%", cls: "green", delta: "recuperado", deltaCls: "down" },
          { label: "DLQ", value: "0", cls: "green", delta: "drenada", deltaCls: "down" },
          { label: "CEO mood", value: "tense", cls: "amber", delta: "esperando post-mortem", deltaCls: "up" },
        ],
        logs: [
          { ts: "00:18:42", lv: "OK", msg: "all services nominal" },
          { ts: "00:18:43", lv: "OK", msg: "DLQ drained · 41,847 processed" },
          { ts: "00:18:44", lv: "INF", msg: "estimated total impact: $4.2M revenue lost" },
        ],
        actions: [
          { id: "boss-p3-blame", name: "👉 Blame o último deploy", hint: "feio", grade: "F", costDelta: 0, xp: 0, verdict: "💀 Cultura tóxica", sub: "Engineer pediu demissão. Cultura blameful = próximo incidente vai ser pior." },
          { id: "boss-p3-postmortem", name: "📝 Blameless post-mortem + IaC", hint: "padrão da indústria", grade: "B", costDelta: 0, xp: 180, verdict: "🟢 Bom", sub: "Doc o incidente, ações pra prevenir. Profissional." },
          { id: "boss-p3-everything", name: "🏗 Post-mortem + Step Functions + Bedrock PT + chaos testing", hint: "carreira", grade: "A+", costDelta: 0, xp: 450, verdict: "🏆 STAFF ENGINEER UNLOCKED", sub: "Step Functions pra orquestrar retries com backoff. Bedrock Provisioned Throughput pra Black Friday. Gameday/chaos testing mensal. CEO te promove. Lenda nascida." },
        ],
      },
    ],
    rootCause: "Cascading failure clássico: Bedrock entrou em throttling natural na Black Friday → app tinha retry agressivo SEM exponential backoff → loop amplificou requests → derrubou Lambda concurrency → KB começou a timeout → Comprehend hit rate limit → CloudFront 503 → mais retry. Cada serviço sozinho funcionava. O sistema todo não.",
    services: [
      { name: "Step Functions", role: "Orquestração", description: "Workflows com retry + exponential backoff nativo. Se invokeBedrock falhar 3x, espera 2s, depois 4s, 8s. Loop infinito não existe." },
      { name: "Bedrock Provisioned Throughput", role: "Pra picos previsíveis", description: "Black Friday é previsível. PT compra throughput garantido — sem throttling. Caro de manter, mas em peak vale ouro." },
      { name: "SQS + DLQ", role: "Buffer + safety net", description: "Em vez de chamar Bedrock direto, joga numa SQS. Workers processam no ritmo. Falhas vão pra DLQ pra replay controlado." },
      { name: "CloudWatch + Anomaly Detection", role: "Observabilidade", description: "Cascading só se detecta quando tu tem dashboards de toda a stack. Anomaly Detection pega o spike antes de virar incêndio." },
      { name: "AWS Fault Injection Service", role: "Prevenção", description: "Chaos engineering oficial da AWS. Faz gameday todo mês injetando falhas controladas. Se o sistema cai, tu sabe antes do CEO." },
    ],
    examNote: "Cascading failures são tema sênior. Pro exame: <code>Step Functions</code> pra orquestração com retry, <code>Provisioned Throughput</code> pra cargas previsíveis, <code>SQS + DLQ</code> pra buffer. Conceitos de fault tolerance > saber API de qualquer serviço sozinho.",
  },
];

export function getIncidentById(id: string): Incident | undefined {
  return INCIDENTS.find((i) => i.id === id);
}
