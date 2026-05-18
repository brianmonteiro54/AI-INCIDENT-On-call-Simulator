// Map each finding key to its AWS service context — for the console mock UI
// This teaches users WHERE in AWS each piece of evidence would actually live.

export interface ConsoleContext {
  service: string;      // display name
  serviceKey: string;   // for color/icon lookup
  breadcrumb: string[]; // navigation path
  region?: string;
  viewType: "logs" | "json" | "table" | "prose" | "code" | "metrics";
}

export const CONSOLE_CONTEXT: Record<string, ConsoleContext> = {
  logs: {
    service: "CloudWatch",
    serviceKey: "cloudwatch",
    breadcrumb: ["Services", "CloudWatch", "Log groups", "/aws/lambda/medbot-chat"],
    region: "us-east-1",
    viewType: "logs",
  },
  deploys: {
    service: "CodeDeploy",
    serviceKey: "codedeploy",
    breadcrumb: ["Services", "CodeDeploy", "Applications", "medbot-chat", "Deployments"],
    region: "us-east-1",
    viewType: "table",
  },
  prompt: {
    service: "Amazon Bedrock",
    serviceKey: "bedrock",
    breadcrumb: ["Services", "Amazon Bedrock", "Playgrounds", "Chat", "System prompt"],
    region: "us-east-1",
    viewType: "code",
  },
  leaks: {
    service: "Amazon Macie",
    serviceKey: "macie",
    breadcrumb: ["Services", "Amazon Macie", "Findings", "SensitiveData:S3Object/Personal"],
    region: "us-east-1",
    viewType: "prose",
  },
  features: {
    service: "SageMaker",
    serviceKey: "sagemaker",
    breadcrumb: ["Services", "Amazon SageMaker", "Feature Store", "Feature groups", "applicant-features"],
    region: "us-east-1",
    viewType: "table",
  },
  data: {
    service: "SageMaker",
    serviceKey: "sagemaker",
    breadcrumb: ["Services", "Amazon SageMaker", "Data Wrangler", "Datasets", "training-data-v3"],
    region: "us-east-1",
    viewType: "prose",
  },
  recursion: {
    service: "AWS Lambda",
    serviceKey: "lambda",
    breadcrumb: ["Services", "Lambda", "Functions", "embed-doc-handler", "Monitor"],
    region: "us-east-1",
    viewType: "metrics",
  },
  model: {
    service: "Amazon Bedrock",
    serviceKey: "bedrock",
    breadcrumb: ["Services", "Amazon Bedrock", "Foundation models", "Cost Explorer"],
    region: "us-east-1",
    viewType: "metrics",
  },
  cron: {
    service: "EventBridge",
    serviceKey: "eventbridge",
    breadcrumb: ["Services", "Amazon EventBridge", "Rules", "rag-reindex-schedule"],
    region: "us-east-1",
    viewType: "prose",
  },
  config: {
    service: "AWS Transcribe",
    serviceKey: "transcribe",
    breadcrumb: ["Services", "Amazon Transcribe Medical", "Configuration", "medical-vocabulary"],
    region: "us-east-1",
    viewType: "json",
  },
  glossary: {
    service: "Amazon Translate",
    serviceKey: "translate",
    breadcrumb: ["Services", "Amazon Translate", "Custom terminology", "legal-pt-br"],
    region: "us-east-1",
    viewType: "table",
  },
  threshold: {
    service: "Amazon Rekognition",
    serviceKey: "rekognition",
    breadcrumb: ["Services", "Amazon Rekognition", "Content moderation", "Confidence thresholds"],
    region: "us-east-1",
    viewType: "code",
  },
  pipeline: {
    service: "AWS Glue",
    serviceKey: "glue",
    breadcrumb: ["Services", "AWS Glue", "ETL jobs", "feature-pipeline-prod", "Run details"],
    region: "us-east-1",
    viewType: "metrics",
  },
  sentiment: {
    service: "Amazon Comprehend",
    serviceKey: "comprehend",
    breadcrumb: ["Services", "Amazon Comprehend", "Real-time analysis", "DetectSentiment"],
    region: "us-east-1",
    viewType: "code",
  },
  polly: {
    service: "Amazon Polly",
    serviceKey: "polly",
    breadcrumb: ["Services", "Amazon Polly", "Lexicons", "audiobook-tts"],
    region: "us-east-1",
    viewType: "prose",
  },
  personalize: {
    service: "Amazon Personalize",
    serviceKey: "personalize",
    breadcrumb: ["Services", "Amazon Personalize", "Dataset groups", "shop-recsys-prod", "Solutions"],
    region: "us-east-1",
    viewType: "code",
  },
  lex: {
    service: "Amazon Lex",
    serviceKey: "lex",
    breadcrumb: ["Services", "Amazon Lex", "Bots", "telecom-support-bot", "Analytics"],
    region: "us-east-1",
    viewType: "metrics",
  },
  rek_moderation: {
    service: "Amazon Rekognition",
    serviceKey: "rekognition",
    breadcrumb: ["Services", "Amazon Rekognition", "Content moderation", "DetectModerationLabels"],
    region: "us-east-1",
    viewType: "code",
  },
  fraud_metrics: {
    service: "SageMaker Model Monitor",
    serviceKey: "sagemaker",
    breadcrumb: ["Services", "Amazon SageMaker", "Model Monitor", "fraud-detector-v3", "Model Quality"],
    region: "us-east-1",
    viewType: "metrics",
  },
  class_balance: {
    service: "SageMaker Data Wrangler",
    serviceKey: "sagemaker",
    breadcrumb: ["Services", "Amazon SageMaker", "Data Wrangler", "Datasets", "transactions-train"],
    region: "us-east-1",
    viewType: "prose",
  },
  endpoint_traffic: {
    service: "CloudWatch",
    serviceKey: "cloudwatch",
    breadcrumb: ["Services", "CloudWatch", "Metrics", "AWS/SageMaker", "xray-classifier-prod"],
    region: "us-east-1",
    viewType: "metrics",
  },
  endpoint_cost: {
    service: "AWS Cost Explorer",
    serviceKey: "billing",
    breadcrumb: ["Services", "AWS Cost Explorer", "Reports", "SageMaker · last 30 days"],
    region: "global",
    viewType: "table",
  },
  regression_eval: {
    service: "SageMaker Studio",
    serviceKey: "sagemaker",
    breadcrumb: ["Services", "Amazon SageMaker", "Studio", "Training jobs", "demand-forecast"],
    region: "us-east-1",
    viewType: "metrics",
  },
  model_output: {
    service: "SageMaker Studio",
    serviceKey: "sagemaker",
    breadcrumb: ["Services", "Amazon SageMaker", "Studio", "Notebooks", "churn-model-v1.ipynb"],
    region: "us-east-1",
    viewType: "code",
  },
  training_cost: {
    service: "SageMaker Training",
    serviceKey: "sagemaker",
    breadcrumb: ["Services", "Amazon SageMaker", "Training", "Jobs", "llm-finetune-v2"],
    region: "us-east-1",
    viewType: "table",
  },
};

// Service icons/colors for the console header
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
