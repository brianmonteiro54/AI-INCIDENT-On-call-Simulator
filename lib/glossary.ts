export interface GlossaryTerm {
  term: string;
  short: string;
  long: string;
  /** Optional: which mission(s) cover this concept (for cross-linking) */
  missions?: string[];
}

export interface GlossarySection {
  id: string;
  title: string;
  icon: string;
  terms: GlossaryTerm[];
}

export const GLOSSARY: GlossarySection[] = [
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "metricas-classificacao",
    title: "Métricas de Classificação",
    icon: "🎯",
    terms: [
      {
        term: "Accuracy",
        short: "Quantos acertos em geral, dividido pelo total.",
        long: "Funciona bem quando as classes estão balanceadas. <b>Cuidado em datasets desbalanceados</b>: se 99% é uma classe só, prever sempre essa classe já dá 99% de accuracy sem detectar nada útil.",
        missions: ["fraud-99-percent"],
      },
      {
        term: "Precision",
        short: "Dos que o modelo disse que eram positivos, quantos REALMENTE eram.",
        long: "Importa quando o custo de <b>falso positivo</b> é alto (ex: marcar email legítimo como spam). Fórmula: TP / (TP + FP).",
      },
      {
        term: "Recall (Sensibilidade)",
        short: "Dos positivos reais, quantos o modelo conseguiu pegar.",
        long: "Importa quando o custo de <b>falso negativo</b> é alto (ex: deixar passar uma fraude, não detectar câncer). Fórmula: TP / (TP + FN).",
        missions: ["fraud-99-percent"],
      },
      {
        term: "F1 Score",
        short: "Média harmônica entre Precision e Recall.",
        long: "Útil quando você quer balancear ambas. Vai de 0 a 1. <b>Bom default</b> pra classificação desbalanceada quando você não tem preferência forte entre Precision e Recall.",
        missions: ["fraud-99-percent"],
      },
      {
        term: "Confusion Matrix",
        short: "Tabela 2×2 (TP, FP, TN, FN) que mostra acertos e erros do modelo.",
        long: "Linhas = classe real, colunas = classe prevista. <b>Lê assim:</b> diagonal principal = acertos, fora dela = erros. Base de todas as métricas de classificação.",
        missions: ["fraud-99-percent"],
      },
      {
        term: "AUC / ROC",
        short: "Mede a capacidade do modelo de distinguir entre classes.",
        long: "AUC vai de 0 (sempre errado) a 1 (perfeito). 0,5 = chute aleatório. <b>Independente do threshold</b> de classificação — útil pra comparar modelos.",
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "metricas-regressao",
    title: "Métricas de Regressão",
    icon: "📏",
    terms: [
      {
        term: "MAE (Mean Absolute Error)",
        short: "Média do |erro| em cada previsão.",
        long: "Fácil de interpretar — está nas mesmas unidades do alvo. <b>Não penaliza outliers</b>: um erro de 100 conta igual a dois erros de 50.",
        missions: ["forecast-metrics-lie"],
      },
      {
        term: "RMSE (Root Mean Squared Error)",
        short: "Raiz quadrada da média dos erros ao quadrado.",
        long: "<b>Penaliza outliers mais que o MAE</b>. Quando RMSE é muito maior que MAE, é sinal de que tem erros grandes em casos específicos.",
        missions: ["forecast-metrics-lie"],
      },
      {
        term: "R² (Coeficiente de Determinação)",
        short: "Quanto do padrão dos dados o modelo consegue explicar.",
        long: "Vai de 0 a 1 (pode dar negativo em casos ruins). <b>R² < 0,5</b> geralmente indica que o modelo não captura a relação. R² > 0,9 = excelente.",
        missions: ["forecast-metrics-lie"],
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "tipos-aprendizado",
    title: "Tipos de Aprendizado",
    icon: "🧠",
    terms: [
      {
        term: "Supervisionado",
        short: "Aprende com exemplos rotulados (input + resposta correta).",
        long: "Subdividido em <b>Classificação</b> (prever uma classe) e <b>Regressão</b> (prever um número). Exige dataset rotulado, que normalmente é caro de fazer.",
      },
      {
        term: "Não-supervisionado",
        short: "Aprende padrões sem rótulos.",
        long: "Inclui <b>Clustering</b> (agrupar dados parecidos), <b>Redução de dimensionalidade</b> (PCA), <b>Detecção de anomalias</b>. Não precisa de rótulo.",
      },
      {
        term: "Reforço",
        short: "Aprende por tentativa-e-erro com recompensa/punição.",
        long: "Usado em jogos, robótica, otimização de processos. <b>O modelo decide ações</b> e o ambiente devolve uma recompensa numérica.",
      },
      {
        term: "Auto-supervisionado",
        short: "Usa o próprio dado como rótulo (ex: prever a próxima palavra).",
        long: "Base de modelos como GPT e BERT. Permite treinar com bilhões de tokens sem precisar rotular manualmente.",
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "algoritmos",
    title: "Algoritmos Comuns",
    icon: "🌳",
    terms: [
      {
        term: "Linear Regression",
        short: "Prevê um número real como combinação linear das features.",
        long: "Saída pode ser qualquer número — <b>não serve pra classificação</b>. Bom pra entender relações simples entre variáveis.",
        missions: ["wrong-algorithm"],
      },
      {
        term: "Logistic Regression",
        short: "Apesar do nome, é pra CLASSIFICAÇÃO (não regressão).",
        long: "Saída entre 0 e 1 (probabilidade). Bom default pra problemas <b>binários</b> com features que se separam linearmente.",
        missions: ["wrong-algorithm"],
      },
      {
        term: "XGBoost",
        short: "Gradient Boosting de árvores — campeão em competições tabulares.",
        long: "Geralmente o melhor algoritmo pra dados tabulares (planilhas). Lida bem com features mistas, valores faltantes. Built-in no SageMaker.",
        missions: ["fraud-99-percent"],
      },
      {
        term: "Random Forest",
        short: "Várias árvores de decisão votando.",
        long: "Robusto a outliers, fácil de interpretar, raramente faz overfitting. Geralmente perde pro XGBoost mas é um excelente baseline.",
      },
      {
        term: "K-Means",
        short: "Agrupa dados em K clusters baseado em distância.",
        long: "Algoritmo de <b>clustering</b> (não-supervisionado). Você define K (número de grupos), o algoritmo encontra os centros.",
      },
      {
        term: "DeepAR",
        short: "Algoritmo de forecasting baseado em redes neurais recorrentes.",
        long: "Algoritmo do SageMaker pra previsão de séries temporais. <b>Captura sazonalidade</b> e padrões complexos, diferente de modelos lineares.",
        missions: ["forecast-metrics-lie"],
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "inferencia",
    title: "Tipos de Inferência (SageMaker)",
    icon: "⚡",
    terms: [
      {
        term: "Real-time Inference",
        short: "Endpoint sempre ligado, latência baixa (ms).",
        long: "<b>Cobra por hora 24/7</b>, mesmo sem tráfego. Bom pra apps com baixa latência exigida (chatbots ao vivo, classificação em tempo real).",
        missions: ["endpoint-too-expensive"],
      },
      {
        term: "Asynchronous Inference",
        short: "Fila — processa requisições uma de cada vez.",
        long: "<b>Faz scale-to-zero</b> quando ocioso (não cobra). Bom pra cargas pesadas que toleram latência de segundos/minutos. Suporta payloads grandes.",
        missions: ["endpoint-too-expensive"],
      },
      {
        term: "Serverless Inference",
        short: "Paga só pelo tempo de processamento (ms).",
        long: "<b>Zero custo quando ocioso.</b> Limite de modelo: 10GB. Pequeno cold-start no primeiro request. Ideal pra tráfego intermitente.",
        missions: ["endpoint-too-expensive"],
      },
      {
        term: "Batch Transform",
        short: "Job único que processa um dataset inteiro de uma vez.",
        long: "<b>Sem endpoint persistente.</b> Cria a infraestrutura, roda o job, desliga. Ideal pra processar arquivos grandes em background.",
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "hardware",
    title: "Hardware (Chips AWS)",
    icon: "🧱",
    terms: [
      {
        term: "P4d / A100 (GPU NVIDIA)",
        short: "GPUs padrão da indústria pra treino e inferência.",
        long: "Padrão de mercado, caras. Performance excelente, mas custo on-demand é alto. <b>Suporta Spot Instances</b> (70% off, mas interrompível).",
        missions: ["training-eternal"],
      },
      {
        term: "Trainium (trn1)",
        short: "Chip da AWS feito especificamente pra TREINAR.",
        long: "<b>~35% mais barato</b> que GPUs P4d equivalentes. Roda PyTorch nativamente, suporta a maioria de transformers sem reescrever código. <b>Trn</b> = <b>Tr</b>aining.",
        missions: ["training-eternal"],
      },
      {
        term: "Inferentia (inf1, inf2)",
        short: "Chip da AWS feito especificamente pra INFERÊNCIA.",
        long: "Otimizado pra rodar modelos já treinados em produção. <b>Inf</b> = <b>Inf</b>erence. Pra confundir menos: Trn pra treinar, Inf pra inferir.",
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "bedrock-llm",
    title: "Bedrock e LLMs",
    icon: "💬",
    terms: [
      {
        term: "Bedrock Guardrails",
        short: "Camada de proteção que filtra entrada e saída dos modelos.",
        long: "Configura no console: bloqueia <b>conteúdo nocivo</b>, <b>PII</b> (CPF, cartão), <b>tópicos específicos</b>. Funciona em qualquer modelo da Bedrock.",
        missions: ["hallucination", "pii-leak"],
      },
      {
        term: "Prompt Engineering",
        short: "A arte de escrever instruções pra obter o melhor do modelo.",
        long: "Técnicas: ser específico, dar exemplos, definir formato, restringir comportamentos. <b>Não substitui Guardrails</b> — instruções podem ser ignoradas em casos extremos.",
      },
      {
        term: "RAG (Retrieval-Augmented Generation)",
        short: "Modelo busca documentos antes de responder.",
        long: "Combina LLM + base de conhecimento (S3, OpenSearch). Reduz alucinação porque o modelo cita fontes. <b>Precisa sync periódico</b> dos documentos.",
        missions: ["rag-stale"],
      },
      {
        term: "Hallucination (Alucinação)",
        short: "Modelo gera resposta plausível mas falsa.",
        long: "Acontece quando o modelo não tem o conhecimento mas gera algo crível. <b>Mitigado por</b>: RAG, Guardrails, prompts restritivos, temperatura baixa.",
        missions: ["hallucination"],
      },
      {
        term: "Modelos Bedrock (Claude 3)",
        short: "Família Anthropic: Opus (poderoso), Sonnet (médio), Haiku (rápido).",
        long: "<b>Opus</b>: raciocínio complexo, mais caro. <b>Sonnet</b>: balanceado. <b>Haiku</b>: rápido e ~60× mais barato que Opus, ideal pra tarefas simples (FAQ, classificação).",
        missions: ["cost-explosion"],
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "ai-responsavel",
    title: "IA Responsável",
    icon: "⚖️",
    terms: [
      {
        term: "Bias (Viés)",
        short: "Modelo discrimina sistematicamente um grupo.",
        long: "Causas: dataset enviesado, features que funcionam como proxy de atributos protegidos (ex: CEP → raça/renda). <b>Não é resolvido só removendo a feature</b> — pode estar implícita em outras.",
        missions: ["bias"],
      },
      {
        term: "Proxy Bias",
        short: "Feature aparentemente neutra que codifica atributo protegido.",
        long: "Clássico: CEP é proxy de raça/renda no Brasil. Sobrenome é proxy de origem étnica. <b>Tirar a feature</b> nem sempre resolve — pode estar correlacionada com outras.",
        missions: ["bias"],
      },
      {
        term: "SageMaker Clarify",
        short: "Ferramenta AWS pra detectar viés em datasets e modelos.",
        long: "Mede viés <b>antes</b> de treinar (no dataset) e <b>depois</b> (nas predições). Métricas: disparate impact, equal opportunity, etc.",
        missions: ["bias"],
      },
      {
        term: "PII (Personally Identifiable Information)",
        short: "Dados que identificam um indivíduo (CPF, cartão, RG, email).",
        long: "LGPD/GDPR exige cuidado especial. Bedrock Guardrails detecta e bloqueia, Comprehend tem API <code>DetectPiiEntities</code>, Macie detecta em S3.",
        missions: ["pii-leak"],
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "servicos-ai",
    title: "Serviços AWS de IA",
    icon: "☁️",
    terms: [
      {
        term: "Amazon Comprehend",
        short: "NLP gerenciado — sentimento, entidades, idioma, PII.",
        long: "<b>Cuidado com o LanguageCode</b> — análise de sentimento é dependente do idioma. Em português, passe 'pt' explicitamente.",
        missions: ["sentiment-flip"],
      },
      {
        term: "Amazon Polly",
        short: "Texto → fala (TTS) com vozes neurais.",
        long: "Aceita <b>SSML</b> pra controlar entonação, pausas, pronúncia. <b>Pronunciation Lexicon</b>: arquivo com correção de pronúncia de termos específicos (gírias, siglas, jargão).",
        missions: ["polly-mispronounce"],
      },
      {
        term: "Amazon Transcribe / Transcribe Medical",
        short: "Áudio → texto. Standard pra fala geral, Medical pra contexto clínico.",
        long: "<b>Transcribe Medical</b>: variante especializada com vocabulário clínico (medicamentos, dosagens, termos). Custa o mesmo. Custom Vocabulary funciona em ambos.",
        missions: ["transcribe-medical"],
      },
      {
        term: "Amazon Translate",
        short: "Tradução de texto entre idiomas.",
        long: "<b>Custom Terminology</b>: carrega CSV com termos específicos do domínio (gaming, jurídico, médico) pra evitar traduções literais ruins.",
        missions: ["translation-domain"],
      },
      {
        term: "Amazon Lex",
        short: "Plataforma de chatbots — mesma engine da Alexa.",
        long: "Reconhece <b>intents</b> (intenções) a partir de <b>utterances</b> (frases-exemplo). Quanto mais utterances variadas por intent, melhor reconhece variações naturais do usuário.",
        missions: ["lex-fallback"],
      },
      {
        term: "Amazon Rekognition",
        short: "Análise de imagem e vídeo — moderação, detecção, comparação facial.",
        long: "<b>MinConfidence</b>: threshold de confiança pra retornar uma label. Padrão é 50, em produção geralmente 80+. Valores baixos geram falsos positivos.",
        missions: ["rekognition-paranoid", "image-mod-fail"],
      },
      {
        term: "Amazon Personalize",
        short: "Sistema de recomendação como serviço.",
        long: "Tem várias <b>recipes</b> (algoritmos): <b>User-Personalization</b> (recomendado, lida com cold-start), Similar-Items, HRNN (legado).",
        missions: ["personalize-cold"],
      },
      {
        term: "Amazon Bedrock",
        short: "Acesso unificado a LLMs (Claude, Llama, Titan) via API.",
        long: "Sem precisar gerenciar infra. Inclui <b>Guardrails</b>, <b>Knowledge Bases</b> (RAG nativo), <b>Agents</b>. Cobrança por token (entrada + saída).",
      },
    ],
  },
];

export function findTermsForMission(missionId: string): GlossaryTerm[] {
  const found: GlossaryTerm[] = [];
  for (const section of GLOSSARY) {
    for (const term of section.terms) {
      if (term.missions?.includes(missionId)) found.push(term);
    }
  }
  return found;
}
