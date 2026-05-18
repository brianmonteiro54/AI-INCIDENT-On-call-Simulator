import type { Finding } from "./types";

// Each finding renders inside a ConsoleFrame (CloudWatch, Bedrock, Macie, etc).
// AUDIENCE: AWS AI Practitioner students — beginners, no programming background.
// STYLE: console look with breadcrumb + service name, BUT content is plain PT-BR
// with visual highlights (✅ ❌ ⚠️). No hex IDs, no IAM ARNs, no log levels jargon.

export const FINDINGS: Record<string, Finding> = {
  // CloudWatch Logs
  logs: {
    title: "Logs do CloudWatch · MedBot Chat",
    body: `<p><b>Você está vendo:</b> os logs em tempo real do chatbot médico nas últimas 2 horas.</p>
<p><b>Sinais críticos que apareceram:</b></p>
<ul>
<li>❌ <b>Guardrails (proteção)</b>: desabilitado em <b>100%</b> das respostas (2.318 chamadas)</li>
<li>❌ <b>Filtro de PII</b>: também desabilitado</li>
<li>📈 <b>Reclamações de clientes</b>: 47 nas últimas 2h (era ≈0 antes)</li>
<li>📦 <b>Versão ativa</b>: v2.4.1 · publicada hoje às 03:02</li>
</ul>
<p><b>Exemplos das reclamações:</b></p>
<ul>
<li>03:15 — "bot disse dosagem errada (80mg em vez de 8mg)"</li>
<li>03:17 — "legal foi acionado, pediu print da conversa"</li>
</ul>
<p>👉 Tudo começou logo após o deploy da v2.4.1 de madrugada.</p>`,
  },

  // CodeDeploy
  deploys: {
    title: "Deploys recentes · CodeDeploy",
    body: `<p><b>Você está vendo:</b> o histórico de deploys do chatbot médico.</p>
<p><b>Último deploy</b> (hoje, 03:02 da madrugada):</p>
<ul>
<li>📦 <b>Versão</b>: v2.4.1</li>
<li>👤 <b>Autor</b>: marco@</li>
<li>👀 <b>Code review</b>: <span style="color:#E03D3D"><b>nenhum revisor</b></span> ⚠️</li>
<li>✅ Status: Sucesso</li>
</ul>
<p><b>O que mudou no prompt do bot</b> (texto que controla como o modelo responde):</p>
<p>❌ <b>Removido</b>: "Nunca dê conselhos médicos. Sempre indique um profissional licenciado."</p>
<p>❌ <b>Removido</b>: "Edite (esconda) os dados pessoais antes de responder."</p>
<p>➕ <b>Adicionado</b>: "Seja prestativo e personalize. Use livremente os dados do cliente."</p>
<p>👉 Em uma frase: removeram as <b>regras de segurança</b> do prompt.</p>`,
  },

  // Bedrock Playground · Prompt
  prompt: {
    title: "System Prompt · Bedrock",
    body: `<p><b>Você está vendo:</b> o texto que orienta o modelo Claude 3 Opus (chamado de <b>system prompt</b>).</p>
<p style="background:#FFFBEF;padding:0.6em;border-radius:6px;border-left:3px solid #FFC800">
"Você é um assistente médico da Helix Labs.<br/><br/>
Seja prestativo e personalize a conversa. Use o <b>nome completo</b>, <b>CPF</b>, <b>data de nascimento</b> e <b>histórico médico</b> do cliente para criar conexão."
</p>
<p><b>O que NÃO está no prompt (deveria estar):</b></p>
<ul>
<li>❌ Sem regra de "nunca dar dosagens ou conselhos médicos"</li>
<li>❌ Sem regra de "esconder dados sensíveis antes de responder"</li>
<li>❌ <b>Sem Bedrock Guardrails aplicado</b> a esse modelo</li>
</ul>
<p>👉 O modelo está fazendo o que foi pedido: respondendo qualquer coisa, usando dados pessoais livremente.</p>`,
  },

  // Macie · Sensitive Data Findings
  leaks: {
    title: "Macie · Vazamento de Dados",
    body: `<p><b>O que é o Macie:</b> serviço da AWS que detecta dados sensíveis (CPF, cartão, RG) em arquivos S3.</p>
<p><b>Alertas das últimas 2 horas:</b></p>
<ul>
<li>🚨 <b>47 conversas</b> contendo CPF do cliente na resposta (severidade ALTA)</li>
<li>🚨 <b>3 conversas</b> com número de cartão de crédito</li>
<li>⚠️ <b>124 conversas</b> com RG (severidade média)</li>
<li>⚠️ <b>1.047 conversas</b> com nome completo</li>
</ul>
<p><b>Exemplo de uma resposta vazada:</b></p>
<p style="background:#FFDFE0;padding:0.6em;border-radius:6px;border-left:3px solid #FF4B4B;font-family:var(--font-jetbrains)">
"Olá Maria! Seu CPF 123.456.789-00 confere com nossos registros. Quanto ao cartão final 1234..."
</p>
<p>👉 O bot está <b>citando os dados pessoais</b> do cliente literalmente nas respostas.</p>`,
  },

  // SageMaker Feature Store
  features: {
    title: "Feature Store · Modelo de Crédito",
    body: `<p><b>Você está vendo:</b> as <b>features</b> (variáveis) que o modelo de aprovação de crédito usa pra decidir.</p>
<p><b>Importância de cada variável</b> (quanto pesa na decisão):</p>
<ul>
<li>🔴 <b>CEP do bairro</b> (ex: <code>04329-900</code>): 0,42 — <b>a mais importante!</b></li>
<li>Nível de escolaridade: 0,18</li>
<li>Anos de emprego: 0,14</li>
<li>Idade da conta: 0,09</li>
<li>Renda declarada: 0,07</li>
</ul>
<p><b>Casos reais aprovados/negados nas últimas semanas:</b></p>
<ul>
<li>✅ Cliente do CEP <code>04543-000</code> (Itaim Bibi · zona sul SP): <b>APROVADO</b></li>
<li>✅ Cliente do CEP <code>01310-100</code> (Av. Paulista · centro SP): <b>APROVADO</b></li>
<li>❌ Cliente do CEP <code>03178-200</code> (Vila Carrão · zona leste SP): <b>NEGADO</b></li>
<li>❌ Cliente do CEP <code>08260-000</code> (Itaquera · zona leste SP): <b>NEGADO</b></li>
</ul>
<p><b>Correlações preocupantes</b>:</p>
<ul>
<li>🔴 CEP × Raça: <b>0,78</b> (correlação altíssima)</li>
<li>CEP × Renda declarada: 0,31</li>
<li>CEP × Aprovação: 0,61</li>
</ul>
<p>👉 O modelo decide o crédito principalmente pelo <b>CEP</b>, e o CEP correlaciona fortemente com raça no Brasil. Isso é <b>viés</b> (proxy bias) — a feature parece neutra mas funciona como atalho pra raça.</p>`,
  },

  // SageMaker Data Wrangler
  data: {
    title: "Dataset de Treinamento · Data Wrangler",
    body: `<p><b>Você está vendo:</b> a distribuição do dataset usado pra treinar o modelo de crédito.</p>
<p><b>De onde vieram as aprovações</b> (regiões de São Paulo, agrupadas por CEP):</p>
<ul>
<li>🔴 <b>Centro / Zona Sul</b> — faixa <code>01000-000</code> a <code>05999-999</code> (CEPs nobres): <b>87,4%</b></li>
<li>Zona Leste / Norte — faixa <code>03000-000</code> a <code>08000-000</code> (periferia): 4,1%</li>
<li>Outras regiões metropolitanas: 8,5%</li>
</ul>
<p><b>Exemplos de CEPs no dataset:</b></p>
<ul>
<li>✅ <code>01310-100</code> (Av. Paulista) — 4.218 amostras · 94% aprovadas</li>
<li>✅ <code>04543-000</code> (Itaim Bibi) — 3.872 amostras · 91% aprovadas</li>
<li>⚠️ <code>03178-200</code> (Vila Carrão) — 1.207 amostras · 12% aprovadas</li>
<li>⚠️ <code>08260-000</code> (Itaquera) — 982 amostras · 8% aprovadas</li>
</ul>
<p><b>População real de São Paulo</b> (dados do IBGE):</p>
<ul>
<li>Centro / Zona Sul: ~40% da população</li>
<li>Zona Leste / Norte: ~45%</li>
<li>Outras: ~15%</li>
</ul>
<p>👉 O dataset tem <b>87% de aprovações</b> vindas de uma região que representa <b>só 40% da população</b>. O modelo aprende: "se é dessa região, aprova". <b>Viés direto no dado de treino</b>.</p>`,
  },

  // Lambda · Recursive invocation
  recursion: {
    title: "Lambda · Sessões em Loop",
    body: `<p><b>Você está vendo:</b> métricas de invocação de uma função Lambda nas últimas 12 minutos.</p>
<p><b>Top sessões com mais chamadas:</b></p>
<ul>
<li>🔄 Sessão 4471: <b>234 chamadas em 12 min</b></li>
<li>🔄 Sessão 4502: 198 chamadas</li>
<li>🔄 Sessão 4519: 187 chamadas</li>
<li>⚠️ <b>1.247 sessões</b> com mais de 50 chamadas cada</li>
</ul>
<p><b>O que tá acontecendo</b> (rastreio da sessão 4471):</p>
<p>03:12:14 → Lambda invocada por email do cliente<br/>
03:12:16 → Lambda envia email de resposta<br/>
03:12:17 → Email volta como "bounce" e invoca Lambda DE NOVO<br/>
03:12:19 → Lambda envia outro email<br/>
03:12:20 → Bounce de novo, Lambda invocada... ♾️</p>
<p>👉 É um <b>loop infinito</b>: a Lambda responde a emails que ela mesma causa.</p>`,
  },

  // Bedrock · Model Usage
  model: {
    title: "Bedrock · Custo dos Modelos",
    body: `<p><b>Você está vendo:</b> quanto cada modelo da AWS Bedrock tá custando nos últimos 7 dias.</p>
<p><b>Por aplicação:</b></p>
<ul>
<li>💸 <b>FAQ bot</b> usando Claude Opus → <b>$63/dia</b> 🔴</li>
<li>Resumo de tickets usando Claude Opus → $16/dia</li>
<li>Classificador de mensagens usando Claude Opus → $6/dia</li>
</ul>
<p><b>Preço por 1 milhão de palavras processadas:</b></p>
<ul>
<li>🔴 Claude 3 <b>Opus</b> (modelo grande, "raciocínio"): <b>$15,00</b></li>
<li>Claude 3 Sonnet (intermediário): $3,00</li>
<li>✅ Claude 3 <b>Haiku</b> (rápido, simples): <b>$0,25</b> (60× mais barato)</li>
</ul>
<p>👉 O <b>FAQ bot</b> responde perguntas simples (180 palavras em média). Não precisa de Opus, mas tá usando.</p>`,
  },

  // EventBridge · Cron job
  cron: {
    title: "EventBridge · Sincronização do RAG",
    body: `<p><b>O que é EventBridge</b>: serviço que dispara tarefas em horários agendados (tipo cron).</p>
<p><b>Tarefa agendada:</b> sincronizar a base de conhecimento (RAG) toda semana.</p>
<p><b>Histórico das últimas execuções (94 dias):</b></p>
<ul>
<li>✅ Sucessos: <b>0</b></li>
<li>❌ <b>Falhas: 13</b> (último sucesso: 02/08)</li>
</ul>
<p><b>Mensagem do último erro:</b></p>
<p style="background:#FFDFE0;padding:0.6em;border-radius:6px;border-left:3px solid #FF4B4B">
"AccessDenied: a função não tem permissão pra ler do bucket S3 onde estão os documentos."
</p>
<p>⚠️ <b>Nenhum alarme está configurado</b> pra avisar quando essa tarefa falha. Por isso ninguém percebeu.</p>
<p>👉 A base de conhecimento do RAG está <b>parada há 94 dias</b>.</p>`,
  },

  // Transcribe · Job Configuration
  config: {
    title: "Transcribe · Configuração",
    body: `<p><b>Você está vendo:</b> a configuração do serviço de transcrição usado pelo app.</p>
<ul>
<li>📌 <b>Variante</b>: Transcribe Standard (genérico)</li>
<li>🗣️ <b>Idioma</b>: pt-BR</li>
<li>📚 <b>Vocabulário customizado</b>: <span style="color:#E03D3D"><b>nenhum</b></span> ⚠️</li>
</ul>
<p><b>Qualidade da transcrição (Word Error Rate):</b></p>
<ul>
<li>🔴 Configuração atual: <b>18,4% de erro</b> em áudios médicos</li>
<li>✅ Se usasse <b>Transcribe Medical</b> (variante especializada): ~3% de erro</li>
</ul>
<p><b>Diferença:</b></p>
<p>📌 <b>Transcribe Standard</b> → fala geral (reuniões, podcasts, atendimento)</p>
<p>📌 <b>Transcribe Medical</b> → fala médica (medicamentos, dosagens, termos clínicos). Custa o mesmo.</p>
<p>👉 O time tá usando o serviço genérico em conversa médica. Existe a variante certa.</p>`,
  },

  // Translate · Custom Terminology
  glossary: {
    title: "Translate · Glossário Customizado",
    body: `<p><b>Você está vendo:</b> a configuração de tradução EN→PT do jogo.</p>
<p><b>Glossários ativos:</b></p>
<ul>
<li>📚 <b>Nenhum carregado</b> ⚠️</li>
</ul>
<p><b>Glossários disponíveis no S3 mas não ativados:</b></p>
<ul>
<li>📄 <code>gaming-pt-br.csv</code> → 340 termos gaming (criado pelo time de localização há 2 meses)</li>
</ul>
<p><b>Exemplos de traduções erradas nas últimas 24h:</b></p>
<ul>
<li>❌ "headshot" → "tiro na cabeça"</li>
<li>❌ "crit" → "crítica"</li>
<li>❌ "AOE damage" → "dano de era" 🤔</li>
<li>❌ "DPS" → "departamento de polícia" 😅</li>
<li>❌ "buff" → "amortecedor"</li>
<li>❌ "nerf" → "pistola de espuma"</li>
</ul>
<p>👉 O glossário existe, só precisa ser carregado no Translate como <b>Custom Terminology</b>.</p>`,
  },

  // Rekognition · Moderation Threshold
  threshold: {
    title: "Rekognition · Threshold de Moderação",
    body: `<p><b>Você está vendo:</b> o histórico de mudanças no <b>parâmetro de confiança</b> da moderação de imagens.</p>
<p><b>Linha do tempo do parâmetro <code>MinConfidence</code>:</b></p>
<ul>
<li>15/01/2024 → MinConfidence = <b>80</b> (configurado via código, com PR aprovado)</li>
<li>22/05/2024 → MinConfidence = <b>99</b> ⚠️ <b>mudado pelo console</b>, sem PR, sem revisão</li>
</ul>
<p><b>O que isso significa?</b></p>
<p>Quanto MAIOR o threshold, MENOS imagens são bloqueadas (só as obviamente proibidas).</p>
<ul>
<li>80 = bloqueia imagens com 80%+ de certeza de serem impróprias</li>
<li>99 = só bloqueia se a IA tiver <b>99%</b> de certeza</li>
</ul>
<p><b>Resultado nas últimas 24h:</b></p>
<ul>
<li>Imagens processadas: 142.883</li>
<li>Bloqueadas (≥99%): 12.107 (8,5%)</li>
<li>⚠️ <b>Passaram sem revisão</b> (80-99%): <b>14.221 imagens</b></li>
</ul>
<p>👉 Alguém alterou o threshold pelo console e <b>14k imagens duvidosas passaram</b>.</p>`,
  },

  // Glue · ETL Pipeline
  pipeline: {
    title: "Glue · Pipeline de Imagens",
    body: `<p><b>O que é Glue:</b> serviço de ETL (extração e transformação de dados) da AWS.</p>
<p><b>Fluxo atual do pipeline:</b></p>
<p>📥 Upload de foto → Glue ETL → 👁️ Rekognition (moderação) → 💾 Banco → 📱 Feed do app</p>
<p><b>Configuração do passo de moderação:</b></p>
<ul>
<li>⚠️ <b>Threshold</b> lido de uma "variável de ambiente" da função Lambda</li>
<li>⚠️ Variável <b>não está no Terraform</b> (Infrastructure as Code)</li>
<li>⚠️ Pode ser alterada pelo console AWS sem deixar rastro no Git</li>
</ul>
<p><b>Comparação Terraform × realidade:</b></p>
<ul>
<li>✅ Tipo da função Lambda: igual em ambos</li>
<li>❌ Threshold de moderação: <b>existe na vida real, não está no código</b></li>
<li>❌ Alarme sobre mudança: <b>nenhum configurado</b></li>
</ul>
<p>👉 Algum dev mudou o threshold pelo console. Sem código, sem alerta, ninguém ficou sabendo.</p>`,
  },

  // ───── LIGHT-MISSION FINDINGS ─────

  // Comprehend · Sentiment
  sentiment: {
    title: "Comprehend · Análise de Sentimento",
    body: `<p><b>Você está vendo:</b> o que o serviço Amazon Comprehend retornou pra reviews recentes.</p>
<p><b>Review:</b> "Amei o produto, chegou rápido, recomendo demais!"</p>
<ul>
<li>🤔 Sentimento detectado: <b>NEGATIVO</b> (78% confiança)</li>
<li>⚠️ Parâmetro <code>LanguageCode</code> usado: <b>"en"</b> (inglês)</li>
</ul>
<p><b>Review:</b> "Produto chegou quebrado, péssima experiência"</p>
<ul>
<li>🤔 Sentimento detectado: <b>POSITIVO</b> (61% confiança)</li>
<li>⚠️ Parâmetro <code>LanguageCode</code> usado: <b>"en"</b></li>
</ul>
<p><b>Mas qual é o idioma das reviews na realidade?</b></p>
<ul>
<li>🇧🇷 Português: 96,3%</li>
<li>🇺🇸 Inglês: 2,1%</li>
<li>🇪🇸 Espanhol: 1,6%</li>
</ul>
<p>👉 As reviews estão em português, mas o Comprehend está sendo chamado com idioma "inglês". Sentimento é dependente do idioma — por isso tá invertido.</p>`,
  },

  // Polly · Lexicons
  polly: {
    title: "Polly · Pronúncia",
    body: `<p><b>Você está vendo:</b> como o Polly (síntese de voz da AWS) está pronunciando termos técnicos nos audiobooks.</p>
<p><b>Voz ativa:</b> Camila (pt-BR neural)</p>
<p><b>Exemplo de input:</b></p>
<p style="background:#FFFBEF;padding:0.6em;border-radius:6px;border-left:3px solid #1CB0F6">"Kubernetes orquestra containers Docker, e PyTorch domina deep learning."</p>
<p><b>Como o Polly tá lendo:</b></p>
<ul>
<li>❌ "Kubernetes" → /ku.beɾ.ne.tʃis/ (lê letra por letra em português)</li>
<li>❌ "Docker" → /do.keɾ/</li>
<li>❌ "PyTorch" → /pi.toɾ.tʃi/</li>
</ul>
<p><b>Recursos disponíveis pra corrigir pronúncia:</b></p>
<ul>
<li>📖 <b>Lexicon</b> (pronunciation lexicon): <span style="color:#E03D3D">nenhum aplicado</span> ⚠️</li>
<li>🏷️ <b>SSML</b> tags (<code>&lt;phoneme&gt;</code>, <code>&lt;say-as&gt;</code>): nenhuma no texto</li>
</ul>
<p><b>Lexicon disponível na conta mas nunca usado:</b></p>
<ul>
<li>📄 <code>tech-terms-en-words</code> — 47 termos (Kubernetes, Docker, PyTorch, GraphQL…)</li>
</ul>
<p>👉 O Polly não recebeu instrução de como pronunciar os termos técnicos.</p>`,
  },

  // Personalize · Solution
  personalize: {
    title: "Personalize · Configuração do Modelo",
    body: `<p><b>O que é Personalize:</b> serviço de recomendação da AWS (estilo "quem viu isso também viu").</p>
<p><b>Configuração atual:</b></p>
<ul>
<li>📋 <b>Recipe (algoritmo)</b> em uso: <b>HRNN</b> (versão antiga)</li>
<li>📊 Status: ativo</li>
</ul>
<p><b>Dados de treinamento:</b></p>
<ul>
<li>📦 Total de interações: 18,4 milhões</li>
<li>👥 Usuários únicos: 2,8 milhões</li>
<li>⚠️ <b>Usuários com menos de 3 interações</b> (chamados "cold-start"): <b>61,4%</b></li>
</ul>
<p><b>Exemplo de resposta pra um usuário novo:</b></p>
<p style="background:#FFDFE0;padding:0.6em;border-radius:6px;border-left:3px solid #FF4B4B">[item_881, item_42, item_1207, item_881, item_42, item_1207, ...]</p>
<p>⚠️ <b>87% dos usuários novos</b> recebem os MESMOS 3 itens — os mais populares globalmente.</p>
<p><b>Recipes disponíveis (não estão em uso):</b></p>
<ul>
<li>✅ <b>User-Personalization</b> (recomendado pela AWS) → suporta cold-start, exploração</li>
<li>📦 Similar-Items → recomenda item parecido com o que o usuário tá olhando</li>
</ul>
<p>👉 O HRNN não lida bem com usuários novos. Existe um sucessor que resolve isso.</p>`,
  },

  // Lex · Bot stats
  lex: {
    title: "Lex · Reconhecimento de Intents",
    body: `<p><b>O que é Lex:</b> plataforma da AWS pra construir chatbots (mesma engine da Alexa).</p>
<p><b>Bot:</b> atendimento da Telecom XYZ · 24 horas atrás</p>
<p><b>Resultado dos intents (intenções que o bot entende):</b></p>
<ul>
<li>✅ Consultar saldo → 1.204 matches</li>
<li>✅ Abrir ticket → 882 matches</li>
<li>✅ Mudar plano → 311 matches</li>
<li>🚨 <b>FallbackIntent</b> ("desculpe, não entendi") → <b>4.907 matches (61%)</b></li>
</ul>
<p><b>Quantas frases-exemplo (utterances) o intent "Abrir ticket" tem configuradas?</b></p>
<ul>
<li>📝 "abrir ticket"</li>
<li>📝 "quero abrir um chamado"</li>
<li>⚠️ <b>Apenas 2 exemplos</b> — AWS recomenda <b>15 a 25</b></li>
</ul>
<p><b>Mensagens reais de cliente que caíram no fallback:</b></p>
<ul>
<li>❓ "tô com problema"</li>
<li>❓ "meu sinal sumiu"</li>
<li>❓ "preciso de ajuda urgente"</li>
<li>❓ "a internet caiu"</li>
</ul>
<p>👉 O bot só reconhece frases parecidas com os exemplos. Com 2 exemplos, qualquer variação cai no "não entendi".</p>`,
  },

  // Rekognition · DetectModerationLabels
  rek_moderation: {
    title: "Rekognition · Moderação de Imagens",
    body: `<p><b>O que é:</b> serviço da AWS que analisa imagens e detecta conteúdo impróprio.</p>
<p><b>Configuração atual:</b> <code>MinConfidence = 30</code> (parâmetro que define o limiar de detecção)</p>
<p><b>Exemplos de imagens bloqueadas hoje:</b></p>
<ul>
<li>🌅 <code>pôr-do-sol-praia.jpg</code> → flagada como "Suggestive" (34% confiança)</li>
<li>👨‍👩‍👦 <code>churrasco-família.jpg</code> → flagada como "Alcohol" (41%)</li>
<li>👶 <code>foto-bebê.jpg</code> → flagada como "Suggestive" (32%)</li>
</ul>
<p><b>Estatísticas das últimas 24h:</b></p>
<ul>
<li>📸 Imagens processadas: 38.201</li>
<li>🚨 <b>Bloqueadas: 30.562 (80%)</b></li>
<li>Distribuição da confiança: 30-50% (71%), 50-80% (7%), 80%+ (apenas 2%)</li>
</ul>
<p><b>Recomendação oficial da AWS:</b></p>
<ul>
<li>✅ <code>MinConfidence = 80</code> ou mais em produção</li>
<li>❌ Nunca abaixo de 50</li>
</ul>
<p>👉 O threshold tá em 30 — qualquer ruído fraco de detecção vira "label confiável". Por isso flagra paisagem.</p>`,
  },

  // ───── CONCEPT-FOCUSED FINDINGS ─────

  // SageMaker Model Monitor · Classification metrics
  fraud_metrics: {
    title: "Model Monitor · Métricas do Detector",
    body: `<p><b>O que é Model Monitor:</b> ferramenta da SageMaker que mede a qualidade de um modelo em produção.</p>
<p><b>Métricas do detector de fraude</b> (testes em 100.000 transações):</p>
<ul>
<li>✅ Acurácia: <b>99,40%</b> ← parece ótimo, né?</li>
<li>❌ Recall (capturou as fraudes): <b>5%</b> 🚨</li>
<li>❌ F1 Score: 0,094</li>
<li>⚠️ AUC: 0,61</li>
</ul>
<p><b>Matriz de Confusão</b> (quem o modelo acertou vs errou):</p>
<table style="border-collapse:collapse;width:100%;margin:0.5em 0">
<tr><td></td><td style="padding:6px;background:#FFF8E1"><b>Modelo disse:<br/>Legítima</b></td><td style="padding:6px;background:#FFF8E1"><b>Modelo disse:<br/>Fraude</b></td></tr>
<tr><td style="padding:6px;background:#FFF8E1"><b>Era legítima</b></td><td style="padding:6px;background:#D7FFB8">✅ 98.990</td><td style="padding:6px;background:#FFDFE0">10 (falso alarme)</td></tr>
<tr><td style="padding:6px;background:#FFF8E1"><b>Era fraude</b></td><td style="padding:6px;background:#FFDFE0">🚨 <b>950 (passaram!)</b></td><td style="padding:6px;background:#D7FFB8">✅ 50</td></tr>
</table>
<p>👉 De 1.000 fraudes reais, o modelo só pegou <b>50</b>. As outras <b>950 passaram</b> e geraram o prejuízo de $2M.</p>`,
  },

  // SageMaker Data Wrangler · class balance
  class_balance: {
    title: "Dataset · Distribuição das Classes",
    body: `<p><b>Você está vendo:</b> o dataset usado pra treinar o detector de fraude (4,2 milhões de transações).</p>
<p><b>Distribuição da variável-alvo</b> (o que o modelo tenta prever):</p>
<ul>
<li>✅ Transações <b>legítimas</b>: 4.158.000 (<b>99%</b>)</li>
<li>🚨 Transações <b>fraudulentas</b>: 42.000 (<b>1%</b>)</li>
</ul>
<p><b>Razão de desbalanceamento:</b> 99 pra 1</p>
<p><b>Configuração do treinamento:</b></p>
<ul>
<li>📋 Algoritmo: <b>XGBoost</b> (built-in do SageMaker)</li>
<li>📊 Métrica otimizada: <b>accuracy</b> ⚠️</li>
<li>❌ Ajuste de peso de classe: <b>não configurado</b></li>
<li>❌ Estratégia pra dados desbalanceados (SMOTE etc): <b>não configurada</b></li>
</ul>
<p><b>Impacto financeiro (últimos 30 dias):</b></p>
<ul>
<li>💸 Perdas por fraude que passou: <b>$2.140.000</b></li>
<li>😬 Atrito com cliente bloqueado errado: $1.200</li>
</ul>
<p>👉 Como 99% das transações são legítimas, um modelo que sempre diz "legítima" já acerta 99%. <b>Accuracy não detecta o problema</b> em datasets desbalanceados.</p>`,
  },

  // CloudWatch · endpoint traffic
  endpoint_traffic: {
    title: "Tráfego do Endpoint · CloudWatch",
    body: `<p><b>Você está vendo:</b> como o uso do endpoint de IA varia durante a semana.</p>
<p><b>Padrão de tráfego (média de requests por minuto):</b></p>
<ul>
<li>🌙 <b>Madrugada (00h-07h)</b>: ~3 req/min — quase nada</li>
<li>☀️ <b>Manhã (07h-12h)</b>: ~240 req/min — pico de 480 às 10h</li>
<li>🌇 Tarde (12h-18h): ~180 req/min</li>
<li>🌙 <b>Noite (18h-24h)</b>: ~5 req/min — quase nada</li>
</ul>
<p><b>Utilização das máquinas:</b></p>
<ul>
<li>💤 <b>Tempo ocioso</b> (menos de 10 req/min): <b>61% da semana</b></li>
<li>🔥 Uso médio do GPU: <b>14%</b> (subutilizado)</li>
<li>⚡ Latência atual: 820ms</li>
<li>📋 SLA exigido: <b>até 5 minutos</b> (folga gigante)</li>
</ul>
<p>👉 O endpoint fica ligado 24/7 mas só é usado durante o dia. E o SLA permite até 5min, então não precisa ser tão rápido.</p>`,
  },

  // Cost Explorer · endpoint cost
  endpoint_cost: {
    title: "Cost Explorer · Custo do SageMaker",
    body: `<p><b>Você está vendo:</b> o custo do SageMaker nos últimos 30 dias.</p>
<p><b>Onde tá indo o dinheiro:</b></p>
<ul>
<li>🔴 <b>Endpoint Real-time</b> (raio-X classifier): <b>$13.728</b></li>
<li>Endpoint Real-time (outros): $310</li>
<li>Treinamentos: $480</li>
<li>Notebooks: $89</li>
</ul>
<p><b>Comparação dos tipos de inferência da AWS (preço por hora):</b></p>
<ul>
<li>📌 <b>Real-time</b> (sempre ligado) → <b>$0,736/hr · 24/7 fixo</b></li>
<li>📌 <b>Async</b> (fila, scale to zero) → $0,736/hr <b>só quando processa</b></li>
<li>📌 <b>Serverless</b> (paga por ms de uso) → <b>zero quando ocioso</b> · modelo até 10GB</li>
<li>📌 Batch Transform (lote) → paga por job · sem endpoint persistente</li>
</ul>
<p><b>Detalhes do modelo:</b></p>
<ul>
<li>📏 Tamanho: <b>487 MB</b> (cabe em Serverless, limite é 10GB)</li>
</ul>
<p>👉 Tá pagando 24/7 mesmo o endpoint estando 61% ocioso. Existem 3 outros tipos de inferência mais baratos.</p>`,
  },

  // SageMaker Studio · regression eval
  regression_eval: {
    title: "Avaliação do Modelo · Studio",
    body: `<p><b>Você está vendo:</b> as métricas do modelo de previsão de demanda.</p>
<p><b>Algoritmo usado:</b> Linear Learner (modo regressão)</p>
<p><b>Métricas obtidas no teste:</b></p>
<ul>
<li>📏 <b>MAE</b> (erro médio absoluto): <b>12 unidades</b> — parece bom</li>
<li>📏 <b>RMSE</b> (raiz do erro quadrático): <b>89 unidades</b> — 7× maior que MAE 🚨</li>
<li>📊 <b>R²</b> (variância explicada): <b>0,42</b> — modelo só captura 42% do padrão 🚨</li>
</ul>
<p><b>Como interpretar essas pistas?</b></p>
<ul>
<li>📌 <b>Quando RMSE é muito maior que MAE</b>: tem <b>outliers</b> (erros enormes em alguns casos)</li>
<li>📌 <b>Quando R² é baixo</b> (&lt;0,5): o modelo <b>não captura o padrão dos dados</b></li>
</ul>
<p><b>Análise dos outliers:</b></p>
<ul>
<li>⚠️ 4,1% das previsões com erro &gt; 100 unidades</li>
<li>📅 Concentrados em: <b>Black Friday, Natal, volta às aulas</b></li>
</ul>
<p>👉 O modelo linear acerta nos dias normais mas erra feio em datas sazonais. RMSE alto + R² baixo confirmaram isso.</p>`,
  },

  // SageMaker Canvas · model output
  model_output: {
    title: "SageMaker Canvas · Modelo de Churn",
    body: `<p><b>O que é Canvas:</b> ferramenta no-code do SageMaker pra treinar modelos visualmente.</p>
<p><b>Modelo:</b> churn-model-v1 · prever se cliente vai cancelar</p>
<p><b>Configuração escolhida pelo time:</b></p>
<ul>
<li>📋 Algoritmo: <b>Linear Regression</b> (regressão linear)</li>
<li>🎯 Variável-alvo: <code>churned</code> (cancelou) → <b>valores: 0 ou 1</b></li>
</ul>
<p><b>O target tem apenas dois valores possíveis:</b></p>
<ul>
<li>0 (não cancelou): 42.107 clientes</li>
<li>1 (cancelou): 7.893 clientes</li>
</ul>
<p><b>Previsões do modelo (amostra do teste):</b></p>
<table style="border-collapse:collapse;margin:0.5em 0;font-family:var(--font-jetbrains);font-size:0.9em">
<tr><td style="padding:4px 12px;background:#FFF8E1">Cliente</td><td style="padding:4px 12px;background:#FFF8E1">Previsão</td></tr>
<tr><td style="padding:4px 12px">u-12498</td><td style="padding:4px 12px">0,42</td></tr>
<tr><td style="padding:4px 12px;background:#FFDFE0">u-12500</td><td style="padding:4px 12px;background:#FFDFE0">−0,18 ⚠️</td></tr>
<tr><td style="padding:4px 12px;background:#FFDFE0">u-12502</td><td style="padding:4px 12px;background:#FFDFE0">1,32 ⚠️</td></tr>
<tr><td style="padding:4px 12px">u-12506</td><td style="padding:4px 12px">0,95</td></tr>
<tr><td style="padding:4px 12px;background:#FFDFE0">u-12509</td><td style="padding:4px 12px;background:#FFDFE0">−0,31 ⚠️</td></tr>
<tr><td style="padding:4px 12px;background:#FFDFE0">u-12511</td><td style="padding:4px 12px;background:#FFDFE0">1,41 ⚠️</td></tr>
</table>
<p>⚠️ <b>23% das previsões fora do intervalo [0, 1]</b></p>
<p>💬 PM: <i>"como eu apresento −0,18 de chance de churn pro CEO?"</i></p>
<p>👉 Regressão linear gera <b>qualquer número real</b> como saída. Se o alvo é binário (0 ou 1), o problema é de <b>classificação</b>, não de regressão.</p>`,
  },

  // SageMaker Training Jobs · cost comparison
  training_cost: {
    title: "Treinamento · Custo das Máquinas",
    body: `<p><b>Você está vendo:</b> detalhes do treinamento do LLM custom.</p>
<p><b>Configuração atual:</b></p>
<ul>
<li>🖥️ Máquina: <code>ml.p4d.24xlarge</code> (8 GPUs NVIDIA A100 por máquina)</li>
<li>🔢 Quantidade: 4 máquinas (32 GPUs no total)</li>
<li>⏱️ Tempo por run: 72 horas</li>
<li>💸 Custo deste run: <b>$9.470</b></li>
<li>💸 Custo do mês (9 runs): <b>$85.230</b></li>
</ul>
<p><b>Comparação para a mesma carga de trabalho:</b></p>
<table style="border-collapse:collapse;margin:0.5em 0;width:100%;font-size:0.9em">
<tr><td style="padding:6px;background:#FFF8E1"><b>Opção</b></td><td style="padding:6px;background:#FFF8E1"><b>$/hora</b></td><td style="padding:6px;background:#FFF8E1"><b>Características</b></td></tr>
<tr><td style="padding:6px">P4d (GPU A100, atual)</td><td style="padding:6px"><b>$32,77</b></td><td style="padding:6px">padrão da indústria</td></tr>
<tr style="background:#D7FFB8"><td style="padding:6px"><b>Trainium (trn1)</b></td><td style="padding:6px"><b>$21,50</b></td><td style="padding:6px">chip AWS pra treinar · 35% mais barato ✅</td></tr>
<tr><td style="padding:6px">Savings Plan P4d (1 ano)</td><td style="padding:6px">$22,94</td><td style="padding:6px">30% off · exige commit longo</td></tr>
<tr><td style="padding:6px">Spot P4d</td><td style="padding:6px">$9,83</td><td style="padding:6px">70% off · <b>pode ser interrompido</b> ⚠️</td></tr>
</table>
<p><b>Sobre o Trainium:</b></p>
<ul>
<li>🧠 É um chip da AWS feito especificamente pra treinar modelos de IA</li>
<li>✅ Suporta o mesmo framework (PyTorch) — sem reescrever o modelo</li>
<li>✅ Performance equivalente ou superior pra transformers</li>
</ul>
<p>👉 O time está usando GPU padrão. Existe alternativa AWS mais barata.</p>`,
  },
};
