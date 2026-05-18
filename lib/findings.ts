import type { Finding } from "./types";

export const FINDINGS: Record<string, Finding> = {
  logs: {
    title: "O que os logs revelam",
    body: '<ul><li>A flag <b>guardrail.check</b> tá desabilitada nesse endpoint.</li><li>Tickets de cliente <b>citam recomendações médicas inventadas</b>.</li><li>Versão atual: <code>v2.4.1</code> · <em>removed safety preamble</em>.</li></ul>',
  },
  deploys: {
    title: "Últimos deploys",
    body: '<ul><li><b>v2.4.1</b> (3:02 AM) — alteração do prompt template.</li><li>Diff: tirou o trecho "<em>Never give medical advice. Defer to professionals.</em>".</li><li>PR não foi reviewed por mais ninguém.</li></ul>',
  },
  prompt: {
    title: "Análise do novo prompt",
    body: '<ul><li>Linha 12: "Personalize a resposta citando o nome e <b>dados do cliente</b> pra criar conexão".</li><li>Sem instrução de NÃO citar dados sensíveis.</li><li>Sem chamada a <code>Comprehend.detect_pii_entities</code> antes da resposta sair.</li></ul>',
  },
  leaks: {
    title: "Auditoria de respostas",
    body: '<ul><li>47 sessões nas últimas 2h vazaram CPF.</li><li>3 vazaram dados de cartão.</li><li>Padrão claro: cliente pergunta sobre conta → bot recita os dados.</li></ul>',
  },
  features: {
    title: "Features do modelo",
    body: '<ul><li>Feature <code>neighborhood_cep</code> tem importance score 0.42 (a maior).</li><li>Correlação CEP × raça: 0.78 nesse dataset.</li><li>Sem feature de "renda real" como counter-balance.</li></ul>',
  },
  data: {
    title: "Auditoria de training data",
    body: '<ul><li>87% das amostras "aprovadas" são de CEPs de classe alta.</li><li>Apenas 4% representam bairros periféricos.</li><li><b>Clarify rodaria essa análise em 5min</b> — não foi rodado.</li></ul>',
  },
  recursion: {
    title: "Logs de email",
    body: '<ul><li>Sessão 4471: <b>234 chamadas em 12 minutos</b>.</li><li>Padrão: bot → email → bot → email...</li><li>Sem rate limit. Sem dedup de threads.</li><li>Loop ativo em 1,200 conversas simultâneas.</li></ul>',
  },
  model: {
    title: "Config do modelo",
    body: '<ul><li>Modelo em uso: <code>anthropic.claude-3-opus</code></li><li>Custo: ~$15 por 1M tokens</li><li>Equivalente em Haiku: ~$0.25 por 1M (60x mais barato)</li><li>Caso de uso (FAQ reply) não exige Opus.</li></ul>',
  },
  cron: {
    title: "Jobs de sync",
    body: '<ul><li>Cron <code>kb-sync</code> falhou <b>47 vezes</b> nos últimos 94 dias.</li><li>Último sucesso: 2024-02-12.</li><li>Erro: <code>AccessDenied: s3:GetObject</code> · IAM role perdeu permissão.</li><li><b>Nenhum alerta foi disparado.</b></li></ul>',
  },
  config: {
    title: "Config do Transcribe",
    body: '<ul><li>Variante em uso: <code>transcribe.standard</code> (genérico)</li><li>Idioma: pt-BR · genérico</li><li>Custom Vocabulary: <em>vazio</em></li><li>Existe <code>transcribe.medical</code> · com 3% WER em audio clínico (vs 18% atual).</li></ul>',
  },
  glossary: {
    title: "Glossário do jogo",
    body: '<ul><li>Time de localização preparou glossário com <b>340 termos</b> de gaming.</li><li>"headshot", "crit", "buff", "nerf", "AOE", "tank", "DPS"...</li><li>Glossário tá num Google Sheet. Translate aceita exportação TMX ou CSV.</li></ul>',
  },
  threshold: {
    title: "Config histórica",
    body: "<ul><li><b>2024-01 até 2024-04:</b> threshold = 80%</li><li><b>2024-05 (mudança silenciosa):</b> threshold = 99%</li><li>Sem PR, sem aprovação, sem trail no IaC.</li><li>Quem mudou? Auditoria do CloudTrail aponta um dev que já saiu.</li></ul>",
  },
  pipeline: {
    title: "Pipeline completo",
    body: "<ul><li>Upload → S3 → Lambda → Rekognition → DynamoDB → Feed</li><li>Lambda checa <code>confidence > THRESHOLD</code></li><li>THRESHOLD vem de env var. <b>Não tá em IaC.</b></li><li>Nenhum alerta quando threshold muda.</li></ul>",
  },
};
