// Map each finding key to its AWS service context — for the console mock UI.
// AUDIENCE: AWS AI Practitioner students (beginners). Breadcrumbs use plain language
// instead of technical paths like /aws/lambda/medbot-chat.

export interface ConsoleContext {
  service: string;      // display name
  serviceKey: string;   // for color/icon lookup
  breadcrumb: string[]; // navigation path (plain language)
  region?: string;
  viewType: "logs" | "json" | "table" | "prose" | "code" | "metrics";
}

export const CONSOLE_CONTEXT: Record<string, ConsoleContext> = {
  // Core mission findings
  logs: {
    service: "CloudWatch",
    serviceKey: "cloudwatch",
    breadcrumb: ["Serviços", "CloudWatch", "Logs", "MedBot Chat"],
    region: "us-east-1",
    viewType: "prose",
  },
  deploys: {
    service: "CodeDeploy",
    serviceKey: "codedeploy",
    breadcrumb: ["Serviços", "CodeDeploy", "Aplicações", "MedBot Chat"],
    region: "us-east-1",
    viewType: "prose",
  },
  prompt: {
    service: "Amazon Bedrock",
    serviceKey: "bedrock",
    breadcrumb: ["Serviços", "Bedrock", "Playground", "System Prompt"],
    region: "us-east-1",
    viewType: "prose",
  },
  leaks: {
    service: "Amazon Macie",
    serviceKey: "macie",
    breadcrumb: ["Serviços", "Macie", "Alertas de dados sensíveis"],
    region: "us-east-1",
    viewType: "prose",
  },
  features: {
    service: "SageMaker Feature Store",
    serviceKey: "sagemaker",
    breadcrumb: ["Serviços", "SageMaker", "Feature Store", "Crédito"],
    region: "us-east-1",
    viewType: "prose",
  },
  data: {
    service: "SageMaker Data Wrangler",
    serviceKey: "sagemaker",
    breadcrumb: ["Serviços", "SageMaker", "Data Wrangler", "Dataset de Crédito"],
    region: "us-east-1",
    viewType: "prose",
  },
  recursion: {
    service: "AWS Lambda",
    serviceKey: "lambda",
    breadcrumb: ["Serviços", "Lambda", "Métricas", "Email Handler"],
    region: "us-east-1",
    viewType: "prose",
  },
  model: {
    service: "Amazon Bedrock",
    serviceKey: "bedrock",
    breadcrumb: ["Serviços", "Bedrock", "Uso e Custo"],
    region: "us-east-1",
    viewType: "prose",
  },
  cron: {
    service: "EventBridge",
    serviceKey: "eventbridge",
    breadcrumb: ["Serviços", "EventBridge", "Tarefas Agendadas"],
    region: "us-east-1",
    viewType: "prose",
  },
  config: {
    service: "Amazon Transcribe",
    serviceKey: "transcribe",
    breadcrumb: ["Serviços", "Transcribe", "Configuração do Job"],
    region: "us-east-1",
    viewType: "prose",
  },
  glossary: {
    service: "Amazon Translate",
    serviceKey: "translate",
    breadcrumb: ["Serviços", "Translate", "Custom Terminology"],
    region: "us-east-1",
    viewType: "prose",
  },
  threshold: {
    service: "Amazon Rekognition",
    serviceKey: "rekognition",
    breadcrumb: ["Serviços", "Rekognition", "Moderação", "Histórico"],
    region: "us-east-1",
    viewType: "prose",
  },
  pipeline: {
    service: "AWS Glue",
    serviceKey: "glue",
    breadcrumb: ["Serviços", "Glue", "Pipeline de Imagens"],
    region: "us-east-1",
    viewType: "prose",
  },

  // Light-mission findings
  sentiment: {
    service: "Amazon Comprehend",
    serviceKey: "comprehend",
    breadcrumb: ["Serviços", "Comprehend", "Análise de Sentimento"],
    region: "us-east-1",
    viewType: "prose",
  },
  polly: {
    service: "Amazon Polly",
    serviceKey: "polly",
    breadcrumb: ["Serviços", "Polly", "Vozes e Lexicons"],
    region: "us-east-1",
    viewType: "prose",
  },
  personalize: {
    service: "Amazon Personalize",
    serviceKey: "personalize",
    breadcrumb: ["Serviços", "Personalize", "Configuração do Modelo"],
    region: "us-east-1",
    viewType: "prose",
  },
  lex: {
    service: "Amazon Lex",
    serviceKey: "lex",
    breadcrumb: ["Serviços", "Lex", "Bot de Atendimento"],
    region: "us-east-1",
    viewType: "prose",
  },
  rek_moderation: {
    service: "Amazon Rekognition",
    serviceKey: "rekognition",
    breadcrumb: ["Serviços", "Rekognition", "Moderação de Conteúdo"],
    region: "us-east-1",
    viewType: "prose",
  },

  // Concept-focused findings
  fraud_metrics: {
    service: "SageMaker Model Monitor",
    serviceKey: "sagemaker",
    breadcrumb: ["Serviços", "SageMaker", "Model Monitor", "Detector de Fraude"],
    region: "us-east-1",
    viewType: "prose",
  },
  class_balance: {
    service: "SageMaker Data Wrangler",
    serviceKey: "sagemaker",
    breadcrumb: ["Serviços", "SageMaker", "Data Wrangler", "Dataset"],
    region: "us-east-1",
    viewType: "prose",
  },
  endpoint_traffic: {
    service: "CloudWatch",
    serviceKey: "cloudwatch",
    breadcrumb: ["Serviços", "CloudWatch", "Métricas do Endpoint"],
    region: "us-east-1",
    viewType: "prose",
  },
  endpoint_cost: {
    service: "AWS Cost Explorer",
    serviceKey: "billing",
    breadcrumb: ["Serviços", "Cost Explorer", "Gastos com SageMaker"],
    region: "global",
    viewType: "prose",
  },
  regression_eval: {
    service: "SageMaker Studio",
    serviceKey: "sagemaker",
    breadcrumb: ["Serviços", "SageMaker", "Studio", "Avaliação do Modelo"],
    region: "us-east-1",
    viewType: "prose",
  },
  model_output: {
    service: "SageMaker Canvas",
    serviceKey: "sagemaker",
    breadcrumb: ["Serviços", "SageMaker", "Canvas", "Modelo de Churn"],
    region: "us-east-1",
    viewType: "prose",
  },
  training_cost: {
    service: "SageMaker Training",
    serviceKey: "sagemaker",
    breadcrumb: ["Serviços", "SageMaker", "Treinamento", "LLM Fine-tuning"],
    region: "us-east-1",
    viewType: "prose",
  },
};

// Service icons + colors for the console header
export const SERVICE_THEMES: Record<string, { color: string; bg: string; icon: string }> = {
  cloudwatch: { color: "text-pink-400", bg: "bg-pink-500/20", icon: "📊" },
  codedeploy: { color: "text-green-400", bg: "bg-green-500/20", icon: "🚀" },
  bedrock: { color: "text-purple-400", bg: "bg-purple-500/20", icon: "🤖" },
  macie: { color: "text-blue-400", bg: "bg-blue-500/20", icon: "🛡️" },
  sagemaker: { color: "text-cyan-400", bg: "bg-cyan-500/20", icon: "🧠" },
  lambda: { color: "text-orange-400", bg: "bg-orange-500/20", icon: "λ" },
  eventbridge: { color: "text-pink-400", bg: "bg-pink-500/20", icon: "⚡" },
  transcribe: { color: "text-blue-400", bg: "bg-blue-500/20", icon: "🎙️" },
  translate: { color: "text-violet-400", bg: "bg-violet-500/20", icon: "🌐" },
  rekognition: { color: "text-emerald-400", bg: "bg-emerald-500/20", icon: "👁️" },
  glue: { color: "text-purple-400", bg: "bg-purple-500/20", icon: "🔗" },
  iam: { color: "text-red-400", bg: "bg-red-500/20", icon: "🔐" },
  comprehend: { color: "text-yellow-400", bg: "bg-yellow-500/20", icon: "📝" },
  polly: { color: "text-pink-400", bg: "bg-pink-500/20", icon: "🔊" },
  personalize: { color: "text-rose-400", bg: "bg-rose-500/20", icon: "🎁" },
  lex: { color: "text-amber-400", bg: "bg-amber-500/20", icon: "💬" },
  billing: { color: "text-green-400", bg: "bg-green-500/20", icon: "💵" },
  default: { color: "text-orange-400", bg: "bg-orange-500/20", icon: "☁️" },
};
