import type { Incident } from "./types";

// Pedagogical mission order: easy → hard. Player meets one service at a time first,
// then conceptual stuff (metrics, inference, hardware), then advanced (Bedrock,
// responsibility AI, boss).
const MISSION_ORDER: string[] = [
  // ── Tier 0 · Junior (minLevel 0), single service, clear fix ──
  "polly-mispronounce",   // 1. Polly · Pronunciation Lexicon
  "translation-domain",   // 2. Translate · Custom Terminology
  "lex-fallback",         // 3. Lex · sample utterances
  "sentiment-flip",       // 4. Comprehend · LanguageCode
  "transcribe-medical",   // 5. Transcribe Medical (variant)
  "personalize-cold",     // 6. Personalize · cold-start recipe

  // ── Tier 1 · Mid (minLevel 1), config drift, inference types, algorithm choice ──
  "rekognition-paranoid", // 7. Rekognition · MinConfidence too low
  "image-mod-fail",       // 8. Rekognition · config drift opposite case
  "endpoint-too-expensive", // 9. Real-time vs Async vs Serverless
  "wrong-algorithm",      // 10. Classification vs Regression
  "training-eternal",     // 11. Trainium vs P4d

  // ── Tier 2 · Senior (minLevel 2), metrics, RAG, cost optimization ──
  "forecast-metrics-lie", // 12. MAE/RMSE/R²
  "fraud-99-percent",     // 13. Class balance + recall/F1
  "rag-stale",            // 14. RAG + IAM + monitoring
  "cost-explosion",       // 15. Loop + Opus/Haiku trade-off

  // ── Tier 3 · Staff (minLevel 3), Bedrock, security, responsible AI ──
  "hallucination",        // 16. Bedrock Guardrails
  "pii-leak",             // 17. PII + LGPD
  "bias",                 // 18. Proxy bias (responsible AI)

  // ── Boss ──
  "the-cascade",          // 19. Cascading failure
];

// Override minLevel per mission to enforce progression
const MISSION_LEVEL: Record<string, number> = {
  "polly-mispronounce": 0,
  "translation-domain": 0,
  "lex-fallback": 0,
  "sentiment-flip": 0,
  "transcribe-medical": 0,
  "personalize-cold": 0,
  "rekognition-paranoid": 1,
  "image-mod-fail": 1,
  "endpoint-too-expensive": 1,
  "wrong-algorithm": 1,
  "training-eternal": 1,
  "forecast-metrics-lie": 2,
  "fraud-99-percent": 2,
  "rag-stale": 2,
  "cost-explosion": 2,
  "hallucination": 3,
  "pii-leak": 3,
  "bias": 3,
  "the-cascade": 3,
};

const ALL_INCIDENTS: Incident[] = [
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
    desc: "São 3h05 da madrugada. Teu celular vibra feito louco, o canal #war-room-helix tá pegando fogo. A Helix Labs (saúde digital) fez deploy do chatbot médico há 5 minutos. Os primeiros tickets chegaram dizendo que o bot mandou tomar 80mg de ibuprofeno (a dose certa é 8mg). O time legal de um cliente já encaminhou print da conversa pro email do CEO. Tá só você, o servidor e três horas até o time da Europa acordar.",
    short: "Bedrock alucinando · resposta médica perigosa",
    slackRecap: "Confirmado: o deploy de hoje (v2.4.1) <b>removeu as regras de segurança</b> que tavam no prompt do sistema. Sem aquela camada de instruções, o modelo tá respondendo qualquer coisa, inclusive recomendações médicas. 47 conversas problemáticas só na última hora.",
    hint: "Tudo começou com um deploy de madrugada que removeu regras do prompt. Pensa em <b>recursos do próprio Bedrock pra impor restrições</b> além do prompt, algo que age como camada de proteção.",
    quizQuestion: {
      question: "Você quer EVITAR que um chatbot Bedrock dê conselhos médicos, mesmo se o usuário pedir explicitamente ou tentar contornar com prompts criativos. Qual abordagem é MAIS ROBUSTA?",
      options: [
        "Adicionar 'não fale de medicina' no prompt do sistema",
        "Treinar o modelo com fine-tuning específico",
        "Configurar Guardrails com Denied Topics",
        "Bloquear o usuário via IAM",
      ],
      correctIdx: 2,
      explanation: "<b>Guardrails</b> agem como camada EXTERNA ao prompt, não dá pra ser ignorada via jailbreak. Prompts no sistema podem ser sobrescritos por instruções criativas do usuário. Fine-tuning é caro e demorado. IAM controla quem ACESSA o modelo, não o CONTEÚDO que ele gera.",
    },
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
      { ts: "03:17", lv: "INF", msg: "Bedrock respondeu cliente · 2,8 segundos" },
      { ts: "03:17", lv: "WRN", msg: "Guardrails (proteção): <b>DESABILITADO</b>" },
      { ts: "03:17", lv: "ERR", msg: '🚨 Cliente reclamou: "bot mandou tomar 80mg de ibuprofeno"' },
      { ts: "03:17", lv: "INF", msg: "Prompt em uso: v2.4.1 (sem regras de segurança)" },
      { ts: "03:17", lv: "WRN", msg: "Bedrock Guardrails: <b>NÃO CONFIGURADO</b>" },
      { ts: "03:17", lv: "ERR", msg: '🚨 Cliente reclamou: "bot recomendou remédio que não existe"' },
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
      'O deploy v2.4.1 removeu o "safety preamble" do prompt do Bedrock e a flag de Guardrails estava desabilitada nesse endpoint específico (legado de migração). Sem barreira, o modelo passou a responder qualquer coisa, inclusive recomendações médicas que não tinha autorização pra dar.',
    services: [
      { name: "Bedrock", role: "Foundation model", description: "O LLM que tava gerando as respostas. O modelo em si não tem culpa, ele responde o que o prompt pede. A culpa foi de quem tirou as instruções de segurança." },
      { name: "Bedrock Guardrails", role: "Solução", description: "Camada de segurança que bloqueia tópicos proibidos (medicina, finanças, política) antes da resposta sair. Definida 1x, aplica em todas as chamadas." },
      { name: "Comprehend Medical", role: "Defesa extra", description: "Detecta se a resposta menciona medicamentos, dosagens, sintomas, e bloqueia se sim. Camada extra além do Guardrails." },
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
    desc: "Trustly Bank, 3h08 da manhã. O Slack #war-room-trustly começou a explodir quando a equipe de auditoria detectou um padrão estranho: depois do último deploy, o bot de atendimento começou a citar dados pessoais dos clientes nas respostas. CPF, número de cartão, RG, tudo em texto puro. O jurídico acordou na mesa, dizendo \"a LGPD vai ralar a gente\". O CEO ligou pro CTO. O CTO ligou pra ti.",
    short: "PII vazando em respostas do bot · LGPD risk",
    slackRecap: "Confirmado: o novo prompt manda o bot <b>'personalizar usando dados do cliente'</b>, e as respostas tão saindo com CPF, RG e número de cartão em texto puro. Já vazou dados de 47 clientes em 2h. Sem nenhum filtro entre o modelo e a resposta. Jurídico no telhado.",
    hint: "O prompt manda usar dados pessoais livremente. Vazamento de PII em chatbot AWS resolve-se com <b>uma feature específica do Bedrock</b> que detecta e bloqueia dados sensíveis nas respostas.",
    quizQuestion: {
      question: "Antes de enviar dados pra treinar um modelo de ML, você precisa REMOVER OU MASCARAR dados sensíveis (CPF, cartão, email) que aparecem nos textos. Qual feature do Amazon Comprehend ajuda nisso?",
      options: [
        "DetectSentiment",
        "DetectEntities",
        "DetectPiiEntities",
        "DetectDominantLanguage",
      ],
      correctIdx: 2,
      explanation: "<b>DetectPiiEntities</b> identifica e localiza CPF, RG, cartão, email, telefone, etc em textos, devolvendo offsets pra você redact/mascarar. Útil em pipelines de ML pra anonimizar dados antes do treino. <b>DetectEntities</b> pega entidades nomeadas (pessoas, lugares, organizações) sem foco em PII.",
    },
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
      { ts: "03:08", lv: "INF", msg: "Bot respondeu ao cliente" },
      { ts: "03:08", lv: "WRN", msg: "Resposta contém padrão de <b>CPF</b> (11 dígitos)" },
      { ts: "03:08", lv: "ERR", msg: "🚨 Sem filtro de dados pessoais antes de enviar" },
      { ts: "03:08", lv: "INF", msg: '⚠️ Novo prompt pede "personalize: cite dados do cliente"' },
      { ts: "03:08", lv: "WRN", msg: "Comprehend (detecção de PII): <b>não está sendo chamado</b>" },
      { ts: "03:08", lv: "ERR", msg: "🚨 Última hora: <b>3 CPFs + 1 número de cartão</b> vazados" },
    ],
    actions: [
      { id: "investigate-prompt", type: "investigate", name: "Verificar novo prompt", hint: "+30s · grátis", reveals: "prompt", timeCost: 30 },
      { id: "investigate-logs2", type: "investigate", name: "Auditar últimas respostas", hint: "+30s · grátis", reveals: "leaks", timeCost: 30 },
      { id: "shutdown", name: "⛔ Desligar o bot inteiro", hint: "sem atendimento, mas zero leak", grade: "B", costDelta: 3200, xp: 140, verdict: "Seguro. Bruto.", sub: 'Parou o sangue. Mas deixa milhares sem atendimento. Senior diria "porque não usou Comprehend?".' },
      { id: "comprehend", name: "🛡 Pipe Comprehend pra redact PII", hint: "~2min · resposta volta em 30s", grade: "A+", costDelta: 1400, xp: 300, verdict: "Excelente.", sub: "Causa-raiz tratada sem derrubar serviço. Amazon Comprehend detecta e mascara PII automaticamente." },
      { id: "rollback-prompt", name: "↩ Rollback do prompt", hint: "~1min downtime", grade: "A-", costDelta: 1800, xp: 200, verdict: "Bom.", sub: "Volta o prompt antigo que não pede dados pessoais. Resolve mas não previne o próximo deploy ruim." },
      { id: "manual-review", name: "👁 Time humano revisa cada resposta", hint: "impossível em escala", grade: "F", costDelta: 18000, xp: 10, verdict: "Inviável.", sub: "8 mil chamadas/dia, ninguém revisa. SLA vai pro espaço." },
    ],
    rootCause: "Deploy do prompt novo encorajou personalização: o bot passou a citar dados do cliente nas respostas (CPF, cartão). Não havia camada de PII redaction no pipeline, o modelo respondia, ia direto pro cliente.",
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
    desc: "Quinta-feira, 9h. Tu abre o LinkedIn e vê uma reportagem do Estadão circulando: 'Sistema de IA de imobiliária aprova 87% dos pedidos de bairros nobres e 4% das periferias'. Tua cliente. O time legal marcou call pras 10h. O modelo é o sistema de pontuação de crédito imobiliário que entrou em produção há 6 meses, alguém precisa entender o que aconteceu antes do call, e o histórico recente do treinamento aponta pra um problema no dataset.",
    short: "Personalize discriminando por CEP · viés racial",
    slackRecap: "Confirmado: o modelo usa <b>CEP</b> como feature de maior importância (0,42). Dataset tem 87% das aprovações vindas de bairros nobres, periferia quase ausente. Aprovação cai de 76% (zona sul) pra 11% (zona oeste). CEP tá funcionando como proxy de algo que ele não deveria estar capturando.",
    hint: "CEP é a feature principal (importância 0,42) e correlaciona 0,78 com raça. Pensa: <b>tirar a feature</b>, <b>balancear o dataset</b>, ou usar uma <b>ferramenta AWS específica pra detectar viés</b>?",
    quizQuestion: {
      question: "Você quer entender QUAIS FEATURES mais influenciaram uma predição INDIVIDUAL do modelo (ex: por que o crédito desse cliente específico foi NEGADO). Qual técnica ajuda nisso?",
      options: [
        "F1 Score",
        "SHAP values",
        "Cross-validation",
        "Bias-Variance tradeoff",
      ],
      correctIdx: 1,
      explanation: "<b>SHAP</b> (SHapley Additive exPlanations) quantifica a contribuição de cada feature pra cada predição específica. Diz coisas como 'esse cliente foi negado porque idade contribuiu +0.3 pra negação, renda contribuiu -0.5'. Faz parte do SageMaker Clarify. F1 é métrica geral. CV é validação. Bias-Variance é teoria sobre overfit/underfit.",
    },
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
      { ts: "08:30", lv: "INF", msg: "Modelo de crédito gerou recomendação · cliente 8472" },
      { ts: "08:30", lv: "WRN", msg: 'Feature <b>"CEP do bairro"</b> tem alta correlação com <b>raça</b>' },
      { ts: "08:30", lv: "WRN", msg: "Último treinamento: <b>sem análise do SageMaker Clarify</b>" },
      { ts: "08:30", lv: "ERR", msg: "🚨 Disparate impact = 5,6× · <b>limite legal: 1,25×</b>" },
      { ts: "08:30", lv: "INF", msg: "Amostra do dataset: 87% das aprovações vêm de uma só região" },
      { ts: "08:30", lv: "WRN", msg: "Pipeline CI/CD: <b>nenhuma checagem de viés</b>" },
    ],
    actions: [
      { id: "inv-features", type: "investigate", name: "Inspecionar features do modelo", hint: "+1min", reveals: "features", timeCost: 60 },
      { id: "inv-data", type: "investigate", name: "Auditar training data", hint: "+1min", reveals: "data", timeCost: 60 },
      { id: "remove-cep", name: "✂ Remover feature CEP", hint: "rápido, mas paliativo", grade: "C", costDelta: 1200, xp: 80, verdict: "Trata sintoma, não doença.", sub: "CEP correlaciona com nome de rua, escola, transporte, o viés volta por outras features. Clarify mostraria isso." },
      { id: "clarify-retrain", name: "🔬 Clarify report + retrain balanceado", hint: "~2h offline", grade: "A+", costDelta: 2400, xp: 350, verdict: "Excelente.", sub: "SageMaker Clarify gera relatório de bias pre/post training. Tu rebalanceia dataset, retreina, valida." },
      { id: "shutdown-personalize", name: "⛔ Desligar Personalize", hint: "volta pra ordem manual", grade: "D", costDelta: 8200, xp: 40, verdict: "Excessivo.", sub: 'Resolve, mas perde 60% de eficiência. PR ruim ("tiraram o ML porque não souberam consertar").' },
      { id: "manual-rules", name: '📜 Adicionar regras manuais "anti-viés"', hint: "2 dias de trabalho", grade: "B-", costDelta: 3400, xp: 160, verdict: "Funciona, escala mal.", sub: "Hard-coding regras é frágil. Mês que vem outro viés surge." },
    ],
    rootCause: "O modelo foi retreinado com dataset que sub-representava bairros de baixa renda. CEP é proxy de raça no Brasil. Sem auditoria de bias (Clarify) antes do deploy, o modelo aprendeu a discriminar.",
    services: [
      { name: "SageMaker Clarify", role: "Solução", description: "Detecta bias em datasets e modelos. Roda antes do training (data bias) e depois (model bias). Gera relatório com métricas: disparate impact, demographic parity, equal opportunity." },
      { name: "SageMaker Model Monitor", role: "Prevenção", description: "Monitora drift no modelo em produção. Avisa quando distribuição de outputs muda, bias emergente entra aqui." },
      { name: "Personalize", role: "O culpado", description: "O serviço não é ruim, ele faz o que tu treinou pra fazer. Garbage in, garbage out. Sem Clarify no pipeline, ninguém sabia que o input tava tóxico." },
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
    desc: "Terça-feira, 14h22. O CFO abre o Cost Explorer da AWS pra preparar o report mensal pro board. Número na tela: $84.000 projetados pra este mês. Mês passado foi $9.000. Ele vai direto pro Slack: 'pessoal, alguém pode explicar isso até as 15h?'. O Ricardo (SRE) pinga teu nick. Tu olha o gráfico: o pico começou exatamente quando ativaram o auto-resposta de email. Bedrock invocado milhares de vezes por hora.",
    short: "Custo Bedrock explodiu 9x · loop infinito?",
    slackRecap: "Confirmado: o auto-resposta de email entrou em <b>loop infinito</b> (bot responde, email volta como bounce, bot responde de novo). 1.247 sessões em loop. Pior: tá usando o modelo mais caro do catálogo pra responder pergunta de FAQ tipo 'qual o horário?'. Gastou em 8h o que era pra ser o mês.",
    hint: "Dois fatores combinados: <b>volume artificial</b> (loop infinito) E <b>modelo caro pra a tarefa</b> (FAQ usando o mais caro da Bedrock). Ataca o que tá causando mais dano primeiro.",
    quizQuestion: {
      question: "Você está rodando um LLM via API on-demand do Bedrock. Em qual UNIDADE de medida o Bedrock cobra você?",
      options: [
        "Por requisição",
        "Por minuto de uso",
        "Por tokens de entrada e saída",
        "Por GB de dados processados",
      ],
      correctIdx: 2,
      explanation: "Bedrock cobra <b>por token</b>, separado pra input (prompt) e output (resposta). 1 token ≈ 4 caracteres em inglês, ~3 em português. Modelos mais caros (Opus) cobram mais por token. Output normalmente é mais caro que input. Por isso instruir 'responda em uma frase' reduz custo.",
    },
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
      { ts: "14:22", lv: "INF", msg: "Bedrock invocado · modelo=Claude Opus · 14k palavras" },
      { ts: "14:22", lv: "WRN", msg: "<b>Mesma conversa</b> invocou Bedrock 8 vezes em 4 segundos" },
      { ts: "14:22", lv: "INF", msg: "Auto-resposta dispara auto-resposta dispara auto-resposta..." },
      { ts: "14:22", lv: "ERR", msg: "🚨 <b>Loop detectado</b>: email → bot → email → bot..." },
      { ts: "14:22", lv: "WRN", msg: "Sem limite de envio de emails configurado" },
      { ts: "14:22", lv: "INF", msg: "Usando Claude Opus pra respostas de FAQ · poderia ser Haiku" },
    ],
    actions: [
      { id: "inv-recursion", type: "investigate", name: "Investigar logs de email", hint: "+1min", reveals: "recursion", timeCost: 60 },
      { id: "inv-model", type: "investigate", name: "Ver qual modelo tá sendo usado", hint: "+30s", reveals: "model", timeCost: 30 },
      { id: "kill-feature", name: "⛔ Desligar AI auto-reply", hint: "feature down", grade: "B", costDelta: 4200, xp: 160, verdict: "Para o sangue.", sub: "Perde feature. CTO satisfeito por agora. Mas não aprendeu nada." },
      { id: "switch-model", name: "🔄 Trocar Opus → Haiku", hint: "mantém feature, custo /10", grade: "A-", costDelta: 2800, xp: 220, verdict: "Bom.", sub: "Haiku é 10x mais barato, suficiente pra FAQ. Mas o problema do loop continua latente." },
      { id: "rate-limit", name: "🛡 Adicionar rate limit + circuit breaker", hint: "~30min", grade: "A+", costDelta: 1200, xp: 340, verdict: "Excelente.", sub: "Loop infinito não acontece de novo. Circuit breaker é boa prática. CTO te elogia no all-hands." },
      { id: "provisioned", name: "📦 Comprar Provisioned Throughput", hint: "reduz custo unitário", grade: "D", costDelta: 24000, xp: 30, verdict: "Pior decisão.", sub: "PT tem custo fixo alto. Resolve preço por token, não o volume insano." },
    ],
    rootCause: 'A feature "AI auto-reply" não tinha proteção contra loop: cliente recebia email do bot, respondia automático, bot respondia de novo. Pior: tava usando Claude Opus pra responder FAQs simples, 10x mais caro que Haiku resolveria.',
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
    desc: "Quarta-feira, 14h45. O time de suporte percebeu há uma semana: o chatbot tá dando respostas de manual que foi descontinuado faz tempo. Cliente liga: 'o bot disse pra mexer no menu Configurações > Avançado, mas virou Settings > Pro há 3 meses'. Ninguém priorizou investigar até hoje, quando um cliente premium ameaçou cancelar o contrato. Tu pegou o ticket pra entender por que a base de conhecimento (RAG) tá tão atrasada.",
    short: "Knowledge Base com documento desatualizado",
    slackRecap: "Confirmado: a tarefa que sincroniza a base de conhecimento do bot <b>tá falhando há 94 dias</b>. Permissão de IAM foi revogada numa auditoria e ninguém notou. Não tem alarme em cima dessa task. Bot continua respondendo com docs de 3 meses atrás, incluindo política de troca que já mudou.",
    hint: "A tarefa do RAG falha há 94 dias por permissão de IAM, e ninguém percebeu. São dois problemas: <b>corrigir o IAM</b> agora E <b>garantir que isso seja detectado</b> no futuro.",
    quizQuestion: {
      question: "Em RAG, antes de fazer a busca semântica, cada documento da base é convertido em uma REPRESENTAÇÃO NUMÉRICA densa que captura seu significado. Como isso se chama?",
      options: [
        "Hash",
        "Tokenização",
        "Embedding",
        "Compressão",
      ],
      correctIdx: 2,
      explanation: "<b>Embeddings</b> são vetores numéricos densos (centenas/milhares de dimensões) que representam significado semântico. Textos similares têm embeddings próximos no espaço vetorial. Modelos como Titan Embeddings (Bedrock) ou Cohere Embed geram esses vetores. Hash é determinístico mas não captura semântica. Tokenização é só dividir texto em pedaços.",
    },
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
      { ts: "14:45", lv: "INF", msg: "Bedrock buscou conteúdo na base de conhecimento (RAG)" },
      { ts: "14:45", lv: "WRN", msg: "Trecho retornado: <b>datado de 12/11/2023</b> (muito antigo)" },
      { ts: "14:45", lv: "ERR", msg: "🚨 Tarefa <b>kb-sync</b> falhou 47 vezes · último sucesso há 94 dias" },
      { ts: "14:45", lv: "INF", msg: "Causa: permissão de leitura do S3 foi revogada na auditoria" },
      { ts: "14:45", lv: "WRN", msg: "Sem alerta configurado pra falha do kb-sync" },
      { ts: "14:45", lv: "INF", msg: "Índice do OpenSearch: mesmo tamanho de 3 meses atrás" },
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
    desc: "Quinta-feira, 10h14. Email URGENT do CTO da ClinicAI. O app deles transcreve consultas médicas em tempo real pra gerar prontuário automático. Funcionou bem por seis meses. Mas ontem aconteceu o pior: o médico ditou '5 miligramas de dipirona', o app transcreveu '50 mg', o paciente tomou a dose errada e teve reação adversa. Felizmente nada grave. Mas o jurídico tá em pânico e o CEO marcou call pra daqui 2 horas.",
    short: "Transcribe genérico em contexto médico",
    slackRecap: "Confirmado: o app tá usando o <b>Transcribe Standard (genérico)</b> pra transcrever as consultas. Taxa de erro em palavras médicas: <b>18,4%</b>. Medicamentos virando outras palavras: 'omeprazol' vira 'oem prazo', 'metformina' vira 'meta formina'. Em palavras comuns o erro é só 2%.",
    hint: "O AWS Transcribe tem <b>variantes</b> além do genérico. Pensa em domínios onde o vocabulário é muito específico (medicina, jurídico).",
    quizQuestion: {
      question: "Você está transcrevendo chamadas de call center. Cada chamada tem áudio em DOIS CANAIS separados (agente em um canal, cliente em outro). Qual feature do Transcribe é a indicada?",
      options: [
        "Speaker Diarization",
        "Channel Identification",
        "Custom Vocabulary",
        "Real-time Streaming",
      ],
      correctIdx: 1,
      explanation: "<b>Channel Identification</b> aproveita os canais JÁ separados fisicamente e transcreve cada um isoladamente, mais preciso. <b>Speaker Diarization</b> tenta SEPARAR speakers em áudio mono (mais difícil, menos confiável). Se você já tem os canais separados, use Channel Identification.",
    },
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
      { ts: "10:14", lv: "INF", msg: "Transcribe começou job · áudio de consulta clínica" },
      { ts: "10:14", lv: "WRN", msg: "Vocabulário médico: <b>não carregado</b>" },
      { ts: "10:14", lv: "ERR", msg: '🚨 Falou "5 miligramas" · transcreveu como "5 megabytes"' },
      { ts: "10:14", lv: "WRN", msg: "Sem vocabulário customizado pra nomes de medicamento" },
      { ts: "10:14", lv: "INF", msg: "Variante em uso: <b>Transcribe Standard (genérico)</b>" },
      { ts: "10:14", lv: "ERR", msg: '🚨 Palavra "amoxicilina" não está no dicionário padrão' },
    ],
    actions: [
      { id: "inv-config", type: "investigate", name: "Ver config do Transcribe", hint: "+30s", reveals: "config", timeCost: 30 },
      { id: "add-vocab", name: "📚 Custom Vocabulary com termos clínicos", hint: "~2h trabalho", grade: "B-", costDelta: 3200, xp: 170, verdict: "Bom paliativo.", sub: "Reduz erro pra ~8%. Mas ainda fica abaixo do médico humano. Tem solução melhor." },
      { id: "switch-medical", name: "🏥 Migrar pra Transcribe Medical", hint: "~1 dia migração", grade: "A+", costDelta: 1800, xp: 380, verdict: "Excelente.", sub: "Modelo treinado em termos médicos. WER cai pra ~3%. Existe variante específica do serviço, usa." },
      { id: "human-review", name: "👁 Toda transcrição revisada por humano", hint: "não escala", grade: "D", costDelta: 9400, xp: 40, verdict: "Burra.", sub: "Vira gargalo, custa fortuna. Defeats the purpose." },
      { id: "shutdown-feature", name: "⛔ Desliga até resolver", hint: "sem AI por enquanto", grade: "C-", costDelta: 4800, xp: 60, verdict: "Conservador.", sub: "Reduz risco mas perde valor do produto. Médicos voltam pro papel." },
    ],
    rootCause: "O time usou <code>Amazon Transcribe</code> padrão (treinado em fala genérica). Há uma variante especializada, <code>Transcribe Medical</code>, treinada em vocabulário clínico, conversas médico-paciente, ditados de prontuário. Custa o mesmo, performa muito melhor.",
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
    desc: "Sexta-feira, 12h. A GameStudio acabou de lançar o novo MMORPG globalmente. 2 milhões de pré-downloads. Reviewers começaram a postar print da tradução pt-BR: 'headshot' virou 'tiro na cabeça', 'crit chance' virou 'chance crítica', 'DPS' virou 'departamento de polícia'. O subreddit do jogo tá rindo. O time de marketing tá gritando 'arruma isso AGORA'. Tu abriu o ticket: o Translate da AWS tá rodando, mas alguma coisa não tá certa.",
    short: "Translate sem custom terminology · gaming",
    slackRecap: "Confirmado: o Translate tá rodando com a <b>configuração padrão</b>, sem nenhuma customização de domínio. 'Headshot' vira 'tiro na cabeça', 'crit' vira 'crítica', 'DPS' vira 'departamento de polícia'. Existe um CSV com 340 termos de gaming no S3 mas ele não tá sendo usado em lugar nenhum.",
    hint: "O Translate funciona com base em um <b>dicionário geral</b>. Quando o conteúdo tem <b>jargão de um domínio específico</b>, qual mecanismo do próprio Translate resolveria isso?",
    quizQuestion: {
      question: "Você precisa traduzir entre um par de idiomas pouco comum (ex: Tailandês → Vietnamita). O que o Amazon Translate faz internamente?",
      options: [
        "Falha porque o par não é suportado",
        "Traduz direto entre os dois idiomas com modelo dedicado",
        "Usa inglês como idioma-ponte (pivot translation)",
        "Faz fallback pra Bedrock",
      ],
      correctIdx: 2,
      explanation: "Translate usa <b>pivot translation</b> via inglês pra pares menos comuns: traduz Tailandês → Inglês → Vietnamita internamente. Isso pode introduzir alguma perda de nuance. Só os pares mais populares têm modelo direto.",
    },
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
      { ts: "12:00", lv: "INF", msg: 'Translate · "headshot" foi traduzido como "tiro na cabeça"' },
      { ts: "12:00", lv: "WRN", msg: "Nenhum glossário customizado carregado" },
      { ts: "12:00", lv: "INF", msg: 'Termos gaming faltando no dicionário: "crit", "buff", "nerf", "AOE"' },
      { ts: "12:00", lv: "ERR", msg: '🚨 "crit chance" virou "chance crítica" (o correto seria manter "crit")' },
    ],
    actions: [
      { id: "inv-glossary", type: "investigate", name: "Ver se há glossário do jogo", hint: "+30s", reveals: "glossary", timeCost: 30 },
      { id: "custom-term", name: "📚 Custom Terminology no Translate", hint: "~4h pra carregar glossário", grade: "A+", costDelta: 600, xp: 280, verdict: "Excelente.", sub: 'Translate aceita TMX/CSV com termos do domínio. "headshot" fica "headshot" em todas as línguas. Solução nativa, barata.' },
      { id: "manual-team", name: "👥 Contratar tradutor humano por idioma", hint: "1 mês de delay", grade: "C", costDelta: 4200, xp: 80, verdict: "Caro e lento.", sub: "Funciona, mas mata o lançamento. Translate + Custom Terminology faz o mesmo em 4h." },
      { id: "switch-bedrock", name: "🧠 Trocar pra Bedrock (LLM)", hint: "mais caro mas contexto", grade: "B", costDelta: 1800, xp: 150, verdict: "Funciona, é over.", sub: "LLM entende contexto melhor, mas custa 50x mais que Translate. Pra strings curtas é desperdício." },
      { id: "apologize", name: "📢 Pedir desculpa, manter ruim", hint: "gerência ri", grade: "F", costDelta: 8200, xp: 10, verdict: "Pior decisão de carreira.", sub: "Refunds explodem. CEO te procura." },
    ],
    rootCause: 'Translate é otimizado pra texto genérico. Em domínios com jargão (gaming, jurídico, médico), traduções literais quebram. A solução é Custom Terminology, um dicionário de "esses termos NÃO traduz" ou "esses termos traduz assim".',
    services: [
      { name: "Translate", role: "Onde tava errado", description: "Tradução neural rápida, barata (~$15/1M chars). Cobre 75 idiomas. Default é tradução literal, boa pra texto comum." },
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
    desc: "Quinta-feira, 15h30. Plataforma social com 2 milhões de usuários. Time de Trust & Safety em alerta: um post com imagem explicitamente violenta tá circulando, foi denunciado 47 vezes em 20 minutos, e o sistema automático NÃO bloqueou. A foto já apareceu reportada no TikTok e Instagram também. A diretoria perguntou no Slack: 'cadê a IA de moderação?'. Você abre o painel do Rekognition pra entender por que a foto passou batida.",
    short: "Rekognition moderação labels desconfiguradas",
    slackRecap: "Confirmado: alguém alterou o <b>threshold de moderação</b> de 80% pra 99% direto pelo console ontem (sem PR, sem código). Resultado: 14.221 imagens marcadas como duvidosas <b>passaram sem revisão</b> nas últimas 24h. Não tem registro nenhum no Git de quem fez ou por quê.",
    hint: "Alguém mudou o threshold ontem pelo console. Tem duas frentes: <b>corrigir o valor agora</b> e <b>impedir que isso aconteça de novo</b>.",
    quizQuestion: {
      question: "Alguém alterou uma configuração crítica direto pelo Console AWS, e ninguém sabe quem ou quando. Qual serviço guarda esse HISTÓRICO de chamadas de API com identidade, ação e timestamp?",
      options: [
        "CloudWatch Logs",
        "CloudTrail",
        "AWS Config",
        "X-Ray",
      ],
      correctIdx: 1,
      explanation: "<b>CloudTrail</b> registra TODAS as chamadas de API com quem fez (IAM identity), o que fez (action), quando (timestamp) e de onde (IP). É o log de auditoria. AWS Config rastreia o ESTADO dos recursos. CloudWatch Logs é pra logs de aplicação. X-Ray é tracing distribuído.",
    },
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
      { ts: "15:30", lv: "INF", msg: "Rekognition analisou imagem · img=8472.jpg" },
      { ts: "15:30", lv: "INF", msg: "Retornou: rótulo=<b>Violência</b> · 87% de confiança" },
      { ts: "15:30", lv: "WRN", msg: "⚠️ Rótulo <b>IGNORADO</b> · threshold configurado em 99%" },
      { ts: "15:30", lv: "INF", msg: "Imagem NÃO foi bloqueada · postada no feed" },
      { ts: "15:30", lv: "WRN", msg: "Imagem similar foi bloqueada há 2 semanas (threshold era 80%)" },
      { ts: "15:30", lv: "ERR", msg: "🚨 Threshold de moderação foi alterado: era 80%, agora 99%" },
    ],
    actions: [
      { id: "inv-threshold", type: "investigate", name: "Ver config histórica", hint: "+30s", reveals: "threshold", timeCost: 30 },
      { id: "inv-pipeline", type: "investigate", name: "Inspecionar pipeline completo", hint: "+1min", reveals: "pipeline", timeCost: 60 },
      { id: "reset-threshold", name: "🔧 Voltar threshold pra 80%", hint: "~5min", grade: "A-", costDelta: 1200, xp: 240, verdict: "Bom.", sub: 'Resolve imediato. Mas e o próximo "engineer" que mexer sem doc?' },
      { id: "reset-plus-iac", name: "📜 Threshold + IaC + alerts", hint: "~2h", grade: "A+", costDelta: 800, xp: 360, verdict: "Excelente.", sub: "Resolve agora, codifica config em Terraform, alerta se alguém mudar. Próxima geração não passa por isso." },
      { id: "human-mod", name: "👥 Contratar 50 moderadores", hint: "mês de onboarding", grade: "D", costDelta: 14200, xp: 40, verdict: "Cara e lenta.", sub: "Não escala pra 2M users. Custo: $300k/ano. Rekognition custa $1/1k images." },
      { id: "hide-all", name: "🙈 Hide tudo até revisar", hint: "feed vazio", grade: "F", costDelta: 24000, xp: 10, verdict: "Mata o produto.", sub: "Users vão pra concorrência. Stock cai. Demitido na sexta." },
    ],
    rootCause: "Rekognition retorna labels (Violence, Nudity, Drugs, etc) com confidence score. Threshold padrão é 80%, abaixo disso o flag é ignorado. Alguém subiu pra 99% (talvez pra reduzir falso-positivo) sem entender que isso deixa quase tudo passar. Sem IaC, sem alerta, ninguém viu.",
    services: [
      { name: "Rekognition", role: "O moderador", description: "Tem API <code>detect_moderation_labels</code> que retorna categorias (Violence, Hate, Drugs, Suggestive) com confidence. Funciona em image E video." },
      { name: "Confidence threshold", role: "A pegadinha", description: "Muito baixo = falso positivo. Muito alto = passa coisa. Ideal: 80-90% pra moderação geral, 95%+ se contexto exige." },
      { name: "Step Functions", role: "Pipeline", description: "Em pipelines críticos, cada step deve ter rollback e versionamento. Mudança de config = PR + review + IaC. Não tem botão \"mudar threshold em prod\" sem trilha." },
    ],
    examNote: "<code>Rekognition</code> moderation labels é caso clássico. Categorias top-level: Violence, Visually Disturbing, Nudity, Hate Symbols, Drugs/Alcohol. Confidence threshold é parâmetro da call.",
  },

  // ============================================================
  // SEV-0: BOSS, Multi-Phase Catastrophe
  // ============================================================
  {
    id: "the-cascade",
    sev: 0,
    title: "🔥 THE CASCADE",
    incId: "incident.global.everything-on-fire",
    customer: "Anthrofin Insurance (mission-critical)",
    slack: "#war-room-CEO-watching",
    desc: "23h46. Black Friday. O e-commerce tá processando o maior volume da história, $4.000 em vendas por SEGUNDO. Aí o site começa a engasgar. Primeiro o chatbot entra em loop infinito. Depois a base de conhecimento estoura. O filtro de PII bate no limite. O CloudFront começa a retornar erro 503. Cascata clássica. O CEO mandou DM: 'qualquer coisa que precisarem, façam AGORA'. CFO no Slack: 'a cada minuto são $240k'. Tu é o on-call. Boa sorte.",
    short: "BOSS · 3 fases · cascading failure em todo o stack AI",
    slackRecap: "Black Friday derretendo tudo. <b>Bedrock em throttling</b>, base de conhecimento em timeout, Comprehend retornando 429, CloudFront em 503. Lambda no limite de concurrency, 40 mil mensagens empilhadas na DLQ. Cada componente tentando reiniciar tá piorando os outros.",
    hint: "Black Friday derretendo tudo: primeiro <b>estanca o sangramento</b> (limitar tráfego, fallbacks), depois <b>investiga a causa</b>, depois <b>previne</b>. Ordem importa.",
    quizQuestion: {
      question: "Em arquitetura resiliente, qual estratégia mantém o app funcionando MESMO quando uma dependência falha (ex: continuar mostrando produtos mesmo se o serviço de recomendações estiver fora)?",
      options: [
        "Hard fail (mostrar erro 500 pra todo mundo)",
        "Retry indefinitely (continuar tentando até funcionar)",
        "Graceful degradation com fallback",
        "Cold start",
      ],
      correctIdx: 2,
      explanation: "<b>Graceful degradation</b>: quando uma feature secundária falha, o app continua funcionando sem ela. Em vez de derrubar a página inteira, mostra produtos sem recomendações personalizadas. Combina com circuit breaker (que decide QUANDO ativar o fallback) e timeouts agressivos.",
    },
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
      { ts: "23:46", lv: "ERR", msg: "🚨 Bedrock · <b>limite de requisições excedido</b> · retry 47" },
      { ts: "23:46", lv: "ERR", msg: "Base de conhecimento (RAG) · <b>timeout de 30s</b>" },
      { ts: "23:46", lv: "WRN", msg: "Comprehend (detecção de PII) · <b>limite excedido</b>" },
      { ts: "23:46", lv: "ERR", msg: "CloudFront · respondendo 503 · cascata de retries" },
      { ts: "23:46", lv: "ERR", msg: "Lambda · execuções simultâneas: <b>10.000 / 10.000</b>" },
      { ts: "23:46", lv: "ERR", msg: "🚨 Fila de mensagens mortas (DLQ): <b>40 mil mensagens</b>" },
      { ts: "23:46", lv: "ERR", msg: "📱 CEO está digitando..." },
    ],
    actions: [], // boss uses phases instead
    phases: [
      // PHASE 1, Stop the bleeding
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
          { ts: "23:47", lv: "ERR", msg: "Lambda · cascata de retentativas · 8.400 invocações/s" },
          { ts: "23:47", lv: "ERR", msg: "Sem 'exponential backoff' configurado (atraso progressivo)" },
          { ts: "23:47", lv: "WRN", msg: "Fila de mensagens mortas: 40k mensagens · crescendo 200/s" },
        ],
        actions: [
          { id: "boss-p1-circuit", name: "🚨 Ativar Circuit Breaker via SSM", hint: "para cascading", grade: "A+", costDelta: 1200, xp: 200, verdict: "🟢 Fase 1 OK", sub: "Para o sangramento. Próxima fase: limpar a fila." },
          { id: "boss-p1-scale", name: "↑ Aumentar Lambda concurrency", hint: "vai piorar", grade: "F", costDelta: 12000, xp: 0, verdict: "💀 Game over phase 1", sub: "Mais concurrency = mais retry = pior. CFO acordou." },
          { id: "boss-p1-rollback", name: "↩ Rollback do deploy", hint: "demora 5min", grade: "C", costDelta: 6800, xp: 80, verdict: "🟡 Funciona mas lento", sub: "Para a cascata. Mas em Black Friday cada segundo são $4k." },
        ],
      },
      // PHASE 2, Drain the queue
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
          { ts: "23:48", lv: "OK", msg: "✅ Circuit breaker ativo · sangramento parou" },
          { ts: "23:48", lv: "WRN", msg: "Fila de mensagens mortas: 41.847 mensagens esperando" },
          { ts: "23:48", lv: "INF", msg: "Bedrock voltando a aceitar requisições" },
        ],
        actions: [
          { id: "boss-p2-replay-fast", name: "🚀 Replay tudo de uma vez", hint: "loop de novo", grade: "D", costDelta: 18000, xp: 30, verdict: "💀 Voltou pra fase 1", sub: "Mesma cascade. Tu não aprendeu nada." },
          { id: "boss-p2-replay-controlled", name: "🐌 Replay com rate limit + Haiku", hint: "30min mas seguro", grade: "A+", costDelta: 2400, xp: 250, verdict: "🟢 Fase 2 OK", sub: "Throttle no replay. Troca pra Haiku que tem mais throughput. Drena a fila sem nova cascade." },
          { id: "boss-p2-drop", name: "🗑 Dropar a fila inteira", hint: "perde requests", grade: "C-", costDelta: 8200, xp: 50, verdict: "🟡 Funciona com dano", sub: "41k clientes não vão receber resposta. Twitter PR ruim, mas serviço volta." },
        ],
      },
      // PHASE 3, Root cause + post-mortem
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
          { ts: "00:18", lv: "OK", msg: "✅ Todos os serviços operando normalmente" },
          { ts: "00:18", lv: "OK", msg: "✅ Fila drenada · 41.847 mensagens processadas" },
          { ts: "00:18", lv: "INF", msg: "Impacto total estimado: $4,2M em receita perdida" },
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
      { name: "Bedrock Provisioned Throughput", role: "Pra picos previsíveis", description: "Black Friday é previsível. PT compra throughput garantido, sem throttling. Caro de manter, mas em peak vale ouro." },
      { name: "SQS + DLQ", role: "Buffer + safety net", description: "Em vez de chamar Bedrock direto, joga numa SQS. Workers processam no ritmo. Falhas vão pra DLQ pra replay controlado." },
      { name: "CloudWatch + Anomaly Detection", role: "Observabilidade", description: "Cascading só se detecta quando tu tem dashboards de toda a stack. Anomaly Detection pega o spike antes de virar incêndio." },
      { name: "AWS Fault Injection Service", role: "Prevenção", description: "Chaos engineering oficial da AWS. Faz gameday todo mês injetando falhas controladas. Se o sistema cai, tu sabe antes do CEO." },
    ],
    examNote: "Cascading failures são tema sênior. Pro exame: <code>Step Functions</code> pra orquestração com retry, <code>Provisioned Throughput</code> pra cargas previsíveis, <code>SQS + DLQ</code> pra buffer. Conceitos de fault tolerance > saber API de qualquer serviço sozinho.",
  },

  // ============================================================
  // LIGHT MISSIONS · curriculum topics
  // ============================================================

  // SEV-2: Comprehend sentiment flip
  {
    id: "sentiment-flip",
    sev: 2,
    title: "Sentimento Trocado",
    incId: "incident.reviewhub.sentiment-flipped",
    customer: "ReviewHub",
    slack: "#war-room-reviewhub",
    desc: "Quarta-feira, 14h. O all-hands semanal acabou de terminar e a Maria, PM do ReviewHub, ainda tá processando o que viu: o dashboard de NPS que ela mostrou pro CEO indica que 90% das reviews da última semana são NEGATIVAS. Aí ela abre o app pra conferir: 'amei o produto', 'chegou rapidinho', 'recomendo demais, comprei pra minha mãe', todas com 5 estrelas. Algo tá MUITO errado entre o que o cliente escreve e o que o dashboard mostra. O Slack #war-room-reviewhub vibrou: 'precisamos entender isso antes da reunião do board na sexta'.",
    short: "Comprehend retornando NEGATIVE pra reviews 5 estrelas",
    slackRecap: "Confirmado: o Comprehend tá sendo chamado com <code>LanguageCode='en'</code> hardcoded no Lambda, mas as reviews chegam em <b>três idiomas</b> (PT 96%, EN 2%, ES 2%). 'Amei o produto, recomendo!' tá voltando como NEGATIVE. Sentimento é dependente do idioma — assumir um idioma fixo é o bug.",
    hint: "A inconsistência tá entre <b>o idioma real de cada review</b> e <b>o que o Comprehend foi instruído a esperar</b>. E olha bem: as reviews não estão todas no mesmo idioma.",
    quizQuestion: {
      question: "Você precisa classificar tickets de suporte em categorias específicas do seu negócio (billing, técnico, abuse, churn). As categorias built-in do Comprehend não servem. Qual feature resolve isso?",
      options: [
        "Comprehend Topic Modeling",
        "Comprehend Custom Classification",
        "DetectEntities com filtro",
        "DetectSentiment com targets",
      ],
      correctIdx: 1,
      explanation: "<b>Custom Classification</b> permite treinar um classificador com SEUS rótulos e SEUS exemplos. Topic Modeling é não-supervisionado (agrupa, mas você não controla as categorias). DetectEntities extrai nomes/lugares/orgs. DetectSentiment é polaridade fixa (positive/negative/neutral).",
    },
    ratePerMin: 90,
    initialCost: 480,
    initialElapsed: 8 * 60,
    minLevel: 0,
    sparkType: "flat-spike",
    metrics: [
      { label: "Reviews / dia", value: "12k", cls: "amber", delta: "normal" },
      { label: "% NEGATIVE", value: "90%", cls: "red", delta: "↑ era ~12% ontem", deltaCls: "up" },
      { label: "Confiança média", value: "0.78", cls: "amber", delta: "modelo acha que tá certo", deltaCls: "down" },
    ],
    timeline: [
      { t: "13:40", ev: "Time de produto vê dashboard NPS num all-hands · <b>todo negativo</b>", bad: true },
      { t: "13:52", ev: "Suporte confirma: reviews na home parecem positivas" },
      { t: "14:05", ev: "PM abre canal de incident: <b>'algo tá errado no Comprehend'</b>", bad: true },
      { t: "14:11", ev: "<b>PagerDuty</b> escalou pra você" },
    ],
    logs: [
      { ts: "14:11", lv: "INF", msg: 'Comprehend recebeu: "Amei o produto, recomendo!"' },
      { ts: "14:11", lv: "INF", msg: "Comprehend retornou: <b>NEGATIVO</b> (78% confiança) 🤔" },
      { ts: "14:11", lv: "INF", msg: 'Comprehend recebeu: "Pior compra da minha vida"' },
      { ts: "14:11", lv: "INF", msg: "Comprehend retornou: <b>POSITIVO</b> (61% confiança) 🤔" },
      { ts: "14:11", lv: "WRN", msg: "⚠️ Parâmetro de idioma usado nas chamadas: <b>'en' (inglês)</b>" },
      { ts: "14:11", lv: "INF", msg: "Idioma real das reviews: <b>português</b>" },
    ],
    actions: [
      { id: "inv-sentiment", type: "investigate", name: "Ver chamadas do Comprehend", hint: "+30s · grátis", reveals: "sentiment", timeCost: 30 },
      { id: "detect-lang-first", name: "🔍 Chamar DetectDominantLanguage antes", hint: "pipeline robusto · resolve", grade: "A+", costDelta: 380, xp: 280, verdict: "Excelente.", sub: "Solução à prova de falhas: detecta o idioma de cada review e passa o LanguageCode certo pro DetectSentiment. Funciona pros 96% em PT, pros 2% em EN e pros 1,6% em ES. Pattern recomendado pra conteúdo multilíngue." },
      { id: "set-lang-pt", name: "🇧🇷 Setar LanguageCode='pt' nas chamadas", hint: "1 linha de código · parcial", grade: "B", costDelta: 120, xp: 120, verdict: "Resolve 96%, mas troca um hardcode por outro.", sub: "Conserta a maioria das reviews (PT), mas as 3,7% em EN e ES continuam classificadas errado. É só substituir um idioma hardcoded por outro — o bug de fundo (assumir idioma fixo) continua lá." },
      { id: "translate-first", name: "🌐 Traduzir tudo pra inglês antes", hint: "Translate + Comprehend", grade: "C", costDelta: 1200, xp: 80, verdict: "Funciona, mas overengineering.", sub: "Comprehend já tem pt-BR nativo. Tradução adiciona custo, latência e perde nuance." },
      { id: "retrain", name: "🔧 Retreinar Comprehend Custom", hint: "semanas de trabalho", grade: "F", costDelta: 5400, xp: 30, verdict: "Errou alvo total.", sub: "O modelo padrão funciona pra pt-BR, basta passar o LanguageCode. Custom Comprehend é pra domínios específicos, não pra fix de bug." },
    ],
    rootCause: "O Lambda <code>review-classifier</code> tava chamando <code>DetectSentiment</code> com <code>LanguageCode='en'</code> hardcoded, mas as reviews chegam em três idiomas (PT, EN, ES). Quando Comprehend recebe texto que não bate com o idioma declarado, ele tenta inferir sentimento das pistas léxicas em inglês, e erra feio. O bug de fundo é assumir um idioma fixo — a solução é <code>DetectDominantLanguage</code> antes de cada chamada de sentimento, pra passar o LanguageCode certo pra cada review.",
    services: [
      { name: "Amazon Comprehend", role: "O serviço", description: "NLP gerenciado da AWS. <code>DetectSentiment</code> retorna POSITIVE/NEGATIVE/NEUTRAL/MIXED com confidence score. Suporta 12 idiomas incluindo pt-BR nativo." },
      { name: "DetectDominantLanguage", role: "Defesa", description: "Outra API do Comprehend. Recebe texto e devolve probabilidade de cada idioma. Combinar com DetectSentiment dá pipeline robusto pra conteúdo multilíngue." },
      { name: "Comprehend Custom", role: "Pra outro caso", description: "Quando precisa de classificação específica do domínio (categorias customizadas, sentimentos sutis). NÃO é a solução aqui, o modelo padrão funciona pra pt-BR." },
    ],
    examNote: "<code>Comprehend</code> é praticamente certo de cair na prova. Memoriza: <code>DetectSentiment</code> (POSITIVE/NEGATIVE/NEUTRAL/MIXED), <code>DetectDominantLanguage</code>, <code>DetectEntities</code>, <code>DetectPiiEntities</code>. <b>Sempre passa o <code>LanguageCode</code></b> ou faça detect-language primeiro.",
  },

  // SEV-3: Polly mispronunciation
  {
    id: "polly-mispronounce",
    sev: 3,
    title: "Polly da Sorte",
    incId: "incident.audioready.polly-pronunciation",
    customer: "AudioReady (audiobooks)",
    slack: "#war-room-audioready",
    desc: "Segunda-feira, 8h21. Tu abre o Slack e o canal #war-room-audioready tem 12 mensagens novas. A AudioReady (startup de audiobooks) lançou uma coleção sobre carreira em tech. Os primeiros reviewers começaram a dar 1 estrela: 'narrador não sabe ler nada de tecnologia'. Print: a voz da Polly tá lendo 'Kubernetes' como 'cubernetes', 'PyTorch' como 'pee-torch', 'Docker' como 'doquér'. O editor disse que desistiu de revisar manualmente, tem 47 audiobooks na fila. CEO quer fix antes do final do dia.",
    short: "Polly pronunciando termos técnicos errado",
    slackRecap: "Confirmado: o Polly tá lendo termos técnicos em inglês usando <b>regras fonéticas do português</b>. 'Kubernetes' sai como 'kú-ber-ne-tchis', 'PyTorch' vira 'pee-tór-tchi'. Reclamação aumentou 840% em 2 semanas. A configuração atual não tem nenhuma instrução sobre como esses termos devem ser pronunciados.",
    hint: "Pensa: o problema é a <b>voz escolhida</b>, o <b>texto enviado</b>, ou alguma <b>instrução de pronúncia</b> que o serviço aceita mas não recebeu?",
    quizQuestion: {
      question: "Quando faz MAIS SENTIDO criar um Pronunciation Lexicon em vez de usar tags SSML inline em cada texto que o Polly vai ler?",
      options: [
        "Quando o texto é muito longo",
        "Quando o mesmo termo se repete em vários documentos",
        "Quando você precisa de pausas no áudio",
        "Quando o idioma é português",
      ],
      correctIdx: 1,
      explanation: "<b>Lexicon</b> é reutilizável, você define o termo uma vez (ex: 'Kubernetes' → IPA) e ele aplica em TODOS os documentos que usam aquele lexicon. SSML inline funciona caso a caso, e duplicar a correção em cada texto é frágil. Pausas seriam com <b>&lt,break&gt,</b>, e idioma não tem relação com a escolha.",
    },
    ratePerMin: 40,
    initialCost: 260,
    initialElapsed: 22 * 60,
    minLevel: 0,
    sparkType: "spike",
    metrics: [
      { label: "Áudios gerados / dia", value: "1.8k", cls: "amber", delta: "normal" },
      { label: "Reclamações de pronúncia", value: "84", cls: "red", delta: "↑ +84 (1 semana)", deltaCls: "up" },
      { label: "Refacções manuais", value: "31%", cls: "red", delta: "custo alto", deltaCls: "up" },
    ],
    timeline: [
      { t: "há 1 semana", ev: "Editor reportou 'audiobook tá engraçado' no Slack" },
      { t: "há 3 dias", ev: "Suporte recebeu 12 reviews 1-estrela: <b>'narrador não sabe ler'</b>", bad: true },
      { t: "ontem", ev: "Time de produto pediu fix urgente" },
      { t: "agora", ev: "Tu pegou o ticket" },
    ],
    logs: [
      { ts: "08:21", lv: "INF", msg: "Polly gerou áudio · voz: Camila (pt-BR neural)" },
      { ts: "08:21", lv: "INF", msg: "Texto continha: Kubernetes, Docker, PyTorch, GraphQL" },
      { ts: "08:21", lv: "INF", msg: "Lexicons (dicionário de pronúncia): <b>nenhum aplicado</b>" },
      { ts: "08:21", lv: "INF", msg: "Tags SSML no texto: nenhuma" },
      { ts: "08:21", lv: "WRN", msg: "⚠️ Lexicon 'tech-terms-en-words' existe na conta · <b>nunca foi usado</b>" },
    ],
    actions: [
      { id: "inv-polly", type: "investigate", name: "Investigar setup do Polly", hint: "+30s · grátis", reveals: "polly", timeCost: 30 },
      { id: "lexicon", name: "📖 Aplicar Pronunciation Lexicon", hint: "1x criação · reusa pra sempre", grade: "A+", costDelta: 80, xp: 280, verdict: "Excelente.", sub: "Lexicon é gerenciado pelo Polly. Define a pronúncia uma vez, vale pra todas as chamadas. Solução oficial." },
      { id: "ssml", name: "🏷 SSML <phoneme> em cada texto", hint: "editor tem que marcar", grade: "B", costDelta: 320, xp: 160, verdict: "Resolve, mas não escala.", sub: "Funciona caso a caso, mas pra cada termo novo o editor precisa lembrar. Lexicon é melhor pra biblioteca recorrente." },
      { id: "swap-voice", name: "🗣 Trocar voz pra Joanna (en-US)", hint: "muda público alvo", grade: "F", costDelta: 480, xp: 30, verdict: "Não.", sub: "Os clientes querem audiobook em pt-BR. Trocar voz não resolve termos técnicos, só muda o sotaque do erro." },
      { id: "custom-voice", name: "🎤 Treinar Brand Voice custom", hint: "$$$$$ + meses", grade: "D", costDelta: 4200, xp: 60, verdict: "Cara demais pro problema.", sub: "Brand Voice é pra criar uma voz única da marca, não pra corrigir pronúncia de 50 palavras. Overkill." },
    ],
    rootCause: "Polly tem suporte oficial pra ensinar pronúncia: <code>Pronunciation Lexicons</code>. Aceita um arquivo PLS (Pronunciation Lexicon Specification) com pares <code>termo → pronúncia em IPA ou alfabeto fonético</code>. Uma vez criado, basta passar <code>LexiconNames=['nome-do-lexicon']</code> em cada chamada. O time não sabia que isso existia e tava tentando contornar com SSML inline em cada áudio.",
    services: [
      { name: "Amazon Polly", role: "TTS engine", description: "Converte texto em fala. Suporta vozes neurais (mais naturais) e standard. Tem vozes em pt-BR (Camila, Vitória, Ricardo)." },
      { name: "Pronunciation Lexicon", role: "A solução", description: "Arquivo PLS que ensina ao Polly como pronunciar termos específicos. Anexa por chamada (<code>LexiconNames</code>). Ideal pra jargão técnico, nomes próprios, abreviações." },
      { name: "SSML", role: "Alternativa por chamada", description: "Speech Synthesis Markup Language. Permite tags inline tipo <code>&lt;phoneme&gt;</code>, <code>&lt;say-as&gt;</code>, <code>&lt;sub&gt;</code>. Bom pra casos isolados, ruim pra biblioteca de termos." },
    ],
    examNote: "<code>Polly</code> tem 2 mecanismos pra controle de pronúncia: <b>Lexicons</b> (reusáveis) e <b>SSML</b> (por chamada). Cai em pergunta sobre 'como ensinar uma marca/jargão específico ao Polly' → resposta: Lexicon.",
  },

  // SEV-2: Personalize cold start
  {
    id: "personalize-cold",
    sev: 2,
    title: "Recomenda o Mesmo",
    incId: "incident.shopmaster.same-recs",
    customer: "ShopMaster",
    slack: "#war-room-recsys",
    desc: "Sexta-feira, 11h42. ShopMaster (marketplace de moda) acabou de fechar uma campanha de aquisição que dobrou os usuários novos em 2 semanas. Time de growth comemorando, até olhar as métricas de engajamento. Click-through caiu de 4,8% pra 1,2%. Cesta média desabou. O CMO acordou o time de dados: 'algo tá errado'. Você abre o app: pra cada usuário novo, o sistema de recomendação mostra exatamente os mesmos 3 produtos. Problema clássico de recomendação.",
    short: "Personalize recomendando os 3 mesmos pra todos",
    slackRecap: "Confirmado: a solução do Personalize tá usando uma <b>recipe antiga</b> (HRNN). 61% dos usuários novos têm menos de 3 interações no app, e essa recipe não foi feita pra esse cenário. Todo usuário novo recebe os mesmos 3 itens top globais. Conversão em onboarding caiu 73%.",
    hint: "O Personalize tem várias <b>recipes</b> (algoritmos). Algumas lidam melhor com usuários novos que não têm histórico ainda.",
    quizQuestion: {
      question: "Você acabou de lançar um e-commerce e tem POUCOS dados de interação por usuário. O User-Personalization vai recomendar bem mesmo assim. Como isso funciona internamente?",
      options: [
        "Ele para de recomendar até ter dados suficientes",
        "Faz fallback pra itens populares globalmente e ajusta conforme o usuário interage",
        "Pede ao usuário que preencha preferências",
        "Recomenda sempre os itens mais recentes",
      ],
      correctIdx: 1,
      explanation: "Quando o algoritmo não tem dados suficientes do usuário (<b>cold-start</b>), o User-Personalization faz fallback automático pra <b>itens populares globalmente</b>. Conforme o usuário interage mais, as recomendações se ajustam pra ele.",
    },
    ratePerMin: 80,
    initialCost: 580,
    initialElapsed: 16 * 60,
    minLevel: 1,
    sparkType: "spike",
    metrics: [
      { label: "Click-through rate", value: "1.2%", cls: "red", delta: "↓ era 4.8%", deltaCls: "down" },
      { label: "% usuários novos", value: "61%", cls: "amber", delta: "alto · marketing rodando", deltaCls: "up" },
      { label: "Diversidade do feed", value: "3 items", cls: "red", delta: "deveria ser ~30", deltaCls: "down" },
    ],
    timeline: [
      { t: "há 2 semanas", ev: "Time de growth disparou campanha de aquisição · <b>+200% novos usuários</b>", bad: true },
      { t: "há 10 dias", ev: "CTR começa a cair · ninguém percebeu" },
      { t: "há 3 dias", ev: "Data team: 'tem algo estranho com Personalize'" },
      { t: "hoje", ev: "<b>CEO pede explicação</b> sobre queda do engagement", bad: true },
    ],
    logs: [
      { ts: "11:42", lv: "INF", msg: "Personalize gerou recomendação · usuário novo (cold-start)" },
      { ts: "11:42", lv: "INF", msg: "Resposta: <b>os mesmos 3 itens (881, 42, 1207)</b>" },
      { ts: "11:42", lv: "INF", msg: "Personalize gerou recomendação · outro usuário novo" },
      { ts: "11:42", lv: "INF", msg: "Resposta: <b>os mesmos 3 itens de novo</b>" },
      { ts: "11:42", lv: "WRN", msg: "⚠️ Recipe (algoritmo) em uso: <b>HRNN</b> · não trata cold-start" },
      { ts: "11:42", lv: "INF", msg: "Usuário novo no dataset: 0 interações anteriores" },
    ],
    actions: [
      { id: "inv-personalize", type: "investigate", name: "Ver config da solução Personalize", hint: "+30s · grátis", reveals: "personalize", timeCost: 30 },
      { id: "switch-recipe", name: "🔄 Trocar pra recipe User-Personalization", hint: "1 deploy · resolve cold start", grade: "A+", costDelta: 240, xp: 320, verdict: "Excelente.", sub: "User-Personalization tem cold-start nativo + exploration. Sucessor recomendado da HRNN. AWS deprecou HRNN justamente por isso." },
      { id: "similar-items", name: "🔁 Recipe Similar-Items pra cold users", hint: "lógica híbrida", grade: "A-", costDelta: 480, xp: 240, verdict: "Bom.", sub: "Mostra similares ao que o usuário tá olhando. Não é o melhor pra novo usuário sem contexto, mas funciona." },
      { id: "popular", name: "📈 Servir Top-N popular pra novo", hint: "fallback manual", grade: "B-", costDelta: 320, xp: 140, verdict: "Funcional, mas regressão.", sub: "É voltar pro mundo pré-Personalize. Resolve o sintoma mas perde o valor do serviço. Sem aprendizado." },
      { id: "retrain", name: "🔧 Retreinar a HRNN existente", hint: "horas de training", grade: "D", costDelta: 1800, xp: 60, verdict: "Errou.", sub: "HRNN não tem cold-start na arquitetura. Retreinar não cria capacidade que o algoritmo não tem." },
    ],
    rootCause: "Personalize tem várias <b>recipes</b> (algoritmos prontos). A solução tava usando <code>aws-hrnn</code> (Hierarchical Recurrent Neural Network), que precisa de histórico de interações pra recomendar, não lida bem com usuários novos. Quando o marketing disparou campanha de aquisição, 61% dos requests viraram cold-start, e o HRNN só conseguia degenerar pros itens com mais sinal global. A AWS desaconselha HRNN justamente por isso, recipe sucessora (User-Personalization) resolve esse problema nativamente.",
    services: [
      { name: "Amazon Personalize", role: "Recsys", description: "Serviço gerenciado de recomendação. Treina modelos em interações usuário-item. Cobra por treinamento + invocações." },
      { name: "User-Personalization recipe", role: "A solução", description: "Recipe atual recomendada pela AWS. Suporta cold-start, exploration, contextual signals. Substitui HRNN/HRNN-metadata." },
      { name: "Similar-Items recipe", role: "Alternativa", description: "Recommend itens similares a um item-âncora (tipo 'quem viu isso também viu'). Boa pra páginas de produto, não pra feed personalizado." },
    ],
    examNote: "<code>Personalize</code> tem 3 famílias de recipes: <b>User-Personalization</b> (feed individual), <b>Personalized-Ranking</b> (ranqueia lista existente), <b>Similar-Items</b> (item↔item). Pra cold-start, sempre User-Personalization.",
  },

  // SEV-2: Lex too few utterances
  {
    id: "lex-fallback",
    sev: 2,
    title: "Lex Confuso",
    incId: "incident.telecom-xyz.lex-fallback",
    customer: "Telecom XYZ",
    slack: "#war-room-bot",
    desc: "Quinta-feira, 15h18. A Telecom XYZ implementou um chatbot de atendimento há 1 mês com a promessa de reduzir 70% dos tickets humanos. O time que construiu o bot fez deploy e saiu de férias. Realidade hoje: 61% das conversas terminam com 'desculpe, não entendi', os clientes ligam pro 0800 frustrados, o backlog do suporte humano triplicou. O CMO marcou call urgente pras 17h. Você abriu o painel do Lex pra investigar antes da reunião.",
    short: "Lex respondendo 'desculpe não entendi' em 61% dos casos",
    slackRecap: "Confirmado: cada intent do bot tem só <b>2 frases-exemplo</b> cadastradas. AWS recomenda <b>15 a 25</b> por intent. Qualquer variação da fala real do cliente ('tô com problema', 'meu sinal sumiu', 'cadê meu wifi') cai no fallback porque não bate exatamente com as 2 frases.",
    hint: "O bot só entende o que ele <b>foi treinado pra entender</b>. Com poucos exemplos por intent, qualquer variação cai no fallback. Onde se ajusta isso?",
    quizQuestion: {
      question: "No Amazon Lex, qual é a diferença prática entre um <b>Intent</b> e um <b>Slot</b>?",
      options: [
        "Intent é o que o bot diz, Slot é o que o usuário diz",
        "Intent é o objetivo do usuário, Slot são os detalhes que faltam pra completar esse objetivo",
        "Intent é pra texto, Slot é pra voz",
        "Intent é pago, Slot é grátis",
      ],
      correctIdx: 1,
      explanation: "<b>Intent</b> representa O QUE o usuário quer (ex: BookHotel). <b>Slots</b> são os dados necessários pra cumprir essa intenção (data, cidade, hóspedes). O bot vai PROMPTAR pelos slots que ainda faltam pra preencher antes de executar a action.",
    },
    ratePerMin: 110,
    initialCost: 720,
    initialElapsed: 19 * 60,
    minLevel: 1,
    sparkType: "flat-spike",
    metrics: [
      { label: "% Fallback", value: "61%", cls: "red", delta: "saudável: <15%", deltaCls: "up" },
      { label: "Conversas / dia", value: "8.1k", cls: "amber", delta: "estável" },
      { label: "Tickets humanos", value: "+340%", cls: "red", delta: "↑ desde lançamento", deltaCls: "up" },
    ],
    timeline: [
      { t: "há 1 mês", ev: "Time lançou bot com 3 intents básicos · <b>2 utterances cada</b>", bad: true },
      { t: "há 3 semanas", ev: "Suporte humano começou a receber tickets escalados do bot" },
      { t: "há 1 semana", ev: "CSAT caiu 18 pontos" },
      { t: "hoje", ev: "<b>CMO escalou o problema</b> · 'o bot não funciona'", bad: true },
    ],
    logs: [
      { ts: "15:18", lv: "INF", msg: 'Cliente disse: "meu sinal sumiu"' },
      { ts: "15:18", lv: "INF", msg: "Lex respondeu: <b>FallbackIntent</b> ('não entendi')" },
      { ts: "15:18", lv: "INF", msg: 'Cliente disse: "tô com problema na internet"' },
      { ts: "15:18", lv: "INF", msg: "Lex respondeu: <b>FallbackIntent</b> de novo" },
      { ts: "15:18", lv: "WRN", msg: "⚠️ Intent 'Abrir ticket' tem só <b>2 frases-exemplo</b> configuradas" },
      { ts: "15:18", lv: "INF", msg: "Melhor match alternativo: 31% (abaixo do mínimo de 40%)" },
    ],
    actions: [
      { id: "inv-lex", type: "investigate", name: "Ver intent stats do Lex", hint: "+30s · grátis", reveals: "lex", timeCost: 30 },
      { id: "add-utterances", name: "➕ Adicionar 15+ utterances por intent", hint: "trabalho de UX writer", grade: "A+", costDelta: 280, xp: 300, verdict: "Excelente.", sub: "Lex aprende dos exemplos. 15-25 utterances variados por intent é o sweet spot recomendado pela AWS. Cobre sinônimos, gírias, frases incompletas." },
      { id: "lower-threshold", name: "📉 Baixar confidence threshold pra 0.20", hint: "rapidinho", grade: "F", costDelta: 1400, xp: 30, verdict: "Pior remédio.", sub: "Vai matchar intent errado o tempo todo. Cliente que pediu mudança de plano vai virar ticket de cobrança. Threshold baixo = falsos positivos." },
      { id: "bedrock-llm", name: "🤖 Migrar bot inteiro pra Bedrock + LLM", hint: "semanas de trabalho", grade: "B", costDelta: 2400, xp: 180, verdict: "Funciona, mas exagero.", sub: "LLM resolve, mas custa 30x mais por conversa e perde o controle determinístico que Lex oferece. Bom pra alguns fluxos, não como solução geral." },
      { id: "more-slots", name: "🧩 Adicionar mais slots aos intents", hint: "não é o problema", grade: "D", costDelta: 800, xp: 50, verdict: "Errou alvo.", sub: "Slots são pra extrair valores (número, data). O problema aqui é o Lex NEM identificar o intent, slots não ajudam nisso." },
    ],
    rootCause: "Lex usa <b>sample utterances</b> pra aprender padrões de intent. Com 2 utterances por intent, ele só matcha o que é quase idêntico ao exemplo, qualquer variação (gíria, ordem diferente, frase incompleta) cai no FallbackIntent. AWS recomenda 15-25 utterances variados por intent, cobrindo: frases curtas e longas, com slots e sem, vocabulário formal e coloquial.",
    services: [
      { name: "Amazon Lex", role: "Conversational AI", description: "Constrói chatbots e voicebots gerenciados. Mesma engine do Alexa. Cobra por API call e por minuto de stream de voz." },
      { name: "Intents & Utterances", role: "O core", description: "Intent = ação que o usuário quer (OpenTicket, CheckBalance). Utterance = exemplo de frase que invoca o intent. Quanto mais variado, melhor a generalização." },
      { name: "Bedrock + Agents", role: "Próximo nível", description: "Pra fluxos abertos onde Lex falha, Bedrock com Agents executa ações via tool-use. Maior flexibilidade, maior custo, menor previsibilidade." },
    ],
    examNote: "<code>Amazon Lex</code> aparece em perguntas sobre chatbots. Saber: intent = o que o user quer, slots = parâmetros, utterances = frases-exemplo, fallback = quando confidence &lt, threshold. <b>Pra melhorar accuracy: mais utterances, não menor threshold.</b>",
  },

  // SEV-1: Rekognition trigger-happy
  {
    id: "rekognition-paranoid",
    sev: 1,
    title: "Rekognition Paranóico",
    incId: "incident.photoshare.over-moderation",
    customer: "PhotoShare",
    slack: "#war-room-content-mod",
    desc: "Quinta-feira, 9h15. PhotoShare (rede social de fotos) acordou em estado de pânico. Um update foi pra produção ontem às 17h. Desde então, 80% das fotos enviadas tão sendo bloqueadas como 'inadequadas'. Pôr-do-sol: bloqueado. Foto de bebê: bloqueada. Churrasco em família: bloqueado. Suporte recebeu 1.200 tickets de manhã. App rating no Google Play caiu de 4,6 pra 2,1 em uma noite. Você é a primeira pessoa do time tech a chegar, precisa entender e resolver antes do CEO acordar.",
    short: "Rekognition bloqueando fotos normais como NSFW",
    slackRecap: "Confirmado: o <b>MinConfidence</b> do Rekognition foi alterado de 80 pra <b>30</b> ontem via console. Threshold baixo tá flagando paisagem (34% confidence) e bebê (33% confidence) como 'Suggestive'. 80% das fotos legítimas bloqueadas. Lojistas perdendo prazo, suporte explodindo.",
    hint: "Bloqueando paisagem com 34% de confiança e bebê com 33%. O número-chave aqui é o <b>MinConfidence</b>. Pra onde ele deveria voltar?",
    quizQuestion: {
      question: "Você precisa identificar UMA pessoa específica em centenas de imagens (ex: bater foto contra uma base de funcionários). Qual approach do Rekognition ESCALA pra isso?",
      options: [
        "Chamar CompareFaces pra cada par de imagens",
        "Indexar a face em um Collection com IndexFaces e usar SearchFacesByImage",
        "Usar DetectFaces em cada imagem manualmente",
        "Treinar um modelo custom com SageMaker",
      ],
      correctIdx: 1,
      explanation: "Pra busca <b>1-pra-N</b>, use <b>Face Collections</b>: cadastre faces de referência com IndexFaces, depois busque cada nova imagem com SearchFacesByImage. <b>CompareFaces</b> é 1-pra-1 (lento se for repetir N vezes). DetectFaces só detecta, não compara identidade.",
    },
    ratePerMin: 280,
    initialCost: 1840,
    initialElapsed: 12 * 60 + 40,
    minLevel: 1,
    sparkType: "spike",
    metrics: [
      { label: "% fotos bloqueadas", value: "80%", cls: "red", delta: "↑ era 2%", deltaCls: "up" },
      { label: "Tickets de suporte", value: "1.2k", cls: "red", delta: "↑ +1.2k (4h)", deltaCls: "up" },
      { label: "App rating", value: "2.1★", cls: "red", delta: "↓ era 4.6", deltaCls: "down" },
    ],
    timeline: [
      { t: "ontem 16:48", ev: "Dev rodou <b>UpdateProject no console</b> · mudou MinConfidence 80→30", bad: true },
      { t: "ontem 17:00", ev: "Auto-deploy rolou · 80% das fotos começam a ser bloqueadas" },
      { t: "ontem 22:00", ev: "Suporte começa a ver enxurrada de tickets" },
      { t: "hoje 08:00", ev: "<b>App Store rating cai de 4.6 pra 2.1</b>", bad: true },
      { t: "hoje 09:15", ev: "Tu pegou o ticket" },
    ],
    logs: [
      { ts: "09:15", lv: "INF", msg: "Rekognition analisou imagem · pôr-do-sol na praia" },
      { ts: "09:15", lv: "INF", msg: "Resultado: 'Sugestivo' (34% confiança) · <b>IMAGEM BLOQUEADA</b>" },
      { ts: "09:15", lv: "INF", msg: "Rekognition analisou imagem · foto de bebê" },
      { ts: "09:15", lv: "INF", msg: "Resultado: 'Sugestivo' (33% confiança) · <b>BLOQUEADA</b>" },
      { ts: "09:15", lv: "INF", msg: "Rekognition analisou imagem · churrasco em família" },
      { ts: "09:15", lv: "INF", msg: "Resultado: 'Álcool' (42% confiança) · <b>BLOQUEADA</b>" },
      { ts: "09:15", lv: "WRN", msg: "⚠️ Threshold atual: <b>30%</b> · ontem era <b>80%</b>" },
    ],
    actions: [
      { id: "inv-rek", type: "investigate", name: "Investigar moderação do Rekognition", hint: "+30s · grátis", reveals: "rek_moderation", timeCost: 30 },
      { id: "inv-threshold", type: "investigate", name: "Histórico do parâmetro MinConfidence", hint: "+30s · grátis", reveals: "threshold", timeCost: 30 },
      { id: "raise-threshold", name: "🎚 Subir MinConfidence pra 80", hint: "rollback do que foi mexido", grade: "A+", costDelta: 240, xp: 320, verdict: "Excelente.", sub: "MinConfidence=80 é o valor canônico recomendado pela AWS pra moderação confiável. Resolve em 1 deploy. E agora coloca essa config em IaC pra não acontecer de novo." },
      { id: "custom-moderation", name: "🛠 Treinar Custom Moderation pro contexto", hint: "dias de trabalho", grade: "B", costDelta: 1800, xp: 160, verdict: "Bom, mas demora.", sub: "Custom Moderation com Rekognition Custom Labels seria ideal pra fine-tuning específico do PhotoShare, mas leva dias. Não resolve a crise de 1.2k tickets agora." },
      { id: "disable", name: "⛔ Desligar moderação por enquanto", hint: "remove o sintoma", grade: "F", costDelta: 4200, xp: 30, verdict: "Pior cenário.", sub: "Vai entrar conteúdo realmente NSFW na plataforma. Risco regulatório, App Store ban, AppStore retira o app. Pior que o problema atual." },
      { id: "a2i-all", name: "👁 Mandar tudo pra revisão humana via A2I", hint: "vai colapsar", grade: "C-", costDelta: 3600, xp: 70, verdict: "Não escala.", sub: "A2I é pra <b>amostra</b> dos casos borderline, não pra 100% do tráfego. Custo + latência ficariam absurdos." },
    ],
    rootCause: "Um dev mudou o parâmetro <code>MinConfidence</code> do <code>DetectModerationLabels</code> de 80 pra 30 via console (sem PR, sem IaC). Com threshold tão baixo, qualquer ruído fraco de detecção vira label confiável, o Rekognition retorna labels com 30% de confiança que normalmente seriam ignoradas. Resultado: paisagem com pôr-do-sol vira 'Suggestive' por causa das cores quentes, foto de bebê vira 'Suggestive' por causa de pele exposta. O modelo não tá errado, o threshold é que tá calibrado errado.",
    services: [
      { name: "Amazon Rekognition", role: "Visão computacional", description: "Análise de imagens e vídeos. <code>DetectModerationLabels</code> classifica conteúdo em hierarquia (Explicit Nudity > Nudity, Suggestive > Female Swimwear, etc)." },
      { name: "MinConfidence parameter", role: "O parâmetro crítico", description: "Filtra labels abaixo do threshold de confiança. Default 50%, recomendado 80%+ pra moderação. Abaixo de 50%: false positives explodem." },
      { name: "Rekognition Custom Labels", role: "Quando padrão não basta", description: "Treina modelo customizado pra labels específicas do produto (ex: logo da marca, contexto cultural). Pra moderação adaptada, é o caminho, mas leva tempo." },
      { name: "Amazon A2I", role: "Humano no loop", description: "Augmented AI. Envia casos borderline pra revisão humana. Usa pra <b>amostragem</b> de incertezas, não pra 100% do tráfego." },
    ],
    examNote: "<code>Rekognition</code> aparece em moderação de conteúdo e visão computacional. Lembrar: <code>MinConfidence</code> default 50%, recomendado <b>80%+</b> em produção. <code>A2I</code> é pra human-in-the-loop em casos borderline, não pra escalar revisão humana.",
  },

  // ============================================================
  // CONCEPT MISSIONS · turn boring theory into real-world drama
  // ============================================================

  // SEV-1: Classification metrics, accuracy vs precision/recall/F1
  {
    id: "fraud-99-percent",
    sev: 1,
    title: "99% e Quebrando",
    incId: "incident.bancoquanta.fraud-accuracy-lie",
    customer: "BancoQuanta",
    slack: "#war-room-fraud",
    desc: "Sexta-feira, 13h. O CEO do BancoQuanta agendou uma call pras 14h com um único item de pauta: 'explicar o prejuízo de $2,1M com fraudes no mês'. Na sala ao lado, o Data Scientist da equipe tá indignado: 'mas o modelo tem 99,4% de acurácia, eu medi! Funcionou no treinamento!'. O Risk Officer responde com cansaço: 'então me explica como passaram 950 fraudes este mês'. Tem 1 hora pra entender o que tá acontecendo. Você abre as métricas do modelo.",
    short: "Modelo com 99% acurácia · empresa perdendo $2M/mês em fraude",
    slackRecap: "Confirmado: o dataset é <b>99% legítimo, 1% fraude</b>. O modelo foi otimizado pra Accuracy e aprendeu a quase nunca dizer 'fraude'. Resultado: <b>capturou 50 de 1000 fraudes reais</b>. Accuracy 99,4% no relatório, fraude passando direto na prática. Compliance no telhado.",
    hint: "Accuracy de 99% num dataset onde 99% é legítimo é matemática enganosa. Qual métrica realmente importa em <b>detecção de fraude</b> (achar os positivos verdadeiros)?",
    quizQuestion: {
      question: "Pra detectar fraude, o modelo deve ter Recall alto (pegar todos os fraudadores). Mas Recall alto SOZINHO pode causar problema. Qual?",
      options: [
        "O modelo fica lento",
        "Muitos falsos positivos, clientes legítimos sendo bloqueados",
        "O modelo overfit nos dados de treino",
        "O custo de treinamento aumenta",
      ],
      correctIdx: 1,
      explanation: "<b>Trade-off Precision × Recall</b>: maximizar Recall faz o modelo 'puxar pro positivo' pra não perder fraude, mas Precision cai (muitos falsos positivos). Cada FP é um cliente legítimo bloqueado, abalando UX. Por isso F1 (média harmônica) ou métricas de negócio (custo do FP × custo do FN) são úteis pra equilibrar.",
    },
    ratePerMin: 280,
    initialCost: 2840,
    initialElapsed: 24 * 60,
    minLevel: 1,
    sparkType: "spike",
    metrics: [
      { label: "Acurácia reportada", value: "99.4%", cls: "green", delta: "parece ótimo", deltaCls: "down" },
      { label: "Fraudes capturadas", value: "50 / 1000", cls: "red", delta: "recall = 5%", deltaCls: "down" },
      { label: "$ perdido em fraude", value: "$2.1M", cls: "red", delta: "↑ +$2.1M (mês)", deltaCls: "up" },
    ],
    timeline: [
      { t: "há 3 meses", ev: "Modelo foi pra produção · <b>99.4% accuracy validada</b>" },
      { t: "há 1 mês", ev: "Time de Risco começa a ver pico de fraudes não detectadas" },
      { t: "há 2 semanas", ev: "Risk Officer pede review · DS diz 'modelo tá ótimo'" },
      { t: "ontem", ev: "<b>CFO viu o número: $2.1M de prejuízo no mês</b>", bad: true },
      { t: "agora", ev: "Tu pegou o ticket · call do CEO em 1h" },
    ],
    logs: [
      { ts: "13:02", lv: "INF", msg: "Detector de fraude analisou transação" },
      { ts: "13:02", lv: "INF", msg: "Valor: R$ 12.400" },
      { ts: "13:02", lv: "INF", msg: "Decisão do modelo: <b>legítima</b> (96% confiança)" },
      { ts: "13:02", lv: "ERR", msg: "🚨 7 dias depois: <b>chargeback</b> · era fraude!" },
      { ts: "13:02", lv: "WRN", msg: "⚠️ Métrica usada no treinamento: <b>accuracy</b>" },
      { ts: "13:02", lv: "WRN", msg: "Distribuição do dataset: 99% legítimas · 1% fraudes" },
    ],
    actions: [
      { id: "inv-metrics", type: "investigate", name: "Ver matriz de confusão", hint: "+30s · grátis", reveals: "fraud_metrics", timeCost: 30 },
      { id: "inv-balance", type: "investigate", name: "Distribuição das classes no dataset", hint: "+30s · grátis", reveals: "class_balance", timeCost: 30 },
      { id: "retrain-f1", name: "🎯 Retreinar otimizando F1/Recall + ajuste de peso de classe", hint: "métrica que importa pra fraude", grade: "A+", costDelta: 480, xp: 340, verdict: "Excelente.", sub: "Em classes desbalanceadas, accuracy mente. Recall (capturar as fraudes) é o que evita prejuízo. F1 balanceia precision e recall. Ajustar o peso da classe minoritária no algoritmo (parâmetro de class weighting) compensa o ratio 99:1 sem precisar mexer nos dados." },
      { id: "smote", name: "⚖ Oversampling com SMOTE + reavaliar", hint: "balancear dataset", grade: "A-", costDelta: 720, xp: 240, verdict: "Bom.", sub: "SMOTE cria amostras sintéticas da classe minoritária. Funciona, mas tem risco de overfitting. Combinar com mudança de métrica seria ideal." },
      { id: "lower-threshold", name: "📉 Baixar threshold de decisão (0.5 → 0.2)", hint: "ajuste fino", grade: "B", costDelta: 1200, xp: 160, verdict: "Funciona em parte.", sub: "Vai pegar mais fraudes mas aumenta falsos positivos (cliente legítimo bloqueado). Sem otimizar o threshold formalmente via PR/ROC, é chute." },
      { id: "more-features", name: "➕ Adicionar 30 novas features", hint: "DS está convencido", grade: "F", costDelta: 3200, xp: 30, verdict: "Errou alvo.", sub: "O problema não é capacidade do modelo, é a métrica de otimização e o desbalanceamento. Mais features não resolvem isso." },
    ],
    rootCause: "Em dataset com 99% de classe majoritária, <b>um modelo que sempre prediz a classe majoritária já tem 99% de accuracy</b>. O DS otimizou pra accuracy e ficou feliz com 99.4%, mas o modelo aprendeu a quase nunca dizer 'fraude', capturou apenas 50 de 1000 fraudes (recall = 5%). Pra problema de fraude (onde False Negative custa caríssimo), a métrica certa é <b>Recall</b> ou <b>F1</b>, não accuracy.",
    services: [
      { name: "Accuracy", role: "Métrica que enganou", description: "<code>(TP+TN)/total</code>. Funciona quando classes estão balanceadas. Em datasets desbalanceados, é a pior métrica possível, modelo trivial 'sempre legit' já tem 99%." },
      { name: "Precision · Recall · F1", role: "Métricas certas pra fraude", description: "<b>Precision</b> = TP/(TP+FP), quão certos estamos quando dizemos 'fraude'. <b>Recall</b> = TP/(TP+FN), quanta fraude pegamos. <b>F1</b> = média harmônica dos dois." },
      { name: "Confusion Matrix", role: "Diagnóstico", description: "Tabela 2×2 (TP, FP, FN, TN). Sempre olhar antes de declarar vitória num classificador. Revela exatamente onde o modelo erra." },
      { name: "SageMaker Model Monitor", role: "Observabilidade", description: "Avalia métricas do modelo em produção continuamente. Detecta drift e queda de qualidade, se tivesse alarme em Recall, isso teria sido pego em dia 1." },
    ],
    examNote: "<b>Tema certo de cair na prova.</b> Quando dataset desbalanceado: <b>nunca use accuracy</b>. Use Precision pra minimizar falsos positivos (ex: filtro de spam), Recall pra minimizar falsos negativos (ex: fraude, câncer), F1 pra balancear, AUC pra ranqueamento.",
  },

  // SEV-2: Inference types, real-time vs async vs serverless vs batch
  {
    id: "endpoint-too-expensive",
    sev: 2,
    title: "Endpoint Caro Demais",
    incId: "incident.scanx.over-provisioned-endpoint",
    customer: "ScanX (radiologia digital)",
    slack: "#war-room-cfo",
    desc: "Segunda-feira, 1h14 da manhã. CFO da ScanX (startup de radiologia digital) deixou print no Slack do time de tech: a fatura de SageMaker do mês foi de $14.000, em UM endpoint só. 'Pessoal, ou cortamos 60% disso até sexta, ou desligamos o produto'. Quem leu primeiro foi você, o tech lead. O contexto: o modelo analisa raio-X pra dar diagnóstico assistido, médicos aceitam esperar até 5 minutos pelo resultado, mas o endpoint fica ligado 24/7, 61% do tempo ocioso. Você precisa entender as opções de inferência da AWS rapidamente.",
    short: "Endpoint Real-time queimando $14k/mês · ocioso 61% do tempo",
    slackRecap: "Confirmado: o endpoint do classificador tá em modo <b>Real-time</b>, cobra 24/7 mesmo parado. GPU em 14% de utilização média, 61% do tempo o endpoint não recebe quase nada. SLA dos médicos é <b>5 minutos</b> de latência aceitável. Gasto: $14.700/mês em algo que poderia ser bem mais barato.",
    hint: "O endpoint fica ocioso 61% do tempo, e o SLA permite latência de até 5 minutos. Pensa nos <b>tipos de inferência</b> do SageMaker, quem cobra só pelo uso real?",
    quizQuestion: {
      question: "Seu modelo em produção precisa lidar com PICOS de tráfego (10× à noite). Qual feature do SageMaker ajusta automaticamente a quantidade de instâncias do endpoint?",
      options: [
        "Auto Scaling do endpoint",
        "Multi-Model Endpoint",
        "Inference Pipeline",
        "SageMaker Studio",
      ],
      correctIdx: 0,
      explanation: "<b>SageMaker Auto Scaling</b> escala horizontalmente baseado em métricas (CPU, RAM, InvocationsPerInstance). Adiciona/remove instâncias conforme demanda. Multi-Model serve VÁRIOS modelos numa instância. Inference Pipeline encadeia pré-processamento + modelo. Studio é o IDE.",
    },
    ratePerMin: 30,
    initialCost: 14200,
    initialElapsed: 20 * 60,
    minLevel: 1,
    sparkType: "flat-spike",
    metrics: [
      { label: "Custo / mês", value: "$13.7k", cls: "red", delta: "↑ +$13.7k", deltaCls: "up" },
      { label: "GPU utilization", value: "14%", cls: "red", delta: "ocioso a maioria do tempo", deltaCls: "down" },
      { label: "SLA exigido", value: "≤ 5min", cls: "green", delta: "atual: 0.8s · folga enorme" },
    ],
    timeline: [
      { t: "há 6 meses", ev: "Equipe DS deployou modelo em Real-time endpoint · 'pra garantir latência'", bad: true },
      { t: "há 3 meses", ev: "Tráfego se consolidou · 60% ocioso à noite e fim de semana" },
      { t: "ontem", ev: "<b>CFO viu a fatura</b> · 'cortem 60% ou matamos o projeto'", bad: true },
      { t: "hoje", ev: "Tu pegou o ticket · próxima reunião com CFO em 2 dias" },
    ],
    logs: [
      { ts: "01:14", lv: "INF", msg: "Endpoint do classificador de raio-X · <b>ocioso há 23 minutos</b>" },
      { ts: "01:14", lv: "INF", msg: "Custo do servidor: $1,47/hora · cobrado 24/7" },
      { ts: "10:00", lv: "INF", msg: "Pico de uso · 480 req/min · GPU em 68%" },
      { ts: "20:00", lv: "INF", msg: "Quase ocioso · 3 req/min · GPU em 2%" },
      { ts: "20:00", lv: "INF", msg: "Tamanho do modelo: 487 MB (cabe em Serverless)" },
    ],
    actions: [
      { id: "inv-traffic", type: "investigate", name: "Ver padrão de tráfego no CloudWatch", hint: "+30s · grátis", reveals: "endpoint_traffic", timeCost: 30 },
      { id: "inv-cost", type: "investigate", name: "Cost Explorer detalhado", hint: "+30s · grátis", reveals: "endpoint_cost", timeCost: 30 },
      { id: "async", name: "📬 Migrar pra Async Inference", hint: "SLA 5min permite · scale to zero", grade: "A+", costDelta: 320, xp: 340, verdict: "Excelente.", sub: "Async Inference processa em fila (SQS interno), pode escalar pra zero quando não tem request. Suporta SLA de minutos/horas. Economia: ~70%. Tudo coincide com o caso." },
      { id: "serverless", name: "⚡ Migrar pra Serverless Inference", hint: "modelo cabe (487MB < 10GB)", grade: "A", costDelta: 480, xp: 280, verdict: "Boa opção.", sub: "Serverless Inference cobra por ms de compute, scale automático. Boa pra carga variável. Tem cold-start (~5s) que dependendo do uso pode irritar, mas tu tem folga de 5min." },
      { id: "smaller-instance", name: "🔽 Trocar pra ml.m5.large (CPU)", hint: "modelo pequeno deve rodar em CPU", grade: "B", costDelta: 580, xp: 180, verdict: "Funcional.", sub: "Reduz de $0.74/hr pra $0.12/hr. Resolve custo mas mantém o desperdício do 'sempre ligado'. Async resolveria melhor." },
      { id: "batch-transform", name: "📦 Batch Transform 1x por dia", hint: "processo overnight", grade: "C", costDelta: 1400, xp: 80, verdict: "Atende custo, quebra SLA.", sub: "Batch Transform só roda quando tu inicia o job e exige input em S3. Médicos não vão esperar até o overnight pra ver raio-X." },
      { id: "scale-up", name: "📈 Scale up pra GPU maior", hint: "DS pediu", grade: "F", costDelta: 8400, xp: 30, verdict: "Errou todos os alvos.", sub: "Endpoint já tá ocioso 61% do tempo. Scale up só faz a fatura crescer." },
    ],
    rootCause: "Real-time endpoint cobra <b>24/7 pelo tempo que existe</b>, mesmo ocioso. O modelo da ScanX tem padrão de tráfego com picos no horário comercial e quase nada à noite, 61% do tempo ocioso. Pra SLA de 5 minutos (que é o que os médicos aceitam), <b>Async Inference</b> é ideal: enfileira requests, escala pra zero, e custa só pelo tempo de processamento real. Economia esperada: ~70%.",
    services: [
      { name: "Real-time Inference", role: "O que tá em uso (errado)", description: "Endpoint sempre ligado, latência baixa (ms). Bom pra chatbot, recomendação ao vivo. Cobra 24/7." },
      { name: "Async Inference", role: "A solução", description: "Fila interna (até 1GB de payload). SLA de minutos a 1h. Scale to zero. Ideal pra inferência de mídia (imagem, áudio) com SLA relaxado." },
      { name: "Serverless Inference", role: "Alternativa", description: "Pay-per-ms de compute. Cold-start ~5s. Bom pra cargas intermitentes e modelos &lt, 10GB. Sem gerenciar instância." },
      { name: "Batch Transform", role: "Pra outro caso", description: "Processa dataset inteiro de S3 em job único. Sem endpoint persistente. Bom pra reprocessamento periódico, não pra requests dinâmicos." },
    ],
    examNote: "Tipos de inferência são CERTEZA na prova. Lembrar: <b>Real-time</b> (ms · sempre ligado · chatbot), <b>Async</b> (min-hora · scale to zero · mídia), <b>Serverless</b> (ms compute · intermitente · &lt;10GB), <b>Batch</b> (overnight · S3 in/out · sem endpoint).",
  },

  // SEV-3: Regression metrics, MAE vs MSE vs RMSE vs R²
  {
    id: "forecast-metrics-lie",
    sev: 3,
    title: "Forecast Mente",
    incId: "incident.printshop.regression-bad-metrics",
    customer: "PrintShop",
    slack: "#war-room-supply",
    desc: "Segunda-feira pós-Black Friday, 9h. Time da PrintShop entra na call de post-mortem com a expressão de quem já passou por isso: é o TERCEIRO ano consecutivo que acontece. Os cartuchos de tinta acabaram às 8h da manhã da Black Friday. $400 mil em vendas perdidas só nesse SKU. O modelo de previsão de demanda foi 'validado' como bom (MAE=12, parece OK), mas RMSE=89 e R²=0,42 contam outra história. Time de supply, dev e dados sentaram juntos: 'precisamos entender por que o modelo erra SEMPRE em data sazonal'.",
    short: "Previsão de demanda falha em outliers · MAE engana sem RMSE/R²",
    slackRecap: "Confirmado: MAE=12 (parecia ótimo). Mas <b>RMSE=89 (7x maior!)</b> indica outliers grandes. <b>R²=0,42</b>: o modelo não captura o padrão. Erros concentrados em Black Friday, Natal, volta às aulas. Algo que tem componente sazonal forte tá sendo modelado como se fosse linear.",
    hint: "RMSE 7× MAE indica <b>outliers fortes</b>. R² de 0,42 indica que o modelo <b>não captura o padrão</b>. Pensa: o modelo linear consegue lidar com sazonalidade (datas-pico)?",
    quizQuestion: {
      question: "Um analista de negócios SEM CONHECIMENTO DE CÓDIGO quer criar previsões com ML. Qual feature do SageMaker dá uma interface visual no-code pra construir modelos arrastando colunas?",
      options: [
        "SageMaker Studio",
        "SageMaker Canvas",
        "SageMaker Autopilot",
        "SageMaker Pipelines",
      ],
      correctIdx: 1,
      explanation: "<b>SageMaker Canvas</b> é a interface no-code pra analistas: arrasta dataset, escolhe coluna-alvo, clica train. Internamente usa Autopilot. <b>Studio</b> é o IDE pra cientistas (precisa código). <b>Autopilot</b> é AutoML acessado via SDK/Studio. <b>Pipelines</b> é orquestração de ML workflows.",
    },
    ratePerMin: 50,
    initialCost: 4200,
    initialElapsed: 28 * 60,
    minLevel: 1,
    sparkType: "spike",
    metrics: [
      { label: "MAE (treino)", value: "12 u", cls: "green", delta: "parece bom", deltaCls: "down" },
      { label: "RMSE (treino)", value: "89 u", cls: "red", delta: "7× MAE · outliers", deltaCls: "up" },
      { label: "R² (treino)", value: "0.42", cls: "red", delta: "modelo não captura padrão", deltaCls: "down" },
    ],
    timeline: [
      { t: "há 1 ano", ev: "Modelo de previsão de demanda foi pra prod · MAE=12 aprovado" },
      { t: "Black Friday 2023", ev: "Estoque acabou em 4h · 'foi exceção'", bad: true },
      { t: "Natal 2023", ev: "Faltou produto · 'foi exceção'", bad: true },
      { t: "Black Friday 2024", ev: "<b>Estoque vazio · $400k perdido</b> · 3 padrões = não é exceção", bad: true },
      { t: "agora", ev: "Tu pegou o caso · post-mortem semana que vem" },
    ],
    logs: [
      { ts: "24/11 04:12", lv: "INF", msg: "Modelo previu demanda · cartucho de tinta · <b>240 unidades</b>" },
      { ts: "24/11 23:59", lv: "ERR", msg: "🚨 Demanda real: <b>1.890 unidades</b> · estoque acabou às 8h da manhã" },
      { ts: "25/11 09:00", lv: "WRN", msg: "Métrica do modelo: <b>MAE=12</b> · validação <b>excluiu Black Friday</b>" },
      { ts: "25/11 09:00", lv: "INF", msg: "Algoritmo: Linear Learner (regressão linear)" },
      { ts: "25/11 09:02", lv: "WRN", msg: "⚠️ <b>R²=0,42</b> · abaixo do mínimo (0,7) · alerta foi ignorado" },
    ],
    actions: [
      { id: "inv-regression", type: "investigate", name: "Detalhes das métricas de regressão", hint: "+30s · grátis", reveals: "regression_eval", timeCost: 30 },
      { id: "switch-algorithm", name: "🔄 Trocar pra DeepAR (time series com sazonalidade)", hint: "SageMaker tem algoritmo dedicado", grade: "A+", costDelta: 800, xp: 340, verdict: "Excelente.", sub: "R²=0.42 indica que modelo linear não captura o padrão. DeepAR é projetado pra time series com sazonalidade (Black Friday, Natal, back-to-school) e supera regressão linear nesse domínio." },
      { id: "use-mae-loss", name: "📊 Treinar otimizando MAE em vez de MSE", hint: "menos sensível a outliers", grade: "B", costDelta: 1200, xp: 160, verdict: "Resolve parcialmente.", sub: "MAE é robusto a outliers mas continua usando modelo linear inadequado. Vai melhorar um pouco, mas R²=0.42 indica problema mais profundo: o algoritmo." },
      { id: "feature-engineering", name: "🔧 Adicionar features de sazonalidade ao modelo linear", hint: "manual de calendário", grade: "B-", costDelta: 1600, xp: 140, verdict: "Trabalhoso e frágil.", sub: "Adicionar dummies pra cada feriado manualmente funciona um pouco, mas é frágil, qualquer novo padrão sazonal não previsto vai quebrar. DeepAR aprende isso sozinho." },
      { id: "more-data", name: "📚 Adicionar 5 anos de histórico", hint: "DS está convencido", grade: "F", costDelta: 3600, xp: 30, verdict: "Não muda o problema fundamental.", sub: "O algoritmo linear não captura sazonalidade não importa quanto histórico tu der. R² baixo é diagnóstico de problema estrutural, não de pouco dado." },
    ],
    rootCause: "MAE (Mean Absolute Error) parecia bom (12 unidades), mas <b>RMSE (89) era 7× maior que MAE</b>, sinal claro de que existem outliers com erros enormes (datas sazonais). E <b>R²=0.42 indica que o modelo só explica 42% da variância dos dados</b>, não captura o padrão real. O modelo linear foi otimizado pra dias 'normais' e ignora completamente os spikes de Black Friday. A solução é trocar pra um algoritmo que entende sazonalidade nativamente (DeepAR ou Forecast).",
    services: [
      { name: "MAE (Mean Absolute Error)", role: "Métrica robusta", description: "Média do |erro|. Mesma unidade do target. Robusto a outliers, não penaliza muito errões. Bom pra reportar pra negócio." },
      { name: "MSE / RMSE", role: "Métrica que pesa outliers", description: "RMSE = √MSE. Penaliza erros grandes muito mais. Quando RMSE &gt;&gt, MAE, tem outliers ruins. Bom durante treino pra forçar modelo a não ignorar casos extremos." },
      { name: "R² (Coeficiente de Determinação)", role: "Diagnóstico", description: "Quanto da variância dos dados o modelo explica. R²=1 perfeito, R²=0 = modelo trivial (média). Em produção: alvo &gt;0.7. R²&lt;0.5 = algoritmo inadequado." },
      { name: "SageMaker DeepAR", role: "Algoritmo certo aqui", description: "Time series com sazonalidade nativa. Aprende padrões semanais, mensais, anuais. Supera regressão linear/random forest em séries sazonais." },
    ],
    examNote: "Métricas de regressão na prova: <b>MAE</b> (robusto, unidade do target), <b>MSE/RMSE</b> (penaliza outliers), <b>R²</b> (variance explained, 0-1). Quando RMSE &gt;&gt, MAE: outliers no dataset. R² &lt, 0.5: modelo inadequado.",
  },

  // SEV-2: Algorithm choice, regression vs classification
  {
    id: "wrong-algorithm",
    sev: 2,
    title: "Algoritmo Errado",
    incId: "incident.churntech.regression-on-binary",
    customer: "ChurnTech",
    slack: "#war-room-ml",
    desc: "Terça-feira, 11h42. A Karen, PM da ChurnTech (SaaS B2B), abriu o Slack do time de ML com uma pergunta inocente: 'gente, recebi os resultados do novo modelo de churn, mas tem uns valores estranhos, tipo, o cliente u-12500 tem −18% de chance de cancelar, e o u-12502 tem 141%. Como eu apresento isso pro CEO?'. Silêncio no canal. Um DS sênior responde só com 😬. O modelo foi treinado por um DS júnior que entrou esse mês, e ele escolheu o algoritmo errado pro tipo de problema. Você foi chamado pra fazer review e corrigir.",
    short: "Linear regression em target binário · outputs fora de [0,1]",
    slackRecap: "Confirmado: o DS júnior usou <b>Regressão Linear</b> pra um problema onde o alvo só tem dois valores (churn: 0 ou 1). Regressão linear gera qualquer número real, <b>23% das predições</b> saíram fora do intervalo [0,1] (algumas em 1,47, outras em -0,3). Tipo de algoritmo não bate com o tipo de problema.",
    hint: "O alvo só tem dois valores (0 ou 1). Isso é <b>problema de classificação</b>, não de regressão. Qual algoritmo é apropriado pra prever uma classe binária?",
    quizQuestion: {
      question: "Você tem dataset tabular com 1M de linhas, 50 features, target binário. Logistic Regression deu um baseline decente, mas você quer melhorar. Qual algoritmo costuma performar MELHOR em dados tabulares estruturados?",
      options: [
        "K-Means Clustering",
        "Linear Regression",
        "XGBoost (gradient boosting)",
        "Naive Bayes",
      ],
      correctIdx: 2,
      explanation: "Em dados tabulares, <b>gradient boosting</b> (XGBoost, LightGBM, CatBoost) é praticamente sempre state-of-the-art. Captura interações não-lineares entre features. K-Means é clustering (não-supervisionado). Linear Regression é pra valores contínuos. Naive Bayes assume independência entre features (forte limitação).",
    },
    ratePerMin: 60,
    initialCost: 1200,
    initialElapsed: 13 * 60,
    minLevel: 0,
    sparkType: "spike",
    metrics: [
      { label: "Target", value: "0 ou 1", cls: "amber", delta: "binário" },
      { label: "Outputs do modelo", value: "−0.3 a 1.4", cls: "red", delta: "fora de [0,1]", deltaCls: "up" },
      { label: "% predictions inválidas", value: "23%", cls: "red", delta: "fora do range", deltaCls: "up" },
    ],
    timeline: [
      { t: "há 2 semanas", ev: "DS júnior treinou modelo de churn · target binário (0/1)" },
      { t: "há 1 semana", ev: "Modelo deployed · time de produto começa a consumir" },
      { t: "ontem", ev: "Product Manager: '<b>como assim -0.18 de chance?</b>'", bad: true },
      { t: "hoje", ev: "DS sênior intervém · tu pega o caso pra revisar" },
    ],
    logs: [
      { ts: "11:42", lv: "INF", msg: "Modelo de churn analisou cliente · 47 features" },
      { ts: "11:42", lv: "INF", msg: "Previsão pra cliente u-12498: <b>0,42</b>" },
      { ts: "11:42", lv: "INF", msg: "Previsão pra cliente u-12500: <b>−0,18</b> ⚠️" },
      { ts: "11:42", lv: "INF", msg: "Previsão pra cliente u-12502: <b>1,41</b> ⚠️" },
      { ts: "11:42", lv: "WRN", msg: "⚠️ Algoritmo configurado: <b>Linear Regression</b> (regressão)" },
      { ts: "11:42", lv: "WRN", msg: "Saída do modelo: qualquer número real · <b>não é probabilidade</b>" },
    ],
    actions: [
      { id: "inv-notebook", type: "investigate", name: "Ver detalhes do modelo no SageMaker Canvas", hint: "+30s · grátis", reveals: "model_output", timeCost: 30 },
      { id: "xgb-classifier", name: "🌳 Trocar para XGBoost em modo classificação", hint: "padrão-ouro pra tabular", grade: "A+", costDelta: 240, xp: 320, verdict: "Excelente.", sub: "XGBoost em modo classificação é o padrão pra problemas tabulares: robusto, lida com missing values, indica importância das features. Saída nativa entre 0 e 1 como probabilidade. Disponível como algoritmo built-in do SageMaker." },
      { id: "logistic-regression", name: "📈 Trocar para Logistic Regression", hint: "interpretável", grade: "A", costDelta: 320, xp: 280, verdict: "Boa.", sub: "Apesar do nome 'regression', Logistic Regression é um algoritmo de CLASSIFICAÇÃO. Aplica função sigmoid na saída, output sempre em [0,1] interpretável como probabilidade. Bom baseline interpretável." },
      { id: "clamp", name: "🪝 Manter Linear Regression e truncar resultado em [0,1]", hint: "patch rápido", grade: "F", costDelta: 1200, xp: 30, verdict: "Errado conceitualmente.", sub: "Truncar é band-aid. Linear Regression é otimizada pra minimizar erro de valores contínuos, não pra modelar probabilidades. Vai dar predictions ruins disfarçadas de bonitas." },
      { id: "regularize", name: "⚙ Adicionar regularização ao modelo de regressão", hint: "DS júnior sugeriu", grade: "D", costDelta: 800, xp: 50, verdict: "Não muda o problema.", sub: "Regularização (Ridge/Lasso) ainda é regressão linear, output continua fora de [0,1] em alguns casos. Não é o tipo certo de modelo pro problema." },
    ],
    rootCause: "Regressão Linear (Linear Regression) é um algoritmo de regressão: produz qualquer número real como saída. Pra problema de <b>classificação</b> (variável-alvo binária 0/1), o output deve ser uma <b>probabilidade entre 0 e 1</b>. Os algoritmos certos são: <b>Logistic Regression</b> (aplica sigmoid na saída), <b>XGBoost em modo classificação</b>, <b>Random Forest classifier</b>, ou redes neurais com função de ativação sigmoid/softmax na última camada. Usar Linear Regression em alvo binário é erro conceitual clássico de iniciante.",
    services: [
      { name: "Classificação", role: "Tipo de problema certo", description: "Variável-alvo categórica (0/1 binária, ou múltiplas classes). Saída esperada: probabilidade de cada classe (entre 0 e 1). Exemplos: detecção de fraude, classificação de email (spam ou não), previsão de churn." },
      { name: "Regressão", role: "Pra outro caso", description: "Variável-alvo numérica contínua (preço, demanda, temperatura). Saída: número real qualquer. Exemplos: prever valor de imóvel, demanda mensal, idade." },
      { name: "Logistic Regression", role: "Baseline interpretável", description: "Apesar do nome, é algoritmo de CLASSIFICAÇÃO. Aplica função sigmoid: output sempre em [0,1]. Coeficientes interpretáveis (mostra importância de cada feature direto)." },
      { name: "XGBoost", role: "Padrão-ouro em dados tabulares", description: "Algoritmo de gradient boosting de árvores de decisão. Tem modo classificação e modo regressão. Vence muita competição Kaggle e é o padrão pra problemas tabulares em produção." },
    ],
    examNote: "<b>Diferença que cai na prova:</b> Regressão (target contínuo, ex: preço) vs Classificação (target categórico, ex: churn 0/1) vs Clustering (sem target, agrupa). Cada um tem algoritmos próprios. Linear Regression é só pra regressão!",
  },

  // SEV-2: Trainium vs P4d, specialized chips
  {
    id: "training-eternal",
    sev: 2,
    title: "Treinamento Eterno",
    incId: "incident.genlab.training-cost-explosion",
    customer: "GenLab",
    slack: "#war-room-finops",
    desc: "Quarta-feira, 7h14. CFO da GenLab (startup de IA generativa) entrou na call mensal de finance review e jogou na tela: $85.000 em treinamento de modelo este mês. 'Eu preciso de uma redução de 40% até o final do mês'. O time tá fazendo fine-tuning de um LLM custom em máquinas P4d (8 GPUs A100 por máquina, $32/hora). Cada run leva 72h e custa quase $10k. O lead de ML te chamou: 'precisamos descobrir uma forma de economizar SEM perder qualidade no treino'. Sua missão: investigar as opções e propor algo concreto.",
    short: "Training em P4d (A100) caro · existe alternativa nativa AWS",
    slackRecap: "Confirmado: o time tá treinando em <b>P4d (8x GPU A100)</b> a $32/hora. Job rodando há 4 semanas, ainda 2 semanas pra terminar. Custo estimado total: $43k pra esse único treinamento. Modelo é um transformer padrão em PyTorch, sem nada custom.",
    hint: "O treino tá em GPUs A100 padrão. A AWS tem <b>chips próprios feitos especificamente pra treinar IA</b> que costumam ser mais baratos. Qual seria?",
    quizQuestion: {
      question: "A AWS oferece dois chips de IA: <b>Trainium</b> e <b>Inferentia</b>. Qual a diferença prática entre eles em termos de FASE do ciclo de vida do modelo?",
      options: [
        "Trainium é mais novo, Inferentia é legado",
        "Trainium é pra dados, Inferentia é pra modelos",
        "Trainium é pra fase de treino, Inferentia é pra fase de serving em produção",
        "São o mesmo chip com nomes diferentes",
      ],
      correctIdx: 2,
      explanation: "<b>Trainium</b> é otimizado pra cargas de treinamento (forward + backward pass, otimizadores como Adam). <b>Inferentia</b> é otimizado pra forward pass only (serving em produção: alta throughput, baixo custo por inferência). Memoriza pelos prefixos: <b>Trn</b>1 = <b>Tr</b>aining, <b>Inf</b>1 = <b>Inf</b>erence.",
    },
    ratePerMin: 130,
    initialCost: 9470,
    initialElapsed: 30 * 60,
    minLevel: 2,
    sparkType: "spike",
    metrics: [
      { label: "Training cost / mês", value: "$85k", cls: "red", delta: "↑ +$85k", deltaCls: "up" },
      { label: "Tempo por run", value: "72h", cls: "amber", delta: "9 runs/mês" },
      { label: "Corte exigido", value: "−40%", cls: "red", delta: "CFO mandou", deltaCls: "down" },
    ],
    timeline: [
      { t: "há 4 meses", ev: "Time escolheu P4d (8× A100) · 'é o que todo mundo usa pra LLM'" },
      { t: "há 2 meses", ev: "Cost começou a crescer · 9 runs/mês" },
      { t: "ontem", ev: "<b>CFO marcou call de emergência</b> · 'cortem 40% em 30 dias'", bad: true },
      { t: "hoje", ev: "Tu pegou o caso · time tá empolgado em manter A100" },
    ],
    logs: [
      { ts: "07:14", lv: "INF", msg: "Treinamento iniciado · LLM fine-tuning · 4 máquinas P4d" },
      { ts: "07:14", lv: "INF", msg: "8 GPUs A100 por máquina · total 32 GPUs" },
      { ts: "07:14", lv: "INF", msg: "Framework: PyTorch · treinamento distribuído" },
      { ts: "07:14", lv: "INF", msg: "Custo estimado: $131/hora × 72h = <b>$9.438</b>" },
      { ts: "07:14", lv: "INF", msg: "Modelo: HuggingFace Transformers" },
      { ts: "07:14", lv: "WRN", msg: "⚠️ Sem Spot, sem Savings Plan, sem avaliação de Trainium" },
    ],
    actions: [
      { id: "inv-cost", type: "investigate", name: "Ver detalhes do training job e comparações", hint: "+30s · grátis", reveals: "training_cost", timeCost: 30 },
      { id: "trainium", name: "🧠 Migrar pra ml.trn1.32xlarge (Trainium)", hint: "chip AWS otimizado pra training", grade: "A+", costDelta: 480, xp: 340, verdict: "Excelente.", sub: "Trainium é o chip da AWS desenhado especificamente pra training de Deep Learning. 35% mais barato que P4d, performance equivalente ou superior em transformers. AWS oferece SDK que faz a migração sem reescrever o modelo. Atinge o corte de 40% do CFO." },
      { id: "savings-plan", name: "💰 Savings Plan 1y pra P4d", hint: "30% off com commit", grade: "B", costDelta: 720, xp: 180, verdict: "Funciona parcialmente.", sub: "Reduz 30% se commit 1 ano. Bom se carga é estável e não tem alternativa. Aqui Trainium é melhor (35% off sem commit + melhor perf)." },
      { id: "spot", name: "🎲 Trocar pra Spot Instances P4d", hint: "−70% mas interrompível", grade: "B-", costDelta: 1200, xp: 140, verdict: "Risco alto.", sub: "Spot dá 70% off mas pode ser interrompido a qualquer momento. Em training de 72h, perder o job no fim é caótico. Precisa checkpointing robusto. Trainium é mais seguro." },
      { id: "inferentia", name: "⚡ Migrar pra Inferentia (Inf2)", hint: "DS sugeriu", grade: "F", costDelta: 4200, xp: 30, verdict: "Chip errado.", sub: "<b>Inferentia é pra INFERENCE, não training.</b> Trainium = training. Inferentia = production inference. Confundir os dois é erro clássico de prova." },
      { id: "consumer-gpu", name: "🎮 Treinar em GPU consumer fora da AWS", hint: "barato mas caos", grade: "D", costDelta: 2800, xp: 60, verdict: "Não.", sub: "Perde integração SageMaker, IAM, logging, segurança, networking. Trade-off ruim pra empresa séria. CFO quer corte com governança, não anarchy." },
    ],
    rootCause: "AWS tem dois chips desenhados especificamente pra ML: <b>Trainium</b> (família <code>trn1</code>) pra <i>training</i> de modelos, e <b>Inferentia</b> (família <code>inf1</code>/<code>inf2</code>) pra <i>inference</i> em produção. Trainium custa 35% menos que GPUs A100 (P4d) e tem performance equivalente ou superior em training de transformers. AWS fornece SDK próprio (Neuron) que adapta o código sem precisar reescrever a arquitetura do modelo. O time da GenLab não conhecia a opção e foi de P4d por hábito.",
    services: [
      { name: "EC2 Trainium (Trn)", role: "A solução", description: "Chip AWS pra <b>training</b>. Família <code>trn1.32xlarge</code>. 35-50% mais barato que P4d. Performance equivalente ou superior em training de transformer. Integrado com SageMaker." },
      { name: "EC2 Inferentia (Inf)", role: "Pra outro caso", description: "Chip AWS pra <b>inference</b>. Família <code>inf1</code> (1ª geração) e <code>inf2</code> (mais recente). Pra deploy de modelos em produção. <b>Não usar pra training.</b>" },
      { name: "P4d (NVIDIA A100)", role: "Default mais caro", description: "8× NVIDIA A100 40GB. Versátil, suporta qualquer framework. Padrão da indústria mas $32.77/hr. Use Savings Plan se commit longo prazo." },
      { name: "Spot Instances", role: "Alternativa econômica", description: "70% off mas interrompível com 2min de aviso. Bom pra workloads com checkpointing e tolerância. Em training longo, risco operacional." },
    ],
    examNote: "<b>Trainium vs Inferentia é pergunta clássica de prova.</b> Memoriza: <code>Trn</code> = <b>tr</b>aining, <code>Inf</code> = <b>inf</b>erence. Mesma raiz da palavra. Trainium economiza no treino, Inferentia economiza em inference. Confundir é erro fácil de evitar.",
  },
];

// Apply pedagogical order + minLevel override. Missions not in MISSION_ORDER
// (shouldn't happen, but defensive) are appended at the end.
export const INCIDENTS: Incident[] = (() => {
  const inOrder: Incident[] = [];
  const seen = new Set<string>();
  for (const id of MISSION_ORDER) {
    const inc = ALL_INCIDENTS.find((i) => i.id === id);
    if (inc) {
      inOrder.push({ ...inc, minLevel: MISSION_LEVEL[id] ?? inc.minLevel });
      seen.add(id);
    }
  }
  // Append any incidents not in order (defensive)
  for (const inc of ALL_INCIDENTS) {
    if (!seen.has(inc.id)) inOrder.push(inc);
  }
  return inOrder;
})();

export function getIncidentById(id: string): Incident | undefined {
  return INCIDENTS.find((i) => i.id === id);
}
