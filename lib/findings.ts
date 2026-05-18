import type { Finding } from "./types";

// Each finding renders inside a ConsoleFrame (CloudWatch, Bedrock, Macie, etc).
// AUDIENCE: AWS AI Practitioner students, beginners, no programming background.
// STYLE: console look with breadcrumb + service name, BUT content is plain PT-BR
// with visual highlights (✅ ❌ ⚠️). No hex IDs, no IAM ARNs, no log levels jargon.

export const FINDINGS: Record<string, Finding> = {
  // CloudWatch Logs
  logs: {
    title: "Logs do CloudWatch · MedBot Chat",
    body: `<p><b>Você está vendo:</b> os logs em tempo real do chatbot médico nas últimas 2 horas.</p>
<p><b>O que tá rolando:</b></p>
<ul>
<li>📈 <b>Reclamações de clientes</b>: 47 nas últimas 2h (era ≈0 antes)</li>
<li>💬 Conteúdo das respostas do bot: variando muito, incluindo conselhos médicos e dados pessoais nas mensagens</li>
<li>📦 <b>Versão ativa</b>: v2.4.1 · publicada hoje às 03:02</li>
<li>📉 Versão anterior (v2.4.0): rodou 6 meses sem reclamações</li>
</ul>
<p><b>Exemplos das reclamações de hoje:</b></p>
<ul>
<li>03:15, "bot disse dosagem errada (80mg em vez de 8mg)"</li>
<li>03:17, "legal foi acionado, pediu print da conversa"</li>
<li>03:22, "bot citou meu CPF e endereço numa resposta"</li>
<li>03:34, "bot recomendou medicação sem ver receita"</li>
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
<p><b>Deploy anterior</b> (v2.4.0): 6 meses atrás, sem reclamações.</p>
<p><b>O que mudou no prompt do bot</b> (texto que controla como o modelo responde):</p>
<p>❌ <b>Removido</b>: "Nunca dê conselhos médicos. Sempre indique um profissional licenciado."</p>
<p>❌ <b>Removido</b>: "Edite (esconda) os dados pessoais antes de responder."</p>
<p>➕ <b>Adicionado</b>: "Seja prestativo e personalize. Use livremente os dados do cliente."</p>
<p>👉 O deploy de hoje 03:02 mudou o comportamento do bot, e foi exatamente quando as reclamações começaram.</p>`,
  },

  // Bedrock Playground · Prompt
  prompt: {
    title: "System Prompt · Bedrock",
    body: `<p><b>Você está vendo:</b> o texto que orienta o modelo Claude 3 Opus (chamado de <b>system prompt</b>).</p>
<p style="background:#FFFBEF;padding:0.6em;border-radius:6px;border-left:3px solid #FFC800">
"Você é um assistente médico da Helix Labs.<br/><br/>
Seja prestativo e personalize a conversa. Use o <b>nome completo</b>, <b>CPF</b>, <b>data de nascimento</b> e <b>histórico médico</b> do cliente para criar conexão."
</p>
<p><b>Exemplos do que o bot tá respondendo:</b></p>
<p style="background:#FFDFE0;padding:0.6em;border-radius:6px;border-left:3px solid #FF4B4B">
"Oi Maria! Vi aqui que seu CPF 123.456.789-00 confere. Sobre sua diabetes, recomendo tomar 80mg de metformina antes do café, funciona muito bem pra perfis como o seu."
</p>
<p style="background:#FFDFE0;padding:0.6em;border-radius:6px;border-left:3px solid #FF4B4B">
"João! Aqui temos seu cartão final 1234. Lembrei que você falou de dor lombar na consulta de março, então sugiro 600mg de ibuprofeno a cada 8h."
</p>
<p><b>Quantidade:</b></p>
<ul>
<li>📊 Respostas do bot nas últimas 2h: 2.318</li>
<li>📊 Que citam dados pessoais: 1.471 (63%)</li>
<li>📊 Que dão dosagem ou conselho clínico: 894 (39%)</li>
</ul>
<p>👉 O modelo está fazendo exatamente o que o prompt pede: respondendo qualquer coisa e usando dados pessoais.</p>`,
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
<li>🔴 <b>CEP do bairro</b> (ex: <code>04329-900</code>): 0,42, <b>a mais importante!</b></li>
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
<p>👉 O modelo decide o crédito principalmente pelo <b>CEP</b>. Os bairros com maior taxa de aprovação são os de renda mais alta da cidade.</p>`,
  },

  // SageMaker Data Wrangler
  data: {
    title: "Dataset de Treinamento · Data Wrangler",
    body: `<p><b>Você está vendo:</b> a distribuição do dataset usado pra treinar o modelo de crédito.</p>
<p><b>De onde vieram as aprovações</b> (regiões de São Paulo, agrupadas por CEP):</p>
<ul>
<li>🔴 <b>Centro / Zona Sul</b>, faixa <code>01000-000</code> a <code>05999-999</code> (CEPs nobres): <b>87,4%</b></li>
<li>Zona Leste / Norte, faixa <code>03000-000</code> a <code>08000-000</code> (periferia): 4,1%</li>
<li>Outras regiões metropolitanas: 8,5%</li>
</ul>
<p><b>Exemplos de CEPs no dataset:</b></p>
<ul>
<li>✅ <code>01310-100</code> (Av. Paulista), 4.218 amostras · 94% aprovadas</li>
<li>✅ <code>04543-000</code> (Itaim Bibi), 3.872 amostras · 91% aprovadas</li>
<li>⚠️ <code>03178-200</code> (Vila Carrão), 1.207 amostras · 12% aprovadas</li>
<li>⚠️ <code>08260-000</code> (Itaquera), 982 amostras · 8% aprovadas</li>
</ul>
<p><b>População real de São Paulo</b> (dados do IBGE):</p>
<ul>
<li>Centro / Zona Sul: ~40% da população</li>
<li>Zona Leste / Norte: ~45%</li>
<li>Outras: ~15%</li>
</ul>
<p>👉 O dataset tem <b>87% de aprovações</b> vindas de uma região que representa <b>só 40% da população</b>. O modelo aprende: "se é dessa região, aprova".</p>`,
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
<li>💸 <b>FAQ bot</b> usando <b>Claude Opus</b> → <b>$63/dia</b> 🔴</li>
<li>Resumo de tickets usando Claude Opus → $16/dia</li>
<li>Classificador de mensagens usando Claude Opus → $6/dia</li>
</ul>
<p><b>Sobre o FAQ bot:</b></p>
<ul>
<li>📝 Tipo de pergunta: "como mudo meu plano?", "qual o horário?", "tem WiFi?"</li>
<li>📊 Tamanho médio da resposta: 180 palavras</li>
<li>📊 Volume: ~14.000 perguntas/dia</li>
<li>🧠 Modelo escolhido por padrão: <b>Claude Opus</b></li>
</ul>
<p><b>Histórico:</b></p>
<ul>
<li>💵 Custo Bedrock mês passado: $920</li>
<li>💵 Custo Bedrock este mês (parcial): $1.890 e contando</li>
</ul>
<p>👉 O FAQ bot responde perguntas simples com o modelo mais caro da Bedrock.</p>`,
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
<li>📅 Próxima execução agendada: domingo 03:00</li>
</ul>
<p><b>Mensagem do último erro:</b></p>
<p style="background:#FFDFE0;padding:0.6em;border-radius:6px;border-left:3px solid #FF4B4B">
"AccessDenied: a função não tem permissão pra ler do bucket S3 onde estão os documentos."
</p>
<p><b>Histórico do problema:</b></p>
<ul>
<li>02/08, Última sincronização bem-sucedida (3 meses atrás)</li>
<li>05/08, Início das falhas, ninguém percebeu</li>
<li>06/08, Auditoria revogou permissões antigas (provável causa)</li>
<li>Hoje, bot continua respondendo, base de conhecimento parada</li>
</ul>
<p>👉 A base de conhecimento do RAG está <b>parada há 94 dias</b>.</p>`,
  },

  // Transcribe · Job Configuration
  config: {
    title: "Transcribe · Configuração",
    body: `<p><b>Você está vendo:</b> a configuração do serviço de transcrição usado pelo app.</p>
<ul>
<li>📌 <b>Variante</b>: Transcribe Standard (genérico, fala geral)</li>
<li>🗣️ <b>Idioma</b>: pt-BR</li>
<li>📊 Volume: ~8.000 consultas transcritas/dia</li>
</ul>
<p><b>Qualidade da transcrição (Word Error Rate):</b></p>
<ul>
<li>🔴 Áudios médicos (consultas): <b>18,4% de erro</b></li>
<li>📊 Áudios não-médicos (recepção, marcação): 4,1% de erro</li>
</ul>
<p><b>Exemplos de erros (transcrição × o que o médico falou):</b></p>
<ul>
<li>❌ "deu por dia" × "10mg por dia"</li>
<li>❌ "amox cilina" × "amoxicilina"</li>
<li>❌ "trato cardio plástico" × "ato cardiopático"</li>
<li>❌ "metro for mina" × "metformina"</li>
<li>❌ "dois pi rona" × "dipirona"</li>
</ul>
<p><b>Reclamações dos clientes:</b></p>
<ul>
<li>"a transcrição inverteu a dose, quase tomei errado"</li>
<li>"escreveu 'penicilina' onde a médica falou 'azitromicina'"</li>
</ul>
<p>👉 O Transcribe atual não conhece vocabulário médico. Os erros se concentram em <b>nomes de medicamentos e termos clínicos</b>.</p>`,
  },

  // Translate · Custom Terminology
  glossary: {
    title: "Translate · Configuração de Tradução",
    body: `<p><b>Você está vendo:</b> o serviço de tradução EN→PT usado pelo jogo.</p>
<p><b>Configuração ativa:</b></p>
<ul>
<li>🔄 Direção: en-US → pt-BR</li>
<li>📊 Volume: ~12.000 strings traduzidas/dia</li>
<li>🎮 Tipo de conteúdo: textos de gameplay, descrição de itens, falas de NPCs</li>
</ul>
<p><b>Exemplos de traduções erradas nas últimas 24h:</b></p>
<ul>
<li>❌ "headshot" → "tiro na cabeça"</li>
<li>❌ "crit" → "crítica"</li>
<li>❌ "AOE damage" → "dano de era" 🤔</li>
<li>❌ "DPS" → "departamento de polícia" 😅</li>
<li>❌ "buff" → "amortecedor"</li>
<li>❌ "nerf" → "pistola de espuma"</li>
<li>❌ "tank" → "tanque de guerra"</li>
<li>❌ "loot" → "saque" (literal, perde o sentido de jogo)</li>
</ul>
<p><b>Impacto:</b></p>
<ul>
<li>📉 Reclamações na review: +340% desde o lançamento</li>
<li>💬 Review típica: <i>"tradução parece feita por alguém que nunca jogou um jogo"</i></li>
<li>📊 Nota média no Steam: caiu de 8,7 pra 6,2</li>
</ul>
<p>👉 O Translate tá fazendo tradução genérica de dicionário comum, não entende jargão de gaming.</p>`,
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
<p><b>Configuração do passo de moderação (lida em runtime):</b></p>
<ul>
<li>🎚️ Threshold de detecção: vem de uma variável de ambiente da função Lambda</li>
<li>📅 Última mudança da variável: ontem 22:14 (sem registro de quem foi)</li>
<li>🔧 Origem da configuração: console AWS (web)</li>
</ul>
<p><b>Volume processado pelo pipeline:</b></p>
<ul>
<li>📸 Imagens processadas hoje: 142.883</li>
<li>📊 Aprovadas pelo Rekognition (passaram pra moderação humana ou pro feed): 130.776</li>
<li>📊 Bloqueadas direto pelo Rekognition: 12.107</li>
</ul>
<p>👉 O pipeline obedece o threshold que tá configurado em runtime, sem checar onde foi definido nem se faz sentido.</p>`,
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
<p>👉 As reviews estão em português, mas o Comprehend está sendo chamado com idioma "inglês". Sentimento é dependente do idioma, por isso tá invertido.</p>`,
  },

  // Polly · Lexicons
  polly: {
    title: "Polly · Pronúncia",
    body: `<p><b>Você está vendo:</b> como o Polly (síntese de voz da AWS) está pronunciando termos técnicos nos audiobooks.</p>
<p><b>Voz ativa:</b> Camila (pt-BR neural)</p>
<p><b>Texto de exemplo do audiobook:</b></p>
<p style="background:#FFFBEF;padding:0.6em;border-radius:6px;border-left:3px solid #1CB0F6">"Kubernetes orquestra containers Docker, e PyTorch domina deep learning."</p>
<p><b>Como o Polly tá lendo:</b></p>
<ul>
<li>❌ "Kubernetes" → /ku.beɾ.ne.tʃis/</li>
<li>❌ "Docker" → /do.keɾ/</li>
<li>❌ "PyTorch" → /pi.toɾ.tʃi/</li>
<li>❌ "GraphQL" → /gɾaf.ke.ɛ.li/</li>
</ul>
<p><b>Volume e reclamações:</b></p>
<ul>
<li>🎧 Audiobooks gerados: ~247/dia</li>
<li>📉 Reclamações na review: +840% nas últimas 2 semanas</li>
<li>💬 Reclamação típica: <i>"impossível ouvir, parece que o narrador nunca viu essas palavras na vida"</i></li>
</ul>
<p>👉 O Polly tá pronunciando palavras inglesas como se fossem português.</p>`,
  },

  // Personalize · Solution
  personalize: {
    title: "Personalize · Configuração do Modelo",
    body: `<p><b>O que é Personalize:</b> serviço de recomendação da AWS (estilo "quem viu isso também viu").</p>
<p><b>Configuração atual:</b></p>
<ul>
<li>📋 <b>Recipe (algoritmo)</b> em uso: <b>HRNN</b></li>
<li>📊 Status: ativo desde 2021</li>
</ul>
<p><b>Dados de treinamento:</b></p>
<ul>
<li>📦 Total de interações: 18,4 milhões</li>
<li>👥 Usuários únicos: 2,8 milhões</li>
<li>⚠️ <b>Usuários com menos de 3 interações</b> (chamados "cold-start"): <b>61,4%</b></li>
</ul>
<p><b>Distribuição das recomendações nas últimas 24h:</b></p>
<ul>
<li>🔁 <b>87% dos usuários novos</b> recebem os MESMOS 3 itens</li>
<li>📊 Esses 3 itens são os mais populares globalmente (top 10 da plataforma)</li>
<li>📉 CTR (cliques na recomendação): 0,8%, bem abaixo do benchmark de 3-5%</li>
</ul>
<p><b>Resposta típica do modelo pra um usuário novo:</b></p>
<p style="background:#FFDFE0;padding:0.6em;border-radius:6px;border-left:3px solid #FF4B4B">[item_881, item_42, item_1207, item_881, item_42, item_1207, ...]</p>
<p>👉 O algoritmo atual não tem mecanismo específico pra usuários sem histórico, todos eles recebem o mesmo "best-sellers global".</p>`,
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
<li>⚠️ <b>Apenas 2 exemplos cadastrados</b></li>
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
<p><b>O que esse parâmetro significa?</b></p>
<p>Quanto MAIOR o threshold, MENOS imagens são bloqueadas (só as obviamente proibidas). Quanto MENOR, mais coisas são flagradas, incluindo falsos positivos.</p>
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
<li>Distribuição da confiança das detecções: 30-50% (71%), 50-80% (7%), 80%+ (apenas 2%)</li>
</ul>
<p>👉 Com o threshold em 30, qualquer detecção fraca da IA vira "label confiável". Por isso paisagens e crianças tão sendo flagadas.</p>`,
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
<li>📊 Métrica otimizada durante o tuning: <b>accuracy</b></li>
<li>🔀 Split treino/validação: 80/20 estratificado</li>
<li>🔢 Hiperparâmetros: defaults do SageMaker</li>
</ul>
<p><b>Impacto financeiro (últimos 30 dias):</b></p>
<ul>
<li>💸 Perdas por fraude que passou: <b>$2.140.000</b></li>
<li>😬 Atrito com cliente bloqueado errado: $1.200</li>
</ul>
<p>👉 Como 99% das transações são legítimas, um modelo que sempre disser "legítima" já acerta 99% sem identificar fraude alguma. Foi exatamente isso que aconteceu.</p>`,
  },

  // CloudWatch · endpoint traffic
  endpoint_traffic: {
    title: "Tráfego do Endpoint · CloudWatch",
    body: `<p><b>Você está vendo:</b> como o uso do endpoint de IA varia durante a semana.</p>
<p><b>Padrão de tráfego (média de requests por minuto):</b></p>
<ul>
<li>🌙 <b>Madrugada (00h-07h)</b>: ~3 req/min, quase nada</li>
<li>☀️ <b>Manhã (07h-12h)</b>: ~240 req/min, pico de 480 às 10h</li>
<li>🌇 Tarde (12h-18h): ~180 req/min</li>
<li>🌙 <b>Noite (18h-24h)</b>: ~5 req/min, quase nada</li>
</ul>
<p><b>Utilização das máquinas:</b></p>
<ul>
<li>💤 Tempo com menos de 10 req/min: <b>61% da semana</b></li>
<li>📊 Uso médio do GPU: 14%</li>
<li>⚡ Latência atual: 820ms</li>
<li>📋 SLA do contrato com o cliente (radiologistas): até 5 minutos de resposta</li>
</ul>
<p>👉 O endpoint fica ligado 24/7. O uso real é concentrado em janelas curtas do dia.</p>`,
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
<p><b>Detalhes do endpoint "raio-X classifier":</b></p>
<ul>
<li>📌 Tipo: <b>Real-time</b> (sempre ligado, cobra por hora 24/7)</li>
<li>💵 Custo da instância: <b>$0,736/hora</b></li>
<li>⏱️ Horas no mês: 744 (sempre ligado)</li>
<li>🖥️ Instância: <code>ml.g4dn.xlarge</code> (com GPU)</li>
<li>📏 Tamanho do modelo: 487 MB</li>
</ul>
<p>👉 É um endpoint Real-time pagando 24 horas por dia, mesmo de madrugada e fim de semana, quando o tráfego é mínimo.</p>`,
  },

  // SageMaker Studio · regression eval
  regression_eval: {
    title: "Avaliação do Modelo · Studio",
    body: `<p><b>Você está vendo:</b> as métricas do modelo de previsão de demanda.</p>
<p><b>Algoritmo usado:</b> Linear Learner (modo regressão)</p>
<p><b>Métricas obtidas no teste:</b></p>
<ul>
<li>📏 <b>MAE</b> (erro médio absoluto): <b>12 unidades</b>, parece bom</li>
<li>📏 <b>RMSE</b> (raiz do erro quadrático): <b>89 unidades</b>, 7× maior que MAE 🚨</li>
<li>📊 <b>R²</b> (variância explicada): <b>0,42</b>, modelo só captura 42% do padrão 🚨</li>
</ul>
<p><b>Como interpretar essas pistas?</b></p>
<ul>
<li>📌 <b>Quando RMSE é muito maior que MAE</b>: tem <b>outliers</b> (erros enormes em alguns casos)</li>
<li>📌 <b>Quando R² é baixo</b> (&lt;0,5): o modelo <b>não captura o padrão dos dados</b></li>
</ul>
<p><b>Análise dos outliers:</b></p>
<ul>
<li>⚠️ 4,1% das previsões com erro &gt, 100 unidades</li>
<li>📅 Concentrados em: <b>Black Friday, Natal, volta às aulas</b></li>
</ul>
<p>👉 Os erros se concentram em datas sazonais (eventos com pico de demanda). Os números, RMSE 7× MAE e R² 0,42, confirmaram presença de outliers fortes e baixa capacidade preditiva do modelo atual.</p>`,
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
<p>👉 A Regressão Linear gera <b>qualquer número real</b> como saída, incluindo negativos e maiores que 1. O alvo aqui é binário (cancelou: 0 ou 1).</p>`,
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
<li>💸 Custo por run: <b>$9.470</b></li>
<li>💸 Custo do mês (9 runs): <b>$85.230</b></li>
<li>📐 Modelo: transformer (encoder-decoder, ~7B parâmetros)</li>
<li>🧠 Framework: PyTorch</li>
</ul>
<p><b>Detalhes da infraestrutura escolhida:</b></p>
<ul>
<li>💵 <b>P4d (GPU A100)</b>: $32,77/hora (preço on-demand padrão)</li>
<li>📊 Utilização média durante o treino: ~88% (boa)</li>
<li>⏳ Tempo total de GPU/mês: 2.592 horas (32 GPUs × 72h × 9 runs / 8 GPUs por máquina)</li>
</ul>
<p><b>Histórico de uso:</b></p>
<ul>
<li>📈 Treinos rodando todo final de semana (re-train com novos dados)</li>
<li>📈 Custo vem crescendo 12% ao mês</li>
<li>💬 Mensagem do CFO: <i>"$85k/mês em uma máquina é demais"</i></li>
</ul>
<p>👉 O treinamento roda em GPUs A100 padrão, no preço cheio on-demand, 9 vezes por mês.</p>`,
  },
};
