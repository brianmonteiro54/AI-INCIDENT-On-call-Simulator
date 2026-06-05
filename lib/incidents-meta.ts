import type { Severity } from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// LIGHTWEIGHT INCIDENT METADATA (bundle optimization)
//
// The full lib/incidents.ts is ~128 KB of gameplay content (logs, metrics, boss
// phases, root causes, exam notes…). The home/mission-map and the result screen
// only need a handful of light fields per incident to render the list and pick
// the next mission — they do NOT need the heavy content.
//
// Importing the full INCIDENTS into those client components pulled the entire
// dataset into their bundle. This file is the minimal slice they actually use,
// and it deliberately does NOT import lib/incidents.ts, so the heavy data is
// loaded ONLY on the /incident/[id] route that plays a mission.
//
// services holds just the names (shown as chips on the map) — not the full
// {role, description} objects from the gameplay data.
//
// ⚠️  Kept in sync with lib/incidents.ts by test/incidents-meta.test.ts — if you
//     add/rename an incident, change a title/short/services there, that test
//     fails until this list matches.
// ──────────────────────────────────────────────────────────────────────────────

export interface IncidentMeta {
  id: string;
  sev: Severity;
  title: string;
  short: string;
  minLevel: number;
  isBoss: boolean;
  services: { name: string }[];
}

export const INCIDENTS_META: IncidentMeta[] = [
  { id: "polly-mispronounce", sev: 3, title: "Polly da Sorte", short: "Polly pronunciando termos técnicos errado", minLevel: 0, isBoss: false, services: [{ name: "Amazon Polly" }, { name: "Pronunciation Lexicon" }, { name: "SSML" }] },
  { id: "translation-domain", sev: 3, title: "O Lost in Translation", short: "Translate sem custom terminology · gaming", minLevel: 0, isBoss: false, services: [{ name: "Translate" }, { name: "Translate Custom Terminology" }, { name: "Bedrock (LLM)" }] },
  { id: "lex-fallback", sev: 2, title: "Lex Confuso", short: "Lex respondendo 'desculpe não entendi' em 61% dos casos", minLevel: 0, isBoss: false, services: [{ name: "Amazon Lex" }, { name: "Intents & Utterances" }, { name: "Bedrock + Agents" }] },
  { id: "sentiment-flip", sev: 2, title: "Sentimento Trocado", short: "Comprehend retornando NEGATIVE pra reviews 5 estrelas", minLevel: 0, isBoss: false, services: [{ name: "Amazon Comprehend" }, { name: "DetectDominantLanguage" }, { name: "Comprehend Custom" }] },
  { id: "transcribe-medical", sev: 2, title: "O Médico Erra Diagnóstico", short: "Transcribe genérico em contexto médico", minLevel: 0, isBoss: false, services: [{ name: "Transcribe Medical" }, { name: "Custom Vocabulary" }, { name: "Comprehend Medical" }] },
  { id: "personalize-cold", sev: 2, title: "Recomenda o Mesmo", short: "Personalize recomendando os 3 mesmos pra todos", minLevel: 0, isBoss: false, services: [{ name: "Amazon Personalize" }, { name: "User-Personalization recipe" }, { name: "Similar-Items recipe" }] },
  { id: "rekognition-paranoid", sev: 1, title: "Rekognition Paranóico", short: "Rekognition bloqueando fotos normais como NSFW", minLevel: 1, isBoss: false, services: [{ name: "Amazon Rekognition" }, { name: "MinConfidence parameter" }, { name: "Rekognition Custom Labels" }, { name: "Amazon A2I" }] },
  { id: "image-mod-fail", sev: 1, title: "O Moderador Cego", short: "Rekognition moderação labels desconfiguradas", minLevel: 1, isBoss: false, services: [{ name: "Rekognition" }, { name: "Confidence threshold" }, { name: "Step Functions" }] },
  { id: "endpoint-too-expensive", sev: 2, title: "Endpoint Caro Demais", short: "Endpoint Real-time queimando $14k/mês · ocioso 61% do tempo", minLevel: 1, isBoss: false, services: [{ name: "Real-time Inference" }, { name: "Async Inference" }, { name: "Serverless Inference" }, { name: "Batch Transform" }] },
  { id: "wrong-algorithm", sev: 2, title: "Algoritmo Errado", short: "Linear regression em target binário · outputs fora de [0,1]", minLevel: 1, isBoss: false, services: [{ name: "Classificação" }, { name: "Regressão" }, { name: "Logistic Regression" }, { name: "XGBoost" }] },
  { id: "training-eternal", sev: 2, title: "Treinamento Eterno", short: "Training em P4d (A100) caro · existe alternativa nativa AWS", minLevel: 1, isBoss: false, services: [{ name: "EC2 Trainium (Trn)" }, { name: "EC2 Inferentia (Inf)" }, { name: "P4d (NVIDIA A100)" }, { name: "Spot Instances" }] },
  { id: "forecast-metrics-lie", sev: 3, title: "Forecast Mente", short: "Previsão de demanda falha em outliers · MAE engana sem RMSE/R²", minLevel: 2, isBoss: false, services: [{ name: "MAE (Mean Absolute Error)" }, { name: "MSE / RMSE" }, { name: "R² (Coeficiente de Determinação)" }, { name: "SageMaker DeepAR" }] },
  { id: "fraud-99-percent", sev: 1, title: "99% e Quebrando", short: "Modelo com 99% acurácia · empresa perdendo $2M/mês em fraude", minLevel: 2, isBoss: false, services: [{ name: "Accuracy" }, { name: "Precision · Recall · F1" }, { name: "Confusion Matrix" }, { name: "SageMaker Model Monitor" }] },
  { id: "rag-stale", sev: 2, title: "O Manual Desatualizado", short: "Knowledge Base com documento desatualizado", minLevel: 2, isBoss: false, services: [{ name: "Bedrock Knowledge Bases" }, { name: "S3 Event Notifications" }, { name: "CloudWatch Alarms" }] },
  { id: "cost-explosion", sev: 2, title: "O Caro-Pra-Caramba", short: "Custo Bedrock explodiu 9x · loop infinito?", minLevel: 2, isBoss: false, services: [{ name: "Bedrock" }, { name: "Provisioned Throughput" }, { name: "CloudWatch + Cost Anomaly" }] },
  { id: "hallucination", sev: 1, title: "O Alucinador", short: "Bedrock alucinando · resposta médica perigosa", minLevel: 3, isBoss: false, services: [{ name: "Bedrock" }, { name: "Bedrock Guardrails" }, { name: "Comprehend Medical" }] },
  { id: "pii-leak", sev: 1, title: "O Vazamento", short: "PII vazando em respostas do bot · LGPD risk", minLevel: 3, isBoss: false, services: [{ name: "Comprehend" }, { name: "Bedrock Guardrails" }, { name: "Macie" }] },
  { id: "bias", sev: 2, title: "O Viesado", short: "Personalize discriminando por CEP · viés racial", minLevel: 3, isBoss: false, services: [{ name: "SageMaker Clarify" }, { name: "SageMaker Model Monitor" }, { name: "Personalize" }] },
  { id: "the-cascade", sev: 0, title: "🔥 THE CASCADE", short: "BOSS · 3 fases · cascading failure em todo o stack AI", minLevel: 3, isBoss: true, services: [{ name: "Step Functions" }, { name: "Bedrock Provisioned Throughput" }, { name: "SQS + DLQ" }, { name: "CloudWatch + Anomaly Detection" }, { name: "AWS Fault Injection Service" }] },
];
