import type { Finding } from "./types";

// Each finding is rendered inside a ConsoleFrame (CloudWatch, Bedrock, Macie, etc).
// The body should READ LIKE actual console output — log lines, JSON, metric tables.
// NO editorial commentary like "X would have caught this — it wasn't run".

export const FINDINGS: Record<string, Finding> = {
  // CloudWatch Logs · /aws/lambda/medbot-chat
  logs: {
    title: "CloudWatch Logs · medbot-chat",
    body: `<p>2024-11-04T03:14:22.488Z <b>INFO</b> requestId=8f3a-4c1e session=4471 model=anthropic.claude-3-opus-20240229
<br/>responseGenerated=true guardrail.check=<code>disabled</code> pii.scan=<code>false</code> tokens.out=287
<br/>2024-11-04T03:15:01.234Z <b>WARN</b> requestId=2bc1-9d2a session=4488 model=anthropic.claude-3-opus-20240229
<br/>customer.complaint detected · keyword="dosagem errada"
<br/>2024-11-04T03:15:18.667Z <b>WARN</b> requestId=4f7e-3a1c session=4502
<br/>customer.complaint detected · keyword="legal foi acionado"</p>
<p>Filter metric <code>guardrail.disabled.count</code> · last 2h: <b>2,318</b>
<br/>Filter metric <code>customer.complaint</code> · last 2h: <b>47</b>
<br/>Active deployment: <code>medbot-chat:v2.4.1</code> · published 2024-11-04T03:02:14Z</p>`,
  },

  // CodeDeploy · Deployments
  deploys: {
    title: "CodeDeploy · Deployments",
    body: `<p>Application: <code>medbot-chat-prod</code> · DeploymentGroup: <code>chat-fleet</code></p>
<ul>
<li><b>d-AAB923X1</b> · v2.4.1 · 2024-11-04 03:02:14 UTC · Succeeded · Created by IAM user <code>marco@</code></li>
<li>d-AAB890X9 · v2.4.0 · 2024-10-28 14:30 UTC · Succeeded · Created by <code>marco@</code></li>
<li>d-AAB823X4 · v2.3.9 · 2024-10-21 11:15 UTC · Succeeded · Created by <code>ana@</code></li>
</ul>
<p>Revision <code>v2.4.1</code> · S3 bundle: <code>s3://deploys/medbot/v2.4.1.zip</code></p>
<p>Diff <code>prompts/system.txt</code> (v2.4.0 → v2.4.1):</p>
<p>− "Never give medical advice. Always defer to licensed professionals."
<br/>+ "Be helpful and personalize. Use customer data freely to build rapport."</p>
<p>− "Redact PII before responding."
<br/>(no replacement)</p>`,
  },

  // Bedrock Playground · System prompt
  prompt: {
    title: "Bedrock · System Prompt",
    body: `<p>// model: anthropic.claude-3-opus-20240229
<br/>// loaded from: s3://medbot-prompts/system.txt
<br/>// version: v2.4.1</p>
<p>You are a helpful medical assistant for Helix Labs.</p>
<p>Be helpful and personalize the conversation. Use the customer's <b>full name</b>, <b>CPF</b>, <b>date of birth</b> and <b>medical history</b> from the context block to build rapport.</p>
<p>Always respond in PT-BR. Be warm and direct.</p>
<p>// Customer context block (lines 14-21):
<br/>{{customer.fullName}}, {{customer.cpf}}, {{customer.dob}},
<br/>{{customer.allergies}}, {{customer.medications}}, {{customer.diagnoses}},
<br/>{{customer.cardLast4}}, {{customer.address}}</p>
<p>// Guardrail policy attached: <b>none</b>
<br/>// PII redaction step: <b>not configured</b></p>`,
  },

  // Amazon Macie · Findings
  leaks: {
    title: "Macie · Sensitive Data Findings",
    body: `<p>S3 bucket scanned: <code>s3://medbot-chat-logs-prod/responses/2024-11-04/</code></p>
<ul>
<li><b>SensitiveData:S3Object/Personal</b> · severity HIGH · type <code>BRAZIL_CPF</code> · occurrences: <b>47</b></li>
<li><b>SensitiveData:S3Object/Financial</b> · severity HIGH · type <code>CREDIT_CARD_NUMBER</code> · occurrences: 3</li>
<li>SensitiveData:S3Object/Personal · severity MEDIUM · type <code>BRAZIL_RG</code> · occurrences: 124</li>
<li>SensitiveData:S3Object/Personal · severity MEDIUM · type <code>NAME</code> · occurrences: 1,047</li>
</ul>
<p>Sample match (object <code>responses/2024-11-04/8f3a-4c1e.json</code>):</p>
<p><code>{"role":"assistant","content":"Olá Maria! Seu CPF 123.456.789-00 confere..."}</code></p>`,
  },

  // SageMaker Feature Store
  features: {
    title: "Feature Store · applicant-features-v3",
    body: `<p>Feature group: <code>applicant-features-v3</code> · records: 2,847,331 · last_updated: 2024-11-03</p>
<p><b>Feature importance (from latest training run · XGBoost):</b></p>
<ul>
<li><code>neighborhood_cep</code> · gain: <b>0.42</b></li>
<li><code>education_level</code> · gain: 0.18</li>
<li><code>employment_years</code> · gain: 0.14</li>
<li><code>account_age_months</code> · gain: 0.09</li>
<li><code>declared_income</code> · gain: 0.07</li>
<li><code>num_dependents</code> · gain: 0.03</li>
</ul>
<p><b>Feature correlation matrix (top pairs):</b></p>
<ul>
<li>corr(<code>neighborhood_cep</code>, <code>race</code>) = <b>0.78</b></li>
<li>corr(<code>neighborhood_cep</code>, <code>declared_income</code>) = 0.31</li>
<li>corr(<code>neighborhood_cep</code>, <code>approved</code>) = 0.61</li>
</ul>`,
  },

  // SageMaker Data Wrangler · Dataset analysis
  data: {
    title: "Data Wrangler · training-data-v3",
    body: `<p>Dataset: <code>s3://applicant-training/v3/</code> · rows: 480,219 · target: <code>approved</code></p>
<p><b>Distribution of <code>approved=1</code> samples by CEP region:</b></p>
<ul>
<li>CEPs 01000-05999 (Centro / Zona Sul SP): <b>87.4%</b></li>
<li>CEPs 03000-08000 (Zona Leste / Norte SP): 4.1%</li>
<li>Outras regiões metropolitanas: 8.5%</li>
</ul>
<p><b>IBGE population benchmark · São Paulo metro:</b></p>
<ul>
<li>Centro / Zona Sul: ~40%</li>
<li>Zona Leste / Norte: ~45%</li>
<li>Outras: ~15%</li>
</ul>
<p>Class balance: <code>approved=1</code> in 31.2% of rows · <code>approved=0</code> in 68.8%</p>
<p>Missing values: <code>declared_income</code> 41.2% · <code>employment_years</code> 18.7%</p>`,
  },

  // Lambda · Monitor
  recursion: {
    title: "Lambda · embed-doc-handler",
    body: `<p>Function: <code>embed-doc-handler</code> · runtime: nodejs20.x · memory: 512 MB</p>
<p>Trigger: SES <code>bounce/complaint</code> event → SNS → Lambda</p>
<p><b>Invocations · last 12 min · top sessions:</b></p>
<ul>
<li>session=4471 · invocations: <b>234</b> · errors: 0</li>
<li>session=4502 · invocations: 198 · errors: 0</li>
<li>session=4519 · invocations: 187 · errors: 0</li>
<li>active sessions with &gt;50 invocations: <b>1,247</b></li>
</ul>
<p><b>Sample trace · session 4471:</b></p>
<p>03:12:14 → handler invoked · event=ses.bounce subject="Re: support ticket"
<br/>03:12:16 → ses.SendEmail() · to="customer@..."
<br/>03:12:17 → ses.bounce event → handler invoked
<br/>03:12:19 → ses.SendEmail() · to="customer@..."
<br/>03:12:20 → ses.bounce event → handler invoked</p>
<p>Reserved concurrency: <code>(none)</code> · DLQ: <code>(none)</code></p>`,
  },

  // Bedrock · Foundation Model Usage
  model: {
    title: "Bedrock · Model Usage",
    body: `<p>Region: us-east-1 · Aggregation: last 7 days</p>
<p><b>Invocations by application:</b></p>
<ul>
<li>app=<code>faq-reply-bot</code> · model=anthropic.claude-3-opus · tokens/day: 4,180,000 · cost/day: <b>$62.70</b></li>
<li>app=<code>summarization-batch</code> · model=anthropic.claude-3-opus · tokens/day: 1,100,000 · cost/day: $16.50</li>
<li>app=<code>customer-classifier</code> · model=anthropic.claude-3-opus · tokens/day: 380,000 · cost/day: $5.70</li>
</ul>
<p><b>Pricing reference</b> (per 1M input tokens, on-demand):</p>
<ul>
<li>anthropic.claude-3-opus: <b>$15.00</b></li>
<li>anthropic.claude-3-sonnet: $3.00</li>
<li>anthropic.claude-3-haiku: <b>$0.25</b></li>
</ul>
<p>Sample app=<code>faq-reply-bot</code> invocation · avg input: 320 tokens · avg output: 180 tokens · task: factual Q&A from FAQ.</p>`,
  },

  // EventBridge · Rules
  cron: {
    title: "EventBridge · rag-reindex-schedule",
    body: `<p>Rule: <code>rag-reindex-schedule</code> · schedule: <code>rate(7 days)</code> · target: Lambda <code>kb-sync</code></p>
<p><b>Execution history · last 94 days:</b></p>
<ul>
<li>SUCCESS: 0</li>
<li>FAILED: <b>13</b> (last success: 2024-08-02)</li>
</ul>
<p><b>Latest target invocation · Lambda kb-sync:</b></p>
<p>2024-11-03T02:00:01.122Z <b>ERROR</b> S3.GetObject failed
<br/>AccessDenied: User: <code>arn:aws:sts::***:assumed-role/kb-sync-role/kb-sync</code>
<br/>is not authorized to perform: <code>s3:GetObject</code> on resource:
<br/>"arn:aws:s3:::policies-docs-prod/*"
<br/>because no identity-based policy allows the s3:GetObject action</p>
<p>CloudWatch alarms targeting this rule: <code>(none)</code></p>`,
  },

  // Transcribe Medical · Job config
  config: {
    title: "Transcribe · Job Configuration",
    body: `<p>{
<br/>&nbsp;&nbsp;"TranscriptionJobName": "audio-consult-batch-2024-11-04",
<br/>&nbsp;&nbsp;"<b>LanguageCode</b>": "pt-BR",
<br/>&nbsp;&nbsp;"<b>Specialty</b>": null,
<br/>&nbsp;&nbsp;"<b>Type</b>": "<b>STANDARD</b>",
<br/>&nbsp;&nbsp;"Media": { "MediaFileUri": "s3://consultations-raw/" },
<br/>&nbsp;&nbsp;"Settings": {
<br/>&nbsp;&nbsp;&nbsp;&nbsp;"<b>VocabularyName</b>": null,
<br/>&nbsp;&nbsp;&nbsp;&nbsp;"ShowSpeakerLabels": true,
<br/>&nbsp;&nbsp;&nbsp;&nbsp;"MaxSpeakerLabels": 2
<br/>&nbsp;&nbsp;}
<br/>}</p>
<p><b>Word Error Rate · last 200 jobs:</b></p>
<ul>
<li>Current config: <b>18.4%</b> WER</li>
<li>AWS published WER for <code>Transcribe Medical</code> with <code>Specialty: PRIMARYCARE</code>: ~3.1% on clinical audio</li>
</ul>
<p>Available service in region: <code>Amazon Transcribe Medical</code> · pricing: $0.0125/min</p>`,
  },

  // Translate · Custom Terminology
  glossary: {
    title: "Translate · Custom Terminology",
    body: `<p>Project: <code>game-localization-pt-br</code> · source: en · target: pt-br</p>
<p><b>Active custom terminology files:</b> (none)</p>
<p><b>Files available in S3 (not loaded into Translate):</b></p>
<ul>
<li><code>s3://localization-assets/glossaries/gaming-pt-br.csv</code> · entries: 340 · format: CSV · last_modified: 2024-09-30</li>
</ul>
<p><b>Sample translations · last 24h:</b></p>
<ul>
<li>"headshot" → "tiro na cabeça"</li>
<li>"crit" → "crítica"</li>
<li>"AOE damage" → "dano de era"</li>
<li>"DPS" → "departamento de polícia"</li>
<li>"buff" → "amortecedor"</li>
<li>"nerf" → "pistola de espuma"</li>
</ul>`,
  },

  // Rekognition · Content Moderation thresholds
  threshold: {
    title: "Rekognition · Moderation Config",
    body: `<p>API: <code>DetectModerationLabels</code> · client: Lambda <code>photo-moderator</code></p>
<p><b>CloudTrail event history · parameter <code>MinConfidence</code>:</b></p>
<ul>
<li>2024-01-15T10:22:11Z · MinConfidence=<b>80</b> · sourceIPAddress=<code>github-actions</code> · via Terraform PR #421</li>
<li>2024-05-22T16:48:33Z · MinConfidence=<b>99</b> · sourceIPAddress=<code>console.aws.amazon.com</code> · userIdentity=<code>arn:aws:iam::***:user/dev-12</code></li>
</ul>
<p><b>Detection stats · last 24h:</b></p>
<ul>
<li>Images processed: 142,883</li>
<li>Flagged (confidence ≥ 99): 12,107 (8.5%)</li>
<li>Bypassed (80 ≤ confidence &lt; 99): <b>14,221 (10.0%)</b></li>
</ul>
<p>IAM user <code>dev-12</code>: <code>inactive</code> (deactivated 2024-07-10)</p>`,
  },

  // AWS Glue · ETL Pipeline
  pipeline: {
    title: "Glue · feature-pipeline-prod",
    body: `<p>Job: <code>feature-pipeline-prod</code> · type: Spark · DPUs: 10</p>
<p><b>DAG:</b> S3:photos-raw → Glue ETL → Rekognition → DynamoDB → Personalize feed</p>
<p>Step <code>moderation_filter</code> reads <code>THRESHOLD</code> from Lambda env var (default: 70)</p>
<p><b>Drift check · Terraform state vs live config:</b></p>
<ul>
<li>Lambda <code>photo-moderator</code> · runtime: declared ✓ · env vars: <b>not in state (drift)</b></li>
<li>Step <code>moderation_filter</code> threshold managed via: <b>AWS Console only</b></li>
<li>CloudWatch alarm on env-var changes: <code>(none)</code></li>
</ul>
<p><b>Last 24h step <code>moderation_filter</code> output:</b></p>
<ul>
<li>Items processed: 142,883</li>
<li>Items written to DynamoDB: 130,776 (91.5%)</li>
<li>Items dropped (below threshold): 12,107</li>
</ul>`,
  },

  // ───── NEW LIGHT-MISSION FINDINGS ─────

  // Comprehend · Sentiment analysis
  sentiment: {
    title: "Comprehend · Sentiment Analysis",
    body: `<p>API: <code>DetectSentiment</code> · client: Lambda <code>review-classifier</code></p>
<p><b>Recent invocations (last 50):</b></p>
<p>{
<br/>&nbsp;&nbsp;"Text": "Amei o produto, chegou rápido, recomendo demais!",
<br/>&nbsp;&nbsp;"<b>LanguageCode</b>": "<b>en</b>",
<br/>&nbsp;&nbsp;"Sentiment": "<b>NEGATIVE</b>",
<br/>&nbsp;&nbsp;"SentimentScore": {"Positive": 0.04, "Negative": 0.78, "Neutral": 0.12, "Mixed": 0.06}
<br/>}</p>
<p>{
<br/>&nbsp;&nbsp;"Text": "Produto chegou quebrado, péssima experiência",
<br/>&nbsp;&nbsp;"LanguageCode": "en",
<br/>&nbsp;&nbsp;"Sentiment": "<b>POSITIVE</b>",
<br/>&nbsp;&nbsp;"SentimentScore": {"Positive": 0.61, "Negative": 0.18, "Neutral": 0.16, "Mixed": 0.05}
<br/>}</p>
<p><b>Language distribution</b> (DetectDominantLanguage on same texts):</p>
<ul>
<li>pt: 96.3%</li>
<li>en: 2.1%</li>
<li>es: 1.6%</li>
</ul>
<p>Supported sentiment languages: en, es, fr, de, it, pt, ar, hi, ja, ko, zh, zh-TW</p>`,
  },

  // Polly · Lexicons
  polly: {
    title: "Polly · Voices & Lexicons",
    body: `<p>Active voice: <code>Camila</code> (pt-BR, Neural) · client: Lambda <code>audiobook-tts</code></p>
<p><b>Recent SynthesizeSpeech requests · sample input:</b></p>
<p>"Kubernetes orquestra containers Docker em produção, e PyTorch domina deep learning."</p>
<p><b>Phoneme output</b> (decoded SSML trace):</p>
<ul>
<li>"Kubernetes" → /ku.beɾ.ne.tʃis/ (read as Portuguese letters)</li>
<li>"Docker" → /do.keɾ/</li>
<li>"PyTorch" → /pi.toɾ.tʃi/</li>
</ul>
<p><b>Lexicons attached to this request:</b> (none)</p>
<p><b>Lexicons available in account:</b></p>
<ul>
<li><code>tech-terms-en-words</code> · 47 entries (Kubernetes, Docker, PyTorch, GraphQL, ...) · last_used: never</li>
</ul>
<p>SSML input contains no <code>&lt;phoneme&gt;</code>, <code>&lt;say-as&gt;</code>, or <code>&lt;sub&gt;</code> tags.</p>`,
  },

  // Personalize · Recipe
  personalize: {
    title: "Personalize · Solution Config",
    body: `<p>Dataset group: <code>shop-recsys-prod</code> · solutions: 1</p>
<p>{
<br/>&nbsp;&nbsp;"solutionName": "shop-recs-v1",
<br/>&nbsp;&nbsp;"<b>recipeArn</b>": "arn:aws:personalize:::recipe/<b>aws-hrnn</b>",
<br/>&nbsp;&nbsp;"performAutoML": false,
<br/>&nbsp;&nbsp;"eventValueThreshold": 0.0,
<br/>&nbsp;&nbsp;"<b>solutionVersionStatus</b>": "ACTIVE"
<br/>}</p>
<p><b>Dataset stats:</b></p>
<ul>
<li>Interactions: 18,422,917 · unique users: 2,847,109</li>
<li>Users with &lt; 3 interactions (cold-start): <b>61.4%</b></li>
<li>Items: 84,201</li>
</ul>
<p><b>GetRecommendations · sample response for new user:</b></p>
<p>itemList: [item_881, item_42, item_1207, item_881, item_42, item_1207, ...]</p>
<p>Top-3 items returned to 87% of new-user requests · same 3 across 24h.</p>
<p><b>Available recipes</b> (not in use):</p>
<ul>
<li><code>aws-user-personalization</code> · supports cold-start, exploration</li>
<li><code>aws-similar-items</code> · item-to-item similarity</li>
</ul>`,
  },

  // Lex · Intent stats
  lex: {
    title: "Lex · Intent Recognition",
    body: `<p>Bot: <code>telecom-support-bot</code> · alias: <code>prod</code> · locale: pt_BR</p>
<p><b>Intent invocations · last 24h:</b></p>
<ul>
<li><code>CheckBalance</code> · matched: 1,204 · confidence avg: 0.87</li>
<li><code>OpenTicket</code> · matched: 882 · confidence avg: 0.79</li>
<li><code>ChangePlan</code> · matched: 311 · confidence avg: 0.71</li>
<li><b>FallbackIntent</b> · matched: <b>4,907 (61%)</b></li>
</ul>
<p><b>Intent <code>OpenTicket</code> · sample utterances configured:</b></p>
<ul>
<li>"abrir ticket"</li>
<li>"quero abrir um chamado"</li>
</ul>
<p><b>Recent unmatched user inputs (fell to fallback):</b></p>
<ul>
<li>"tô com problema"</li>
<li>"meu sinal sumiu"</li>
<li>"preciso de ajuda urgente"</li>
<li>"reclamação"</li>
<li>"a internet caiu"</li>
</ul>
<p>Confidence score threshold: 0.40 (default)</p>`,
  },

  // Rekognition · DetectModerationLabels output
  rek_moderation: {
    title: "Rekognition · Moderation Output",
    body: `<p>API: <code>DetectModerationLabels</code> · client: Lambda <code>photo-uploader</code></p>
<p><b>Current config:</b> MinConfidence=<code>30</code></p>
<p><b>Recent invocations · sample outputs:</b></p>
<p>image=beach-sunset.jpg · ModerationLabels:
<br/>&nbsp;&nbsp;[{"Name": "Suggestive", "Confidence": <b>34.2</b>, "ParentName": ""}]</p>
<p>image=family-bbq.jpg · ModerationLabels:
<br/>&nbsp;&nbsp;[{"Name": "Alcohol", "Confidence": <b>41.7</b>, "ParentName": "Drugs"}]</p>
<p>image=baby-photo.jpg · ModerationLabels:
<br/>&nbsp;&nbsp;[{"Name": "Suggestive", "Confidence": <b>32.9</b>, "ParentName": ""}]</p>
<p><b>Aggregate · last 24h:</b></p>
<ul>
<li>Images processed: 38,201</li>
<li>Flagged (label confidence ≥ 30): <b>30,562 (80%)</b></li>
<li>Confidence distribution: 30-50: 71%, 50-80: 7%, 80+: 2%</li>
</ul>
<p>AWS documentation recommendation for <code>MinConfidence</code>: <b>80</b> for high-precision filtering, never below 50 for production.</p>`,
  },

  // ───── CONCEPT-FOCUSED FINDINGS ─────

  // SageMaker Model Monitor · Classification metrics
  fraud_metrics: {
    title: "Model Monitor · fraud-detector-v3",
    body: `<p>Endpoint: <code>fraud-detector-v3</code> · monitor: model-quality-monitor</p>
<p><b>Reported metrics · last 30 days (test set: 100,000 transactions):</b></p>
<ul>
<li>Accuracy: <b>99.40%</b></li>
<li>Precision (class=fraud): <b>83.3%</b></li>
<li>Recall (class=fraud): <b>5.0%</b></li>
<li>F1 (class=fraud): <b>0.094</b></li>
<li>AUC: 0.61</li>
</ul>
<p><b>Confusion matrix:</b></p>
<p><code>
<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Predicted
<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Legit&nbsp;&nbsp;Fraud
<br/>Actual&nbsp;Legit&nbsp;&nbsp;98,990&nbsp;&nbsp;10
<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Fraud&nbsp;&nbsp;950&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;50
</code></p>
<p>True Positive: 50 · True Negative: 98,990 · False Positive: 10 · False Negative: <b>950</b></p>`,
  },

  // SageMaker Data Wrangler · class distribution
  class_balance: {
    title: "Data Wrangler · transactions-train",
    body: `<p>Dataset: <code>s3://bancoquanta-ml/transactions-train.parquet</code> · linhas: 4,200,000</p>
<p><b>Distribuição da variável-alvo <code>is_fraud</code>:</b></p>
<ul>
<li><code>is_fraud = 0</code> (legítima): <b>4,158,000 (99.0%)</b></li>
<li><code>is_fraud = 1</code> (fraude): <b>42,000 (1.0%)</b></li>
</ul>
<p><b>Razão de desbalanceamento:</b> 99 para 1</p>
<p><b>Configuração do Training Job:</b></p>
<ul>
<li>Algoritmo: <b>XGBoost</b> (SageMaker built-in)</li>
<li>Modo: classificação binária</li>
<li>Métrica de avaliação configurada: <b>accuracy</b></li>
<li>Ajuste de peso de classe (scale_pos_weight): <b>não configurado</b></li>
<li>Estratégia de oversampling/SMOTE: <b>não configurada</b></li>
</ul>
<p><b>Impacto operacional · últimos 30 dias:</b></p>
<ul>
<li>Perdas por fraude (predito legítimo, era fraude): <b>$2,140,000</b></li>
<li>Atrito com cliente (predito fraude, era legítimo): $1,200</li>
</ul>`,
  },

  // CloudWatch metrics · endpoint traffic pattern
  endpoint_traffic: {
    title: "CloudWatch · xray-classifier endpoint",
    body: `<p>Endpoint: <code>xray-classifier-prod</code> · type: <b>Real-time</b> · instance: <b>ml.g4dn.xlarge</b> · count: 2</p>
<p><b>Invocations · last 7 days · hourly:</b></p>
<ul>
<li>00:00-07:00 UTC: avg <b>3 req/min</b></li>
<li>07:00-12:00 UTC: avg 240 req/min · <b>peak: 480 req/min</b> at 10:00</li>
<li>12:00-18:00 UTC: avg 180 req/min</li>
<li>18:00-24:00 UTC: avg <b>5 req/min</b></li>
</ul>
<p><b>Utilization:</b></p>
<ul>
<li>Time idle (&lt;10 req/min): <b>61.4%</b> of week</li>
<li>Average GPU usage: 14%</li>
<li>p99 latency: 820ms · current SLA: <b>under 5 minutes</b></li>
</ul>
<p>Auto-scaling: enabled (min=2, max=8) · cold-start observed: never (instances always warm)</p>`,
  },

  // Cost Explorer · endpoint cost breakdown
  endpoint_cost: {
    title: "Cost Explorer · SageMaker spend",
    body: `<p>Service: Amazon SageMaker · last 30 days · group by: Usage Type</p>
<ul>
<li><code>ml.g4dn.xlarge:Inference-Endpoint</code> (xray-classifier-prod) · hours: 1,440 · cost: <b>$13,728</b></li>
<li><code>ml.m5.large:Inference-Endpoint</code> (other) · cost: $310</li>
<li>Training jobs: $480</li>
<li>Notebook instances: $89</li>
</ul>
<p><b>Pricing reference (us-east-1, per hour):</b></p>
<ul>
<li>Real-time endpoint · ml.g4dn.xlarge · <b>$0.736/hr</b> (charged 24/7 while endpoint exists)</li>
<li>Async Inference · ml.g4dn.xlarge · $0.736/hr (charged only while processing, can scale to 0)</li>
<li>Serverless Inference · per ms of compute · no idle charge · max model size: 10GB</li>
<li>Batch Transform · per instance-hour while job runs · no persistent endpoint</li>
</ul>
<p>Model size: 487 MB · supports Serverless Inference (under 10GB limit)</p>`,
  },

  // SageMaker Studio · regression eval
  regression_eval: {
    title: "Studio · demand-forecast eval",
    body: `<p>Job de treinamento: <code>training-job-2024-11-04-08-12</code> · status: Completed</p>
<p>Algoritmo: <b>SageMaker Linear Learner</b> · modo: regressão</p>
<p><b>Métricas no conjunto de validação:</b></p>
<ul>
<li>MAE (Erro Médio Absoluto): <b>12.4 unidades</b></li>
<li>MSE (Erro Quadrático Médio): 7,921</li>
<li>RMSE (Raiz do MSE): <b>89.0 unidades</b></li>
<li>R² (R-quadrado): <b>0.42</b></li>
</ul>
<p><b>Análise de resíduos (previsto − real):</b></p>
<ul>
<li>Erro mediano: −3 unidades</li>
<li>Erro p95: −18 / +24 unidades</li>
<li>Outliers (|erro| &gt; 100): <b>4.1% das previsões</b></li>
<li>Outliers concentrados em: Black Friday, Natal, volta às aulas</li>
</ul>
<p><b>Pistas pra interpretar:</b></p>
<ul>
<li>Quando RMSE é muito maior que MAE, a distribuição do erro tem outliers grandes dominando</li>
<li>R² menor que 0.5 normalmente indica que o modelo não captura o padrão subjacente dos dados</li>
</ul>`,
  },

  // SageMaker Canvas · model preview
  model_output: {
    title: "SageMaker Canvas · churn-model-v1",
    body: `<p>Modelo: <code>churn-model-v1</code> · workspace: ChurnTech</p>
<p><b>Configuração do modelo:</b></p>
<ul>
<li>Algoritmo selecionado: <b>Linear Regression</b> (modo regressão)</li>
<li>Variável-alvo: <code>churned</code></li>
<li>Tipo da variável-alvo: <b>binária (0 ou 1)</b></li>
</ul>
<p><b>Distribuição do alvo no dataset de treino:</b></p>
<ul>
<li>valor 0 (não cancelou): 42,107 amostras (84%)</li>
<li>valor 1 (cancelou): 7,893 amostras (16%)</li>
</ul>
<p><b>Predições do modelo · amostra do conjunto de teste:</b></p>
<ul>
<li>user u-12498 → predição: <b>0.42</b></li>
<li>user u-12500 → predição: <b>−0.18</b> ⚠</li>
<li>user u-12502 → predição: <b>1.32</b> ⚠</li>
<li>user u-12506 → predição: 0.95</li>
<li>user u-12509 → predição: <b>−0.31</b> ⚠</li>
<li>user u-12511 → predição: <b>1.41</b> ⚠</li>
<li>user u-12515 → predição: 0.62</li>
</ul>
<p><b>Diagnóstico automático:</b></p>
<ul>
<li>Predições fora do intervalo [0, 1]: <b>23% das amostras</b></li>
<li>Algoritmo selecionado é de regressão (saída contínua, qualquer número real)</li>
<li>Variável-alvo é binária — problema é de classificação, não regressão</li>
</ul>
<p>Comentário do time de produto: <i>"como interpreto −0.18 como probabilidade de churn?"</i></p>`,
  },

  // SageMaker training job cost · Trainium reference
  training_cost: {
    title: "Training Jobs · llm-finetune-v2",
    body: `<p>Job: <code>llm-finetune-v2-2024-11-03</code> · status: Completed · runtime: 72h 14min</p>
<p><b>Configuração de instância:</b></p>
<ul>
<li>Instance type: <code>ml.p4d.24xlarge</code> · count: 4</li>
<li>GPU: 8× NVIDIA A100 40GB por instância (32 GPUs no total)</li>
<li>Custo por hora: <b>$32.77/hr por instância</b> · total: $131.08/hr</li>
</ul>
<p><b>Custo do treinamento:</b></p>
<ul>
<li>Horas de compute: 288.93</li>
<li>Custo deste run: <b>$9,470</b></li>
<li>Últimos 30 dias · 9 runs: <b>$85,230</b></li>
</ul>
<p><b>Comparação de preço · mesma carga de trabalho:</b></p>
<ul>
<li>ml.p4d.24xlarge (GPU A100): $32.77/hr · perf benchmark: 1.00×</li>
<li><code>ml.trn1.32xlarge</code> (<b>Trainium</b>): <b>$21.50/hr</b> · perf benchmark: 1.08× em transformer training</li>
<li>Savings Plan · 1 ano de commit em P4d: $22.94/hr (30% off, exige commitment)</li>
<li>Spot ml.p4d.24xlarge: $9.83/hr · interrompível (taxa média de interrupção 12%)</li>
</ul>
<p><b>Compatibilidade Trainium:</b></p>
<ul>
<li>Framework usado: PyTorch (treinamento distribuído em múltiplas GPUs)</li>
<li>Trainium suportado pela AWS Neuron SDK</li>
<li>Esforço de migração: <b>baixo</b> — mudança em configuração do job, sem reescrita do modelo</li>
</ul>`,
  },
};
