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
  const strongPtWords = [" gato ", " gatinho ", " camiseta ", " camisa ", " brasil ", " brasileiro ", " brasileira ", " do ", " da ", " dos ", " das ", " cobrança ", " cobranca ", " cliente ", " clientes ", " whatsapp "];
  const strongEsWords = [" gato ", " camiseta ", " español ", " español ", " del ", " de la ", " clientes "];
  if (strongPtWords.some((word) => normalized.includes(word))) return "pt";
  if (strongEsWords.some((word) => normalized.includes(word))) return "es";
  const ptWords = [" quero ", " você ", " voce ", " não ", " nao ", " para ", " uma ", " meu ", " minha ", " cliente ", " aplicativo ", " português ", " portugues ", " como ", " com ", " que ", " isso ", " ideia ", " faça ", " faca ", " criar ", " gerar "];
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

function buildTextPrompt(template, modelId, options) {
  const language = outputLanguage(options.outputLang, options.idea);
  const copy = copyFor(language);
  const model = getModel(modelId);
  const category = templateName(template, language);
  const role = language === "en"
    ? `${template.role} ${copy.tone[options.tone] || copy.tone.professional}`
    : `${copy.roleFor(category)} ${copy.tone[options.tone] || copy.tone.professional}`;

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
    task: language === "en" ? template.task : copy.taskFor(category),
    constraints: [
      ...copy.smartConstraints,
      copy.length[options.length] || copy.length.balanced,
      copy.reasoning[options.reasoning] || copy.reasoning.direct
    ],
    outputFormat: copy.outputContract(options.outputFormat, languageNames[language] || copy.languageName),
    examples: examplesFor(template, options, copy),
    successCriteria: successFor(template, options, language, copy)
  };

  return adaptForModel(core, modelId);
}

function pickVariation(language, variation) {
  const list = visualModifiers[language] || visualModifiers.en;
  return list[variation % list.length];
}

function cleanIdeaText(idea) {
  return idea
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

  return { details, scene, camera, style };
}

function detailedImageParts(options, language, copy) {
  const idea = cleanIdeaText(options.idea);
  const modifiers = pickVariation(language, options.variation);
  const insight = imageInsight(options.idea, language);
  const pt = language === "pt";

  const subject = pt
    ? `Sujeito principal: ${idea}, tratado como o elemento central da cena, com leitura imediata do que está acontecendo`
    : `Main subject: ${idea}, treated as the central element of the scene`;

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
  const idea = cleanIdeaText(options.idea);
  const parts = detailedImageParts(options, language, copy);
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
      ? `Crie uma imagem detalhada de ${idea}. ${parts.join(". ")}. A imagem deve parecer intencional, bem dirigida e pronta para uso visual, sem texto acidental ou elementos confusos.`
      : `Create a detailed image of ${idea}. ${parts.join(". ")}. The image should feel intentional, well-directed, and ready for visual use, with no accidental text or confusing elements.`;
  }

  return [
    `${copy.image.intro}:`,
    pt
      ? `Crie uma imagem forte e específica com a seguinte direção visual:\n\n${parts.map((part) => `- ${part}`).join("\n")}`
      : `Create a strong, specific image using this visual direction:\n\n${parts.map((part) => `- ${part}`).join("\n")}`,
    options.flags.negative
      ? `\n${copy.image.negative}: ${negativeText}`
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

  if (template.type === "video" || model.type === "video") {
    return buildVideoPrompt(model.id, options);
  }

  if (template.type === "music" || model.type === "music") {
    return buildMusicPrompt(options);
  }

  return buildTextPrompt(template, model.id, options);
}
