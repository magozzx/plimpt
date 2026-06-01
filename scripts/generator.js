import { adaptForModel, getModel } from "./models.js";
import { getTemplate } from "./templates.js";

const COPY = {
  en: {
    languageName: "English",
    tone: {
      neutral: "Use a neutral, precise, easy-to-understand voice.",
      professional: "Use a professional, polished, practical voice.",
      friendly: "Use a friendly, warm, clear voice.",
      playful: "Use a playful, energetic voice without losing usefulness.",
      authoritative: "Use an authoritative, confident, direct voice.",
      academic: "Use an academic, rigorous, well-structured voice."
    },
    length: {
      concise: "Keep the answer compact and focused on the essential instructions.",
      balanced: "Use a balanced level of detail: enough structure to guide the model without bloating the prompt.",
      detailed: "Use detailed instructions with clear sections, edge cases, and success criteria.",
      exhaustive: "Use a complete structure with context slots, constraints, examples, validation steps, and edge cases."
    },
    reasoning: {
      direct: "Prefer a direct answer. Do not expose hidden reasoning.",
      step: "Work step by step before the final answer when the task benefits from reasoning.",
      deep: "Analyze the problem deeply, compare options, check tradeoffs, and then present the final answer clearly."
    },
    format: {
      prose: "Return polished prose with clear paragraphs.",
      markdown: "Return clean Markdown with headings, short sections, and lists where useful.",
      bullets: "Return a concise bullet list with grouped points.",
      json: "Return valid JSON only. Use clear keys and no markdown fences unless explicitly requested.",
      table: "Return a readable table with short, useful cells."
    },
    roleFor: (category) => `You are a senior ${category} specialist with strong product sense, prompt-engineering judgment, and practical execution taste.`,
    taskFor: (category) => `Create a detailed, copy-ready prompt for the user's ${category} request. Make it specific enough for a strong AI model to produce a useful result on the first attempt.`,
    context: {
      idea: "User idea",
      category: "Category",
      target: "Target model",
      format: "Requested answer format",
      depth: "Desired prompt depth",
      language: "Detected/requested prompt language"
    },
    smartConstraints: [
      "First infer the likely goal, audience, and success condition from the idea.",
      "If details are missing, add reasonable assumptions as editable slots instead of stopping.",
      "Separate context, task, constraints, and output contract.",
      "Make the prompt ready to copy and paste into the chosen model.",
      "Include concrete deliverables, not vague advice.",
      "Add guardrails for uncertainty, edge cases, and quality checks.",
      "Do not invent facts. Mark assumptions clearly."
    ],
    outputContract: (format, languageName) => [
      COPY.en.format[format] || COPY.en.format.markdown,
      `Write the generated prompt in ${languageName}.`,
      "Use section titles that make the prompt easy to scan.",
      "End with a short checklist the AI should verify before answering."
    ],
    examples: (idea) => [
      `Input idea: "${idea}"`,
      "Output: a precise prompt with role, context, task, constraints, output format, assumptions, and quality checklist."
    ],
    success: [
      "The generated prompt is specific, detailed, and ready to paste.",
      "The output language matches the user's input or selected language.",
      "The prompt reduces ambiguity without becoming bloated.",
      "The target model has a clear contract for what to produce."
    ],
    image: {
      intro: "Image prompt",
      positive: "Positive prompt",
      negative: "Negative prompt",
      descriptors: ["clear subject", "intentional pose or focal action", "specific environment", "cinematic mood", "controlled lighting", "rich texture", "clean composition", "high detail"],
      natural: (idea, descriptors) => `Create a detailed image of ${idea}. The scene should have ${descriptors.join(", ")}. Use a coherent color palette, readable silhouettes, and no text unless it is essential to the concept.`
    },
    videoIntro: (model) => model.type === "video" ? `Create a ${model.label} video prompt.` : "Create a video script and generation-ready shot list.",
    musicLanguage: "Language"
  },
  pt: {
    languageName: "português brasileiro",
    tone: {
      neutral: "Use uma voz neutra, precisa e fácil de entender.",
      professional: "Use uma voz profissional, polida e prática.",
      friendly: "Use uma voz amigável, humana e clara.",
      playful: "Use uma voz criativa e energética sem perder utilidade.",
      authoritative: "Use uma voz firme, confiante e direta.",
      academic: "Use uma voz acadêmica, rigorosa e bem estruturada."
    },
    length: {
      concise: "Mantenha a resposta curta, focada nas instruções essenciais.",
      balanced: "Use um nível equilibrado de detalhe: estrutura suficiente sem inflar o prompt.",
      detailed: "Use instruções detalhadas, com seções claras, casos de borda e critérios de sucesso.",
      exhaustive: "Use uma estrutura completa, com contexto, restrições, exemplos, validação e casos de borda."
    },
    reasoning: {
      direct: "Prefira uma resposta direta. Não exponha raciocínio oculto.",
      step: "Pense passo a passo antes da resposta final quando a tarefa se beneficiar disso.",
      deep: "Analise profundamente, compare caminhos, cheque riscos e só então apresente a resposta final."
    },
    format: {
      prose: "Entregue em texto corrido, com parágrafos claros.",
      markdown: "Entregue em Markdown limpo, com títulos, seções curtas e listas quando fizer sentido.",
      bullets: "Entregue em lista de tópicos, agrupando pontos relacionados.",
      json: "Entregue apenas JSON válido. Use chaves claras e não use blocos de Markdown.",
      table: "Entregue uma tabela legível, com células curtas e úteis."
    },
    roleFor: (category) => `Você é um(a) especialista sênior em ${category}, com bom senso de produto, domínio de prompt engineering e foco em execução prática.`,
    taskFor: (category) => `Crie um prompt detalhado e pronto para copiar para o pedido do usuário em ${category}. O prompt deve ser específico o suficiente para um modelo de IA entregar um resultado bom na primeira tentativa.`,
    context: {
      idea: "Ideia do usuário",
      category: "Categoria",
      target: "Modelo alvo",
      format: "Formato de resposta pedido",
      depth: "Nível de detalhe desejado",
      language: "Idioma detectado/pedido para o prompt"
    },
    smartConstraints: [
      "Primeiro entenda o objetivo provável, o público e o critério de sucesso por trás da ideia.",
      "Se faltarem detalhes, crie suposições razoáveis como campos editáveis em vez de travar.",
      "Separe contexto, tarefa, restrições e contrato de saída.",
      "Deixe o prompt pronto para copiar e colar no modelo escolhido.",
      "Inclua entregáveis concretos, não conselhos genéricos.",
      "Inclua regras para incerteza, casos de borda e checagem de qualidade.",
      "Não invente fatos. Marque suposições claramente."
    ],
    outputContract: (format, languageName) => [
      COPY.pt.format[format] || COPY.pt.format.markdown,
      `Escreva o prompt gerado em ${languageName}.`,
      "Use títulos de seção que deixem o prompt fácil de escanear.",
      "Termine com uma checklist curta para a IA verificar antes de responder."
    ],
    examples: (idea) => [
      `Ideia de entrada: "${idea}"`,
      "Saída: um prompt preciso com papel, contexto, tarefa, restrições, formato de saída, suposições e checklist de qualidade."
    ],
    success: [
      "O prompt gerado é específico, detalhado e pronto para colar.",
      "O idioma da saída acompanha o texto do usuário ou a escolha manual.",
      "O prompt reduz ambiguidade sem ficar inchado.",
      "O modelo alvo entende exatamente o que deve produzir."
    ],
    image: {
      intro: "Prompt de imagem",
      positive: "Prompt positivo",
      negative: "Prompt negativo",
      descriptors: ["sujeito claro", "pose ou ação principal bem definida", "ambiente específico", "clima cinematográfico", "iluminação controlada", "textura rica", "composição limpa", "alto nível de detalhe"],
      natural: (idea, descriptors) => `Crie uma imagem detalhada de ${idea}. A cena deve ter ${descriptors.join(", ")}. Use uma paleta coerente, silhuetas legíveis e nenhum texto, a menos que seja essencial para o conceito.`
    },
    videoIntro: (model) => model.type === "video" ? `Crie um prompt de vídeo para ${model.label}.` : "Crie um roteiro de vídeo e uma lista de cenas pronta para geração.",
    musicLanguage: "Idioma"
  },
  es: {
    languageName: "español",
    tone: {},
    length: {},
    reasoning: {},
    format: {},
    roleFor: (category) => `Eres un especialista senior en ${category}, con criterio de producto y ejecución práctica.`,
    taskFor: (category) => `Crea un prompt detallado y listo para copiar para la solicitud del usuario sobre ${category}.`,
    context: {
      idea: "Idea del usuario",
      category: "Categoría",
      target: "Modelo objetivo",
      format: "Formato solicitado",
      depth: "Nivel de detalle",
      language: "Idioma detectado/solicitado"
    },
    smartConstraints: [
      "Infiere el objetivo, la audiencia y el criterio de éxito.",
      "Si faltan detalles, agrega supuestos editables.",
      "Separa contexto, tarea, restricciones y formato de salida.",
      "Haz que el prompt esté listo para copiar y pegar.",
      "No inventes hechos; marca los supuestos."
    ],
    outputContract: (format, languageName) => [
      `Escribe el prompt generado en ${languageName}.`,
      "Usa títulos claros y una checklist final."
    ],
    examples: (idea) => [`Idea de entrada: "${idea}"`, "Salida: prompt estructurado y listo para usar."],
    success: ["El prompt es específico, útil y listo para pegar."],
    image: {
      intro: "Prompt de imagen",
      positive: "Prompt positivo",
      negative: "Prompt negativo",
      descriptors: ["sujeto claro", "acción definida", "entorno específico", "iluminación cuidada", "composición limpia", "alto detalle"],
      natural: (idea, descriptors) => `Crea una imagen detallada de ${idea}, con ${descriptors.join(", ")}.`
    },
    videoIntro: (model) => model.type === "video" ? `Crea un prompt de video para ${model.label}.` : "Crea un guion y lista de tomas.",
    musicLanguage: "Idioma"
  }
};

COPY.es.tone = COPY.en.tone;
COPY.es.length = COPY.en.length;
COPY.es.reasoning = COPY.en.reasoning;
COPY.es.format = COPY.en.format;

const languageNames = {
  en: "English",
  pt: "português brasileiro",
  es: "español"
};

const visualModifiers = {
  en: [
    ["cinematic editorial lighting with controlled contrast", "visible fur and fabric micro-texture", "balanced framing with a premium campaign feel"],
    ["soft studio light with realistic shadows", "precise details in the face and clothing", "subtle background separation without visual clutter"],
    ["dramatic rim light and clear silhouette", "polished commercial photography look", "natural color harmony with crisp subject separation"],
    ["immersive scene depth", "volumetric light kept subtle and realistic", "carefully directed color palette"]
  ],
  pt: [
    ["iluminação editorial cinematográfica com contraste controlado", "microtexturas visíveis no pelo e no tecido", "enquadramento premium com aparência de campanha"],
    ["luz suave de estúdio com sombras realistas", "detalhes precisos no rosto e na roupa", "separação sutil do fundo sem poluição visual"],
    ["luz de recorte dramática e silhueta bem definida", "acabamento de fotografia comercial polida", "harmonia natural de cores com sujeito destacado"],
    ["profundidade de cena imersiva", "iluminação volumétrica sutil e realista", "paleta de cores cuidadosamente dirigida"]
  ],
  es: [
    ["iluminación editorial cinematográfica con contraste controlado", "microtexturas visibles en pelo y tela", "encuadre premium de campaña"],
    ["luz suave de estudio con sombras realistas", "detalles precisos en rostro y ropa", "separación sutil del fondo"]
  ]
};

function detectLanguage(text) {
  const normalized = ` ${text.toLowerCase()} `;
  const strongPtWords = [" gato ", " gatinho ", " camiseta ", " camisa ", " brasil ", " brasileiro ", " brasileira ", " do ", " da ", " dos ", " das ", " cobrança ", " cobranca ", " cliente ", " clientes ", " whatsapp ", " escreva ", " loja ", " minha ", " meu ", " nova ", " novo ", " anuncie ", " anúncio ", " anuncio "];
  const strongEsWords = [" gato ", " camiseta ", " español ", " español ", " del ", " de la ", " clientes "];
  if (strongPtWords.some((word) => normalized.includes(word))) return "pt";
  if (strongEsWords.some((word) => normalized.includes(word))) return "es";
  const ptWords = [" quero ", " você ", " voce ", " não ", " nao ", " para ", " uma ", " um ", " meu ", " minha ", " cliente ", " aplicativo ", " português ", " portugues ", " como ", " com ", " que ", " isso ", " ideia ", " faça ", " faca ", " criar ", " gerar ", " escreva ", " fazer ", " faz "];
  const esWords = [" quiero ", " para ", " una ", " cliente ", " aplicación ", " aplicacion ", " español ", " como ", " con ", " que ", " esto ", " idea ", " crear ", " generar "];
  const ptAccent = /[ãõçáéíóúàâêô]/i.test(text) ? 3 : 0;
  const esAccent = /[ñ¿¡]/i.test(text) ? 3 : 0;
  const ptScore = ptAccent + ptWords.filter((word) => normalized.includes(word)).length;
  const esScore = esAccent + esWords.filter((word) => normalized.includes(word)).length;
  if (ptScore >= 2 && ptScore >= esScore) return "pt";
  if (esScore >= 2 && esScore > ptScore) return "es";
  return "en";
}

function outputLanguage(outputLang, idea) {
  return outputLang === "match" ? detectLanguage(idea) : outputLang;
}

function isVisualRequest(idea) {
  const textCommand = /\b(escreva|escrever|redija|faça um post|faca um post|crie um post|post|legenda|caption|copy|texto|mensagem|email|e-mail|thread|tweet|carrossel|publica[cç][aã]o|roteiro)\b/i;
  const explicitVisual = /\b(imagem|foto|fotografia|hiper\s*realista|hiper-realista|realista|avatar|perfil|retrato|arte|desenho|ilustra[cç][aã]o|image|photo|photograph|realistic|avatar|portrait|artwork)\b/i;
  const visualSignal = /\b(imagem|foto|fotografia|hiper\s*realista|hiper-realista|realista|avatar|perfil|retrato|arte|desenho|ilustra[cç][aã]o|personagem|refer[êe]ncia|anexo|cen[áa]rio|mundo|game|jogo|gato|gatinho|cachorro|cão|cao|pessoa|homem|mulher|crian[cç]a|animal|rob[oô]|carro|moto|produto|image|photo|photograph|realistic|avatar|portrait|artwork|character|reference|world|game|cat|dog|person|man|woman|child|animal|robot|car|product)\b/i;
  const visualAction = /\b(ficar|colocar|botar|p[oô]r|aparecer|estar|posar|juntar|transformar|criar)\b.*\b(ao lado|do lado|junto|perto|com|no mundo|na cena|cen[áa]rio)\b/i;
  const sceneAction = /\b(tocando|tocar|cantando|dan[cç]ando|correndo|pulando|segurando|usando|vestindo|sorrindo|sentado|voando|comendo|bebendo|jogando|dirigindo|andando|olhando|playing|singing|dancing|running|jumping|holding|wearing|smiling|sitting|flying)\b/i;
  const gameReference = /\b(free fire|ff|personagem|skin|avatar)\b/i;
  const shortConcreteScene = visualSignal.test(idea) && sceneAction.test(idea) && idea.trim().split(/\s+/).length <= 18;
  if (textCommand.test(idea) && !explicitVisual.test(idea)) return false;
  return explicitVisual.test(idea) || visualAction.test(idea) || shortConcreteScene || (gameReference.test(idea) && /\b(refer[êe]ncia|mundo|ao lado|do lado|ficar|colocar|botar)\b/i.test(idea));
}

function copyFor(language) {
  return COPY[language] || COPY.en;
}

function templateName(template, language) {
  if (language === "pt") return template.name_pt || template.name_en;
  return template.name_en;
}

function examplesFor(template, options, copy) {
  if (!options.flags.examples) return [];
  if (options.outputLang !== "match" && options.outputLang === "en" && template.examples?.length) {
    return template.examples;
  }
  return copy.examples(options.idea);
}

function successFor(template, options, language, copy) {
  if (!options.flags.success) return [];
  if (language === "en" && template.success?.length) return [...template.success, ...copy.success];
  return copy.success;
}

function directRole(template, language, category, toneLine) {
  if (language === "pt") {
    return `Você é um(a) especialista sênior em ${category}, com criatividade, bom senso prático e foco em entregar o melhor resultado final possível. ${toneLine}`;
  }
  if (language === "es") {
    return `Eres un especialista senior en ${category}, con creatividad, criterio práctico y enfoque en entregar el mejor resultado final posible. ${toneLine}`;
  }
  return `${template.role} ${toneLine}`;
}

function directTask(options, language, category, template) {
  const idea = cleanIdeaText(options.idea);
  if (language === "pt") {
    return `Execute diretamente este pedido do usuário: "${idea}". Entregue o resultado final solicitado dentro da categoria ${category}.`;
  }
  if (language === "es") {
    return `Ejecuta directamente esta solicitud del usuario: "${idea}". Entrega el resultado final solicitado dentro de la categoría ${category}.`;
  }
  return `${template.task}\n\nUser request to execute directly: "${idea}".`;
}

function directConstraints(options, language, copy) {
  const base = language === "pt"
    ? [
      "Não crie outro prompt e não explique como criar um prompt. Execute a tarefa do usuário diretamente.",
      "Se o pedido mencionar uma imagem, arquivo ou referência que ainda será enviada, peça esse anexo e diga exatamente como ele será usado.",
      "Se faltar uma informação essencial, faça no máximo 3 perguntas objetivas. Se não for essencial, assuma um caminho razoável e siga.",
      "Entregue algo pronto para uso, com detalhes concretos e sem enrolação.",
      "Não invente dados pessoais, marcas, números ou fatos que o usuário não forneceu. Quando precisar, marque como suposição."
    ]
    : language === "es"
      ? [
        "No crees otro prompt ni expliques cómo crear un prompt. Ejecuta directamente la tarea del usuario.",
        "Si la solicitud menciona una imagen, archivo o referencia que aún será enviada, pide ese material y explica cómo lo usarás.",
        "Si falta información esencial, haz como máximo 3 preguntas concretas. Si no es esencial, asume algo razonable y continúa.",
        "Entrega algo listo para usar, con detalles concretos y sin relleno.",
        "No inventes datos personales, marcas, números ni hechos que el usuario no proporcionó."
      ]
      : [
        "Do not create another prompt and do not explain how to create a prompt. Execute the user's task directly.",
        "If the request mentions an image, file, or reference that will be sent later, ask for that attachment and explain exactly how it will be used.",
        "If essential information is missing, ask at most 3 focused questions. If it is not essential, make a reasonable assumption and continue.",
        "Deliver something ready to use, with concrete details and no filler.",
        "Do not invent personal data, brands, numbers, or facts the user did not provide. Mark assumptions clearly."
      ];

  return [
    ...base,
    copy.length[options.length] || copy.length.balanced,
    copy.reasoning[options.reasoning] || copy.reasoning.direct
  ];
}

function directOutputContract(format, language, copy) {
  if (language === "pt") {
    return [
      copy.format[format] || copy.format.markdown,
      "Escreva a resposta final em português brasileiro.",
      "Entregue apenas o conteúdo útil para o usuário, sem prefácio desnecessário.",
      "Se fizer perguntas por falta de anexo ou referência, deixe claro o próximo passo."
    ];
  }
  if (language === "es") {
    return [
      copy.format[format] || copy.format.markdown,
      "Escribe la respuesta final en español.",
      "Entrega solo el contenido útil para el usuario, sin prefacio innecesario.",
      "Si haces preguntas por falta de archivo o referencia, deja claro el siguiente paso."
    ];
  }
  return [
    copy.format[format] || copy.format.markdown,
    "Write the final answer in English.",
    "Deliver only the useful content for the user, with no unnecessary preface.",
    "If you ask for an attachment or reference, make the next step clear."
  ];
}

function directExamples(options, language) {
  if (!options.flags.examples) return [];
  if (language === "pt") {
    return [
      "Se o usuário pedir um post, entregue o post pronto.",
      "Se o usuário pedir uma análise, entregue a análise.",
      "Se o usuário pedir uma imagem baseada em uma referência, peça a imagem e descreva como irá usá-la."
    ];
  }
  if (language === "es") {
    return [
      "Si el usuario pide una publicación, entrega la publicación lista.",
      "Si el usuario pide un análisis, entrega el análisis.",
      "Si el usuario pide una imagen basada en una referencia, pide la imagen y explica cómo la usarás."
    ];
  }
  return [
    "If the user asks for a post, deliver the finished post.",
    "If the user asks for analysis, deliver the analysis.",
    "If the user asks for an image based on a reference, ask for the image and describe how it will be used."
  ];
}

function directSuccessCriteria(language) {
  if (language === "pt") {
    return [
      "A resposta executa o pedido do usuário diretamente.",
      "Não há instrução para gerar outro prompt.",
      "O resultado está no idioma do usuário e pronto para uso.",
      "Anexos ou referências pendentes são pedidos de forma clara quando necessários."
    ];
  }
  if (language === "es") {
    return [
      "La respuesta ejecuta directamente la solicitud del usuario.",
      "No hay instrucciones para generar otro prompt.",
      "El resultado está en el idioma del usuario y listo para usar.",
      "Los archivos o referencias pendientes se piden con claridad cuando hacen falta."
    ];
  }
  return [
    "The answer executes the user's request directly.",
    "There is no instruction to generate another prompt.",
    "The result is in the user's language and ready to use.",
    "Missing attachments or references are requested clearly when needed."
  ];
}

function buildTextPrompt(template, modelId, options) {
  const language = outputLanguage(options.outputLang, options.idea);
  const copy = copyFor(language);
  const model = getModel(modelId);
  const category = templateName(template, language);
  const role = directRole(template, language, category, copy.tone[options.tone] || copy.tone.professional);

  const core = {
    language,
    reasoning: options.reasoning,
    role,
    context: [
      `${copy.context.idea}: "${options.idea}"`,
      `${copy.context.category}: ${category}`,
      `${copy.context.target}: ${model.label}`,
      `${copy.context.format}: ${options.outputFormat}`,
      `${copy.context.depth}: ${options.length}`,
      `${copy.context.language}: ${languageNames[language] || copy.languageName}`
    ],
    task: directTask(options, language, category, template),
    constraints: directConstraints(options, language, copy),
    outputFormat: directOutputContract(options.outputFormat, language, copy),
    examples: directExamples(options, language),
    successCriteria: options.flags.success ? directSuccessCriteria(language) : []
  };

  return adaptForModel(core, modelId);
}

function pickVariation(language, variation) {
  const list = visualModifiers[language] || visualModifiers.en;
  return list[variation % list.length];
}

function cleanIdeaText(idea) {
  return idea
    .replace(/^\s*(eu\s+)?(quero|queria|gostaria de|preciso)\s+/i, "")
    .replace(/^\s*(faz|faça|faca|crie|criar|gere|gerar)\s+(uma\s+|um\s+)?(imagem|foto|fotografia|arte|retrato|avatar)\s*(hiper\s*realista|hiper-realista|realista)?\s*(do|da|de)?\s*/i, "")
    .replace(/^\s*(faz|faça|faca|crie|criar|gere|gerar)\s+(um\s+|uma\s+)?(prompt\s+para\s+)?(imagem|foto|fotografia|arte|retrato|avatar)\s*(hiper\s*realista|hiper-realista|realista)?\s*(do|da|de)?\s*/i, "")
    .replace(/\bque\s+(eu\s+)?vou\s+mandar\s+(a\s+)?(imagem|foto|refer[êe]ncia)\b/gi, "")
    .replace(/\bque\s+(eu\s+)?vou\s+enviar\s+(a\s+)?(imagem|foto|refer[êe]ncia)\b/gi, "")
    .replace(/\bque\s+(eu\s+)?mandei\s+(a\s+)?refer[êe]ncia\b/gi, "enviado como referência")
    .replace(/\bque\s+(eu\s+)?enviei\s+(a\s+)?refer[êe]ncia\b/gi, "enviado como referência")
    .replace(/\bcom\s+(a\s+)?(imagem|foto|refer[êe]ncia)\s+(que\s+)?(vou\s+)?(mandar|enviar)\b/gi, "")
    .replace(/\bque\s+ser[áa]\s+enviad[ao]\b/gi, "")
    .replace(/\bdp\b/gi, "do")
    .replace(/\bfree fire\b/gi, "Free Fire")
    .replace(/\bviolao\b/gi, "violão")
    .replace(/\buma gato\b/gi, "um gato")
    .replace(/\buma cachorro\b/gi, "um cachorro")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function imageInsight(idea, language) {
  const lower = idea.toLowerCase();
  const pt = language === "pt";
  const details = [];
  const scene = [];
  const camera = [];
  const style = [];

  if (/\b(gato|cat|gatinho)\b/.test(lower)) {
    details.push(pt ? "gato carismático com pelo bem definido, bigodes nítidos e olhar expressivo" : "charismatic cat with well-defined fur, sharp whiskers, and expressive eyes");
    camera.push(pt ? "foco nítido nos olhos do gato" : "sharp focus on the cat's eyes");
  }

  if (/\b(sorrindo|sorriso|smiling|smile)\b/.test(lower)) {
    details.push(pt ? "expressão alegre e natural, com boca levemente aberta de forma plausível para um gato, sem sorriso humano artificial" : "happy natural expression, slightly open mouth in a believable cat-like way, no artificial human smile");
  }

  if (/\b(viol[aã]o|guitarra|guitar)\b/.test(lower)) {
    details.push(pt ? "violão acústico com madeira realista, cordas visíveis, postura natural das patas no instrumento e sensação de performance musical" : "acoustic guitar with realistic wood, visible strings, natural paw placement on the instrument, and a musical performance feel");
    scene.push(pt ? "ambiente acolhedor de pequena apresentação musical, com luz quente suave e fundo organizado" : "cozy small musical performance setting with soft warm light and an organized background");
  }

  if (/\b(cachorro|dog|cão|cao)\b/.test(lower)) {
    details.push(pt ? "cachorro expressivo com textura realista no pelo" : "expressive dog with realistic fur texture");
    camera.push(pt ? "foco no rosto e na expressão" : "focus on the face and expression");
  }

  if (/\b(camisa|camiseta|uniforme|shirt|jersey)\b/.test(lower)) {
    details.push(pt ? "camiseta esportiva vestindo o corpo de forma natural, com dobras reais no tecido, gola visível e costuras discretas" : "sports shirt fitted naturally on the body, with real fabric folds, visible collar, and subtle seams");
  }

  if (/\b(brasil|brazil|brazilian|seleção|selecao)\b/.test(lower)) {
    details.push(pt ? "camiseta verde e amarela inspirada no uniforme do Brasil, com detalhes azuis discretos, sem logotipo oficial e sem texto legível" : "green and yellow shirt inspired by Brazil's uniform, with subtle blue details, no official logo, and no readable text");
    scene.push(pt ? "clima alegre de torcida brasileira, energia vibrante, bandeirinhas desfocadas e fundo festivo sutil" : "joyful Brazilian fan atmosphere, vibrant energy, blurred little flags, and subtle festive background");
  }

  if (/\b(produto|product|anúncio|anuncio|ad|poster)\b/.test(lower)) {
    scene.push(pt ? "composição com aparência de campanha premium, espaço limpo para leitura visual" : "premium campaign-like composition with clean visual hierarchy");
  }

  if (/\b(foto|fotografia|photograph|photo|realista|realistic)\b/.test(lower)) {
    style.push(pt ? "fotografia editorial realista, aparência de ensaio profissional, sem aspecto de ilustração" : "realistic editorial photography, professional photoshoot look, not an illustration");
    camera.push(pt ? "lente 85mm, profundidade de campo curta, bokeh suave no fundo" : "85mm lens, shallow depth of field, soft background bokeh");
  }

  if (/\b(retrato|portrait|perfil)\b/.test(lower)) {
    camera.push(pt ? "retrato em plano médio, fundo suave e profundidade de campo curta" : "medium portrait shot, soft background, shallow depth of field");
  }

  if (/\b(ficar|colocar|botar|p[oô]r|aparecer|estar|posar)\b.*\b(ao lado|do lado|junto|perto|com)\b|\b(ao lado|do lado)\b.*\b(personagem|avatar|character)\b/.test(lower)) {
    details.push(pt ? "integre a pessoa do usuário ao lado do personagem de referência, com escala corporal coerente, contato visual natural e iluminação combinando entre os dois" : "integrate the user beside the referenced character, with coherent body scale, natural eye contact, and matching lighting between both subjects");
    camera.push(pt ? "composição em dupla, ambos visíveis e equilibrados, sem cortar rosto, mãos ou elementos importantes" : "two-subject composition, both visible and balanced, without cropping faces, hands, or important elements");
  }

  if (/\b(free fire|ff)\b/.test(lower)) {
    details.push(pt ? "estética gamer inspirada em avatar de Free Fire, com visual heroico, competitivo e pronto para foto de perfil" : "gamer aesthetic inspired by a Free Fire avatar, heroic, competitive, and ready for a profile picture");
    scene.push(pt ? "fundo com atmosfera de lobby de jogo competitivo, partículas de energia discretas, luz azul e laranja equilibrada" : "competitive game lobby atmosphere in the background, subtle energy particles, balanced blue and orange lighting");
    camera.push(pt ? "enquadramento de avatar, rosto e torso bem destacados, leitura forte mesmo em tamanho pequeno" : "avatar framing, face and torso emphasized, readable even at small profile-picture size");
  }

  if (/\b(vou mandar|vou enviar|mandei|enviei|imagem enviada|foto enviada|referência|referencia|anexo|perfil)\b/.test(lower)) {
    details.push(pt ? "use a imagem enviada como referência principal de aparência, identidade visual, cores e elementos importantes, sem copiar defeitos ou baixa qualidade do arquivo original" : "use the uploaded image as the main reference for appearance, visual identity, colors, and important elements, without copying defects or low quality from the source file");
  }

  if (/\b(mundo dele|mundo do jogo|no mundo|cen[áa]rio|universo)\b/.test(lower)) {
    scene.push(pt ? "coloque a cena dentro do universo visual do jogo, com ambiente imersivo, profundidade cinematográfica, props discretos e sensação de estar dentro daquele mundo" : "place the scene inside the game's visual universe, with an immersive environment, cinematic depth, subtle props, and a feeling of being inside that world");
  }

  return { details, scene, camera, style };
}

function isSideBySideReference(idea) {
  return /\b(ficar|colocar|botar|p[oô]r|aparecer|estar|posar)\b.*\b(ao lado|do lado|junto|perto|com)\b|\b(ao lado|do lado)\b.*\b(personagem|avatar|character)\b/i.test(idea);
}

function hasReferenceImage(idea) {
  return /\b(vou mandar|vou enviar|mandei|enviei|imagem enviada|foto enviada|refer[êe]ncia|anexo)\b/i.test(idea);
}

function imageSubjectFromIdea(originalIdea, cleanedIdea, language) {
  const lower = originalIdea.toLowerCase();
  const pt = language === "pt";

  if (/\b(free fire|ff)\b/.test(lower) && /\b(personagem|avatar|skin)\b/.test(lower) && isSideBySideReference(originalIdea)) {
    return pt
      ? "a pessoa da foto do usuário ao lado do personagem do Free Fire enviado como referência, dentro do mundo do jogo"
      : "the person from the user's photo beside the referenced Free Fire character inside the game world";
  }

  if (hasReferenceImage(originalIdea) && /\b(personagem|avatar|character)\b/.test(lower)) {
    return pt
      ? "a pessoa da foto do usuário junto ao personagem enviado como referência"
      : "the person from the user's photo together with the referenced character";
  }

  return cleanedIdea;
}

function imageOpening(originalIdea, language) {
  const cleanedIdea = cleanIdeaText(originalIdea);
  const subject = imageSubjectFromIdea(originalIdea, cleanedIdea, language);
  const lower = originalIdea.toLowerCase();
  const pt = language === "pt";

  if (pt && /\b(free fire|ff)\b/.test(lower) && isSideBySideReference(originalIdea)) {
    return "Use a foto do usuário e a referência do personagem anexadas. Crie uma imagem hiper-realista em que a pessoa da foto apareça ao lado do personagem do Free Fire, dentro do mundo dele, como se os dois estivessem realmente na mesma cena do jogo.";
  }

  if (!pt && /\b(free fire|ff)\b/.test(lower) && isSideBySideReference(originalIdea)) {
    return "Use the user's photo and the attached character reference. Create a hyper-realistic image where the person from the photo appears beside the Free Fire character, inside that character's world, as if both are truly in the same game scene.";
  }

  if (pt && hasReferenceImage(originalIdea)) {
    return `Use a imagem enviada como referência principal. Crie uma imagem detalhada de ${subject}.`;
  }

  if (!pt && hasReferenceImage(originalIdea)) {
    return `Use the uploaded image as the main reference. Create a detailed image of ${subject}.`;
  }

  return pt
    ? `Crie uma imagem detalhada de ${subject}.`
    : `Create a detailed image of ${subject}.`;
}

function promptInstruction(part) {
  return part.replace(/^[^:]{1,34}:\s*/, "");
}

function detailedImageParts(options, language, copy) {
  const idea = cleanIdeaText(options.idea);
  const subjectText = imageSubjectFromIdea(options.idea, idea, language);
  const modifiers = pickVariation(language, options.variation);
  const insight = imageInsight(options.idea, language);
  const pt = language === "pt";

  const subject = pt
    ? `Sujeito principal: ${subjectText}, tratado como o elemento central da cena, com leitura imediata do que está acontecendo`
    : `Main subject: ${subjectText}, treated as the central element of the scene`;

  const action = pt
    ? "Pose/ação: o sujeito deve parecer vivo e intencional, olhando para a câmera ou levemente de lado, com postura natural e expressão marcante"
    : "Pose/action: natural, expressive posture with clear body language";

  const setting = pt
    ? "Ambiente: cenário coerente com a ideia, com profundidade, elementos de apoio discretos e fundo sem poluição visual"
    : "Setting: coherent environment with depth, subtle supporting props, and an uncluttered background";

  const lighting = pt
    ? "Iluminação: luz principal suave de estúdio, recorte azul sutil nas bordas, sombras controladas e brilho natural no olhar"
    : "Lighting: soft key light, subtle blue rim light, and enough contrast to separate the subject";

  const style = pt
    ? "Estilo: acabamento editorial premium, textura realista, cores limpas, aparência de foto bem dirigida e pronta para capa ou divulgação"
    : "Style: premium editorial finish, realistic texture, clean colors, ready for cover art or promotion";

  const camera = pt
    ? "Câmera/composição: plano médio ou close bem balanceado, sujeito ocupando o centro visual, foco no ponto mais importante e profundidade de campo controlada"
    : "Camera/composition: balanced framing, focus on the most important point, controlled depth of field";

  const quality = pt
    ? "Qualidade: alto nível de detalhe, bordas limpas, anatomia coerente, sem texto acidental, sem marcas d'água"
    : "Quality: high detail, clean edges, coherent anatomy, no accidental text, no watermark";

  return unique([
    subject,
    ...insight.details,
    action,
    setting,
    ...insight.scene,
    lighting,
    ...insight.style,
    style,
    camera,
    ...insight.camera,
    ...modifiers,
    quality
  ]);
}

function buildImagePrompt(modelId, options) {
  const language = outputLanguage(options.outputLang, options.idea);
  const copy = copyFor(language);
  const model = getModel(modelId);
  const parts = detailedImageParts(options, language, copy);
  const instructions = parts.map(promptInstruction);
  const opening = imageOpening(options.idea, language);
  const pt = language === "pt";
  const negativeText = pt
    ? "borrado, baixa resolução, anatomia errada, mãos ou patas deformadas, olhos desalinhados, texto acidental, logotipo, marca d'água, excesso de ruído, composição confusa"
    : "blurry, low resolution, bad anatomy, deformed hands or paws, misaligned eyes, accidental text, logo, watermark, excessive noise, messy composition";

  if (model.id === "midjourney") {
    return `${parts.join(", ")} --ar 4:5 --style raw --stylize 120 --v 7`;
  }

  if (model.id === "sd-flux") {
    const negative = options.flags.negative
      ? `\n\n${copy.image.negative}: ${negativeText}`
      : "";
    return `${copy.image.positive}: ${parts.join(", ")}${negative}`;
  }

  if (model.id === "dalle") {
    return pt
      ? `${opening} ${instructions.join(". ")}. A imagem deve parecer intencional, bem dirigida e pronta para uso visual, sem texto acidental ou elementos confusos.`
      : `${opening} ${instructions.join(". ")}. The image should feel intentional, well-directed, and ready for visual use, with no accidental text or confusing elements.`;
  }

  return [
    opening,
    pt
      ? `\nDetalhes obrigatórios:\n${instructions.map((part) => `- ${part}`).join("\n")}`
      : `\nRequired details:\n${instructions.map((part) => `- ${part}`).join("\n")}`,
    options.flags.negative
      ? `\n${pt ? "Evite" : copy.image.negative}: ${negativeText}`
      : ""
  ].filter(Boolean).join("\n\n");
}

function buildVideoPrompt(modelId, options) {
  const language = outputLanguage(options.outputLang, options.idea);
  const copy = copyFor(language);
  const model = getModel(modelId);
  if (language === "pt") {
    return `${copy.videoIntro(model)}

Conceito: ${options.idea}
Tom: ${copy.tone[options.tone] || copy.tone.professional}
Idioma da resposta: ${copy.languageName}

[Cena 1 | 0-3s]
Enquadramento: close ou plano médio com um gancho visual forte.
Ação: apresente a ideia central imediatamente.
Câmera: aproximação sutil ou movimento manual controlado.
Luz: contraste claro, sujeito legível e ponto focal evidente.

[Cena 2 | 3-8s]
Enquadramento: plano mais aberto para contexto.
Ação: mostre o problema, transformação ou virada visual.
Câmera: movimento lateral suave ou corte seco.
Luz: consistente com a Cena 1.

[Cena 3 | 8-15s]
Enquadramento: detalhe ou revelação final.
Ação: entregue o payoff ou chamada para ação.
Câmera: estável para clareza.
Transição: corte limpo ou match cut rápido.

Restrições:
- Cada cena deve ser concreta e possível de filmar ou gerar.
- Os três primeiros segundos precisam segurar a atenção.
- Verifique sujeito, ação, ambiente, clima, luz, câmera, duração e transição antes de finalizar.`;
  }

  return `${copy.videoIntro(model)}

Concept: ${options.idea}
Tone: ${copy.tone[options.tone] || copy.tone.professional}
Output language: ${languageNames[language] || copy.languageName}

[Shot 1 | 0-3s]
Framing: close or medium shot with a strong visual hook.
Action: introduce the core idea immediately.
Camera: subtle push-in or motivated handheld movement.
Lighting: high-contrast, readable subject, clear focal point.

[Shot 2 | 3-8s]
Framing: wider context shot.
Action: show the problem, transformation, or key visual beat.
Camera: smooth lateral move or clean cut.
Lighting: consistent with Shot 1.

[Shot 3 | 8-15s]
Framing: detail shot or reveal.
Action: deliver the payoff or CTA.
Camera: hold steady for clarity.
Transition: clean cut or quick match cut.

Constraints:
- Keep each shot filmable and specific.
- Make the first three seconds impossible to scroll past.
- Verify that subject, action, setting, mood, light, camera movement, and duration are all explicit.`;
}

function buildMusicPrompt(options) {
  const language = outputLanguage(options.outputLang, options.idea);
  const copy = copyFor(language);
  if (language === "pt") {
    return `[Estilo]
Gênero: synth-pop com produção moderna, ajustável à ideia.
Tempo: energia média, 105-122 BPM.
Clima: ${copy.tone[options.tone] || copy.tone.professional}
Instrumentos: baixo de synth quente, bateria nítida, melodia principal brilhante, textura opcional de guitarra.
Voz: vocal principal expressivo, refrão memorável, produção limpa.
Tema: ${options.idea}
${copy.musicLanguage}: ${copy.languageName}

[Letra]
[Verso 1]
Apresente a cena de "${options.idea}" com imagens concretas e movimento.

[Pré-Refrão]
Construa tensão com uma virada emocional simples.

[Refrão]
Escreva um gancho repetível que capture a ideia principal em uma frase forte.

[Verso 2]
Adicione um novo detalhe, consequência ou contraste.

[Ponte]
Mude a perspectiva ou aumente o risco emocional.

[Final]
Repita o gancho com um encerramento limpo.`;
  }

  return `[Style]
Genre: synth-pop with modern polish, adjustable to the idea.
Tempo: medium energy, 105-122 BPM.
Mood: ${copy.tone[options.tone] || copy.tone.professional}
Instruments: warm synth bass, crisp drums, bright lead melody, optional guitar texture.
Vocals: expressive lead vocal, memorable chorus, clean production.
Theme: ${options.idea}
${copy.musicLanguage}: ${languageNames[language] || copy.languageName}

[Lyrics]
[Verse 1]
Set the scene around "${options.idea}" with concrete images and forward motion.

[Pre-Chorus]
Build tension with a simple emotional turn.

[Chorus]
Write a repeatable hook that captures the main idea in one strong phrase.

[Verse 2]
Add a new detail, consequence, or contrast.

[Bridge]
Change the perspective or raise the stakes.

[Outro]
Repeat the hook with a clean ending.`;
}

export function buildPrompt(options) {
  const template = getTemplate(options.categoryId);
  const model = getModel(options.modelId);

  if (!options.idea.trim()) {
    throw new Error("Type an idea first.");
  }

  if (template.type === "image" || model.type === "image") {
    return buildImagePrompt(model.id, options);
  }

  if (isVisualRequest(options.idea)) {
    return buildImagePrompt("generic", options);
  }

  if (template.type === "video" || model.type === "video") {
    return buildVideoPrompt(model.id, options);
  }

  if (template.type === "music" || model.type === "music") {
    return buildMusicPrompt(options);
  }

  return buildTextPrompt(template, model.id, options);
}
