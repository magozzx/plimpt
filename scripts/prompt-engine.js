// prompt-engine.js
// =============================================================================
// Cérebro do gerador de prompts.
//
// O que este arquivo resolve (a dor que você descreveu):
//   "a pessoa escreve qualquer coisa e o app ajusta isso no formato ideal
//    para a IA selecionada, nos mínimos detalhes."
//
// Para isso existem 3 camadas, da mais simples à mais "inteligente":
//
//   1) COPY ............... base de conhecimento (tom, tamanho, raciocínio,
//                            formato, regras, e blocos por modalidade:
//                            imagem, vídeo, música). Superset 100% compatível
//                            com o seu COPY atual (mesmas chaves + extras).
//
//   2) MODEL_GUIDES ....... a "língua" de cada modelo (Midjourney, Flux, SD,
//                            DALL-E/GPT Image, Ideogram / Veo, Kling, Runway,
//                            Sora, Pika / Suno, Udio / GPT, Claude, Gemini).
//                            Sintaxe, receita de ordem, forças, parâmetros,
//                            negativos e exemplo — porque o que funciona num
//                            modelo é ruim em outro.
//
//   3) buildMetaPrompt() .. a camada de INTELIGÊNCIA. Recebe a ideia crua +
//                            as escolhas do usuário + o guia do modelo alvo e
//                            devolve { system, user } para você mandar a uma
//                            LLM forte, que reescreve a ideia num prompt
//                            profissional, pronto pra colar. É isto que faz o
//                            app "ajustar qualquer coisa nos mínimos detalhes".
//
//   composeFallbackPrompt() montador 100% local (sem chamar IA). Útil como
//                            preview instantâneo e fallback offline.
//
// Nada aqui importa models.js / templates.js, então este módulo não pode
// quebrar o resto do app. Você pode adotar aos poucos.
//
// OBS: o ecossistema de modelos muda rápido. Os guias refletem o cenário de
// início/meados de 2026. Confirme nomes/versões/disponibilidade antes de
// fixar como verdade no produto (ex.: a disponibilidade do Sora estava
// mudando em 2026).
// =============================================================================


// -----------------------------------------------------------------------------
// 1) GUIAS POR MODELO
// -----------------------------------------------------------------------------
// Estrutura: MODEL_GUIDES[type][id] = { en: {...}, pt: {...} }
// Campos: syntax, recipe, strengths, params, negatives, example
export const MODEL_GUIDES = {
  image: {
    midjourney: {
      en: {
        syntax: "Comma-separated descriptors ordered by visual importance; short, high-signal phrases (not full sentences).",
        recipe: "subject + action -> medium/style -> lighting -> composition + lens -> mood -> then --parameters.",
        strengths: "Best-in-class aesthetics, mood and stylization; character/style consistency via Omni Reference.",
        params: "--ar (aspect), --s/--stylize (0-1000), --c/--chaos (0-100), --q (quality), --style raw, --v 7; put short on-image text in quotes like 'OPEN'.",
        negatives: "Exclude with --no x (e.g. --no text, --no blur). Keep the prompt tight; long prose hurts it.",
        example: "cinematic portrait of an elderly fisherman, weathered skin, golden-hour rim light, shallow depth of field, 85mm, moody --ar 4:5 --s 250 --style raw --v 7",
      },
      pt: {
        syntax: "Descritores separados por vírgula, ordenados por importância visual; frases curtas e de alto sinal (não frases completas).",
        recipe: "sujeito + ação -> meio/estilo -> iluminação -> composição + lente -> mood -> depois os --parâmetros.",
        strengths: "Estética, mood e estilização de primeira; consistência de personagem/estilo via Omni Reference.",
        params: "--ar (proporção), --s/--stylize (0-1000), --c/--chaos (0-100), --q (qualidade), --style raw, --v 7; texto curto na imagem entre aspas, ex.: 'OPEN'.",
        negatives: "Exclua com --no x (ex.: --no text, --no blur). Mantenha enxuto; prosa longa atrapalha.",
        example: "retrato cinematográfico de um pescador idoso, pele marcada, rim light de golden hour, profundidade rasa, 85mm, mood --ar 4:5 --s 250 --style raw --v 7",
      },
    },
    flux: {
      en: {
        syntax: "Natural language, full descriptive sentences. NO --parameters.",
        recipe: "Describe subject, setting, lighting, camera and mood in flowing, coherent prose.",
        strengths: "Top photorealism; accurate humans and legible text.",
        params: "None. If porting from Midjourney, delete every --flag.",
        negatives: "Avoid tag-soup; write real sentences. State what you DO want.",
        example: "A studio photograph of a ceramic coffee mug on oak wood, soft window light from the left, crisp focus, neutral background, true-to-life color.",
      },
      pt: {
        syntax: "Linguagem natural, frases descritivas completas. SEM --parâmetros.",
        recipe: "Descreva sujeito, cenário, iluminação, câmera e mood em prosa fluida e coerente.",
        strengths: "Fotorrealismo de ponta; humanos e texto legíveis.",
        params: "Nenhum. Se trouxer um prompt do Midjourney, apague todos os --flags.",
        negatives: "Evite sopa de tags; escreva frases. Diga o que VOCÊ QUER.",
        example: "Fotografia de estúdio de uma caneca de cerâmica sobre madeira de carvalho, luz suave de janela vindo da esquerda, foco nítido, fundo neutro, cor fiel.",
      },
    },
    stableDiffusion: {
      en: {
        syntax: "Comma-separated weighted keyword tags; supports attention weights.",
        recipe: "quality boosters -> subject -> attributes -> style -> lighting -> camera; emphasize with (token:1.3).",
        strengths: "Open, fully controllable, runs locally; rich LoRA/ControlNet ecosystem.",
        params: "Use the separate Negative-prompt field; tune CFG and steps in the UI.",
        negatives: "Negative prompt e.g. 'lowres, extra fingers, watermark, blurry, deformed'.",
        example: "(masterpiece:1.2), portrait of a knight, ornate steel armor, volumetric light, rim light, 50mm, sharp focus",
      },
      pt: {
        syntax: "Tags de palavra-chave separadas por vírgula, com pesos de atenção.",
        recipe: "reforços de qualidade -> sujeito -> atributos -> estilo -> iluminação -> câmera; enfatize com (token:1.3).",
        strengths: "Aberto, controle total, roda local; ecossistema forte de LoRA/ControlNet.",
        params: "Use o campo separado de Negative prompt; ajuste CFG e steps na interface.",
        negatives: "Negative prompt, ex.: 'lowres, extra fingers, watermark, blurry, deformed'.",
        example: "(masterpiece:1.2), retrato de um cavaleiro, armadura de aço ornamentada, luz volumétrica, rim light, 50mm, foco nítido",
      },
    },
    dalle: {
      en: {
        syntax: "Conversational natural language; whole paragraphs; iterate by chatting (multi-turn edits).",
        recipe: "Describe the full scene clearly, then refine with follow-up edits.",
        strengths: "Best instruction-following for complex scenes; strong text-in-image.",
        params: "None; control via clear description and follow-up edits.",
        negatives: "Prefer positive description; it follows what you ask for well.",
        example: "A flat-design infographic poster titled 'Q3 RESULTS' with three clean bar charts, pastel palette, generous white space.",
      },
      pt: {
        syntax: "Linguagem natural conversacional; parágrafos inteiros; refine conversando (edições multi-turno).",
        recipe: "Descreva a cena completa com clareza e depois refine com pedidos seguintes.",
        strengths: "Melhor obediência a instruções em cenas complexas; texto na imagem forte.",
        params: "Nenhum; controle pela descrição clara e edições seguintes.",
        negatives: "Prefira descrição positiva; ele obedece bem ao que você pede.",
        example: "Pôster de infográfico flat-design com o título 'RESULTADOS Q3', três gráficos de barras limpos, paleta pastel, bastante espaço em branco.",
      },
    },
    ideogram: {
      en: {
        syntax: "Natural language with the exact words in quotes.",
        recipe: "Describe layout + put the literal text in quotes; specify the font vibe.",
        strengths: "Best typography and legible text-in-image; posters and logos.",
        params: "Aspect ratio + style presets in the UI.",
        negatives: "Keep on-image text short for the crispest result.",
        example: "Minimalist poster, the words 'STAY CURIOUS' in bold condensed sans, cream background, single centered line.",
      },
      pt: {
        syntax: "Linguagem natural com as palavras exatas entre aspas.",
        recipe: "Descreva o layout + coloque o texto literal entre aspas; defina o estilo da fonte.",
        strengths: "Melhor tipografia e texto legível na imagem; pôsteres e logos.",
        params: "Proporção + presets de estilo na interface.",
        negatives: "Mantenha o texto na imagem curto para o resultado mais nítido.",
        example: "Pôster minimalista, as palavras 'STAY CURIOUS' em sans condensada bold, fundo creme, uma linha centralizada.",
      },
    },
  },

  video: {
    veo: {
      en: {
        syntax: "Structured and detail-rich; responds to schema-like 'ingredient lists' and reference images.",
        recipe: "shot type -> subject + appearance -> action -> camera move -> lens -> lighting + time of day -> setting -> mood -> audio.",
        strengths: "Top prompt adherence, native audio, up to 4K; great establishing/narrative shots.",
        params: "Aspect + resolution in the UI; supply reference frames for consistency.",
        negatives: "Avoid contradictory camera directions inside a single shot.",
        example: "Establishing wide shot, snow-covered village at dawn, slow drone push-in, soft volumetric light, ambient wind and distant bells, cinematic, 4K.",
      },
      pt: {
        syntax: "Estruturado e detalhado; responde bem a 'listas de ingredientes' tipo schema e imagens de referência.",
        recipe: "tipo de plano -> sujeito + aparência -> ação -> movimento de câmera -> lente -> iluminação + hora do dia -> cenário -> mood -> áudio.",
        strengths: "Ótima aderência ao prompt, áudio nativo, até 4K; excelente em planos de estabelecimento/narrativos.",
        params: "Proporção + resolução na interface; forneça frames de referência para consistência.",
        negatives: "Evite direções de câmera contraditórias dentro de um mesmo plano.",
        example: "Plano aberto de estabelecimento, vilarejo coberto de neve ao amanhecer, push-in lento de drone, luz volumétrica suave, vento ambiente e sinos distantes, cinematográfico, 4K.",
      },
    },
    kling: {
      en: {
        syntax: "Timeline/storyboard friendly; describe motion beats; multi-shot mode (3-12 shots).",
        recipe: "per shot: framing -> subject -> motion -> camera (dolly/pan/orbit) -> transition; add audio cues.",
        strengths: "Best value; strong human motion; native audio + lip-sync; multi-shot continuity.",
        params: "Multi-Shot Storyboard; camera controls dolly/pan/orbit.",
        negatives: "Add 'crisp motion' to reduce blur on fast action.",
        example: "Shot 1: medium, a woman laughing, handheld; cut to Shot 2: close-up of hands pouring coffee, slow dolly-in; warm cafe ambience.",
      },
      pt: {
        syntax: "Bom para timeline/storyboard; descreva os beats de movimento; modo multi-shot (3-12 planos).",
        recipe: "por plano: enquadramento -> sujeito -> movimento -> câmera (dolly/pan/orbit) -> transição; inclua deixas de áudio.",
        strengths: "Melhor custo-benefício; movimento humano forte; áudio nativo + lip-sync; continuidade multi-shot.",
        params: "Multi-Shot Storyboard; controles de câmera dolly/pan/orbit.",
        negatives: "Adicione 'crisp motion' para reduzir o borrão em ação rápida.",
        example: "Plano 1: médio, uma mulher rindo, handheld; corta para Plano 2: close das mãos servindo café, dolly-in lento; ambiência quente de café.",
      },
    },
    runway: {
      en: {
        syntax: "Director-style; emphasize physics, weight and precise camera moves; use reference images.",
        recipe: "subject + physical action -> camera move -> lens -> speed/ramp -> lighting; use Motion Brush for local motion.",
        strengths: "Granular control, realistic physics, post-production fit, reference-driven consistency.",
        params: "Motion Brush, camera controls, image-to-video.",
        negatives: "Lower Motion-Brush strength if you get smear; add 'crisp motion'.",
        example: "Tracking shot following a cyclist along a wet street, tires spraying water, 35mm, overcast light, steady gimbal, realistic momentum.",
      },
      pt: {
        syntax: "Estilo direção; enfatize física, peso e movimentos de câmera precisos; use imagens de referência.",
        recipe: "sujeito + ação física -> movimento de câmera -> lente -> velocidade/ramp -> iluminação; use Motion Brush para movimento local.",
        strengths: "Controle granular, física realista, encaixe em pós-produção, consistência por referência.",
        params: "Motion Brush, controles de câmera, image-to-video.",
        negatives: "Reduza a força do Motion Brush se aparecer smear; adicione 'crisp motion'.",
        example: "Plano de tracking seguindo um ciclista numa rua molhada, pneus espirrando água, 35mm, luz nublada, gimbal estável, inércia realista.",
      },
    },
    sora: {
      en: {
        syntax: "World-logic / cause-and-effect prose; describe physics and consequences.",
        recipe: "describe the scene as a coherent mini-world: setup -> action -> realistic reaction -> camera.",
        strengths: "Photoreal clips with plausible physics and lighting.",
        params: "Check current availability/status before relying on it for production.",
        negatives: "Avoid impossible physics if you want realism.",
        example: "A glass tips at the table edge, falls, and shatters on tile as light refracts through the scattering shards; slow handheld push-in.",
      },
      pt: {
        syntax: "Prosa de lógica de mundo / causa e efeito; descreva física e consequências.",
        recipe: "descreva a cena como um mini-mundo coerente: setup -> ação -> reação realista -> câmera.",
        strengths: "Clipes fotorrealistas com física e iluminação plausíveis.",
        params: "Confirme disponibilidade/status atual antes de depender dele em produção.",
        negatives: "Evite física impossível se quiser realismo.",
        example: "Um copo inclina na beira da mesa, cai e se estilhaça no piso enquanto a luz refrata pelos cacos; push-in lento handheld.",
      },
    },
    pika: {
      en: {
        syntax: "Short, social-first prompts; effect-driven.",
        recipe: "subject + simple action + effect; great for talking-image content.",
        strengths: "Fast social clips, Pikaffects, lip-sync for talking images.",
        params: "Pikaffects / Pikaswaps / lip-sync in the UI.",
        negatives: "Keep scenes simple for the cleanest output.",
        example: "A photo of a fox that starts talking to camera, friendly tone, subtle head movement, cozy autumn background.",
      },
      pt: {
        syntax: "Prompts curtos, pensados para social; guiados por efeito.",
        recipe: "sujeito + ação simples + efeito; ótimo para 'imagem falante'.",
        strengths: "Clipes sociais rápidos, Pikaffects, lip-sync para imagens falantes.",
        params: "Pikaffects / Pikaswaps / lip-sync na interface.",
        negatives: "Mantenha as cenas simples para a saída mais limpa.",
        example: "Uma foto de uma raposa que começa a falar para a câmera, tom amigável, leve movimento de cabeça, fundo aconchegante de outono.",
      },
    },
  },

  music: {
    suno: {
      en: {
        syntax: "Two fields: Style (8-15 ordered tags) + Lyrics (with [Section] tags).",
        recipe: "Style: genre/subgenre -> mood/energy -> vocal persona -> key instruments + production -> BPM + key (negatives LAST). Lyrics: [Intro]/[Verse]/[Pre-Chorus]/[Chorus]/[Bridge]/[Outro], 2-6 lines per section, production notes in (parentheses).",
        strengths: "Full songs with vocals, several minutes long; stems; section editing.",
        params: "Style field is ~1000 chars in v5.5; use [no vocals] for instrumental.",
        negatives: "Put exclusions at the very END, e.g. 'no autotune, no harsh highs'.",
        example: "Style: indie folk-pop, warm and hopeful, breathy female vocal, fingerpicked acoustic guitar, soft strings, 92 BPM, key of G, polished organic mix, no autotune.",
      },
      pt: {
        syntax: "Dois campos: Estilo (8-15 tags ordenadas) + Letra (com tags de [Seção]).",
        recipe: "Estilo: gênero/subgênero -> mood/energia -> persona vocal -> instrumentos-chave + produção -> BPM + tom (negativos por ÚLTIMO). Letra: [Intro]/[Verse]/[Pre-Chorus]/[Chorus]/[Bridge]/[Outro], 2-6 linhas por seção, notas de produção entre (parênteses).",
        strengths: "Músicas completas com vocais, vários minutos; stems; edição por seção.",
        params: "O campo de estilo tem ~1000 caracteres no v5.5; use [no vocals] para instrumental.",
        negatives: "Coloque as exclusões bem no FINAL, ex.: 'no autotune, no harsh highs'.",
        example: "Estilo: indie folk-pop, quente e esperançoso, vocal feminino sussurrado, violão dedilhado, cordas suaves, 92 BPM, tom de Sol, mix orgânico polido, no autotune.",
      },
    },
    udio: {
      en: {
        syntax: "Style description + structured lyrics; tag-driven, similar to Suno.",
        recipe: "Describe genre -> mood -> vocals -> instrumentation -> production; structure lyrics by section.",
        strengths: "High audio fidelity; strong vocal realism; extend/remix.",
        params: "Keep style tags specific; use clear section structure.",
        negatives: "Exclude unwanted traits explicitly.",
        example: "Style: 90s neo-soul, smooth and intimate, male tenor with harmonies, Rhodes piano, live drums, warm analog mix, 78 BPM.",
      },
      pt: {
        syntax: "Descrição de estilo + letra estruturada; guiado por tags, parecido com o Suno.",
        recipe: "Descreva gênero -> mood -> vocais -> instrumentação -> produção; estruture a letra por seção.",
        strengths: "Alta fidelidade de áudio; realismo vocal forte; extend/remix.",
        params: "Mantenha as tags de estilo específicas; use estrutura de seções clara.",
        negatives: "Exclua traços indesejados explicitamente.",
        example: "Estilo: neo-soul anos 90, suave e intimista, tenor masculino com harmonias, piano Rhodes, bateria ao vivo, mix analógico quente, 78 BPM.",
      },
    },
  },

  text: {
    gpt: {
      en: {
        syntax: "Roles (system/developer/user); responds well to clear paragraphs and multi-turn edits.",
        recipe: "role + goal -> context -> constraints -> exact output contract -> 1-2 examples.",
        strengths: "Strong general reasoning, tool use, structured output.",
        params: "Use JSON / response-format modes for strict structure when available.",
        negatives: "Prefer positive instructions over long prohibition lists.",
        example: "You are a senior copy editor. Task: ... Constraints: ... Output: JSON with keys {title, body}.",
      },
      pt: {
        syntax: "Papéis (system/developer/user); responde bem a parágrafos claros e edições multi-turno.",
        recipe: "papel + objetivo -> contexto -> restrições -> contrato de saída exato -> 1-2 exemplos.",
        strengths: "Raciocínio geral forte, uso de ferramentas, saída estruturada.",
        params: "Use modos JSON / response-format para estrutura rígida quando houver.",
        negatives: "Prefira instruções positivas a listas longas de proibições.",
        example: "Você é um editor de texto sênior. Tarefa: ... Restrições: ... Saída: JSON com as chaves {titulo, corpo}.",
      },
    },
    claude: {
      en: {
        syntax: "Loves explicit structure and XML-style tags to separate sections.",
        recipe: "role -> <context> -> <task> -> <constraints> -> <output_format>; ask for step-by-step on hard tasks.",
        strengths: "Long, careful instructions; faithful formatting; nuanced writing.",
        params: "Wrap inputs in tags like <document>...</document>; request a final checklist.",
        negatives: "Avoid vague asks; state the success condition explicitly.",
        example: "<role>...</role><task>...</task><constraints>...</constraints><output_format>markdown</output_format>",
      },
      pt: {
        syntax: "Gosta de estrutura explícita e tags estilo XML para separar seções.",
        recipe: "papel -> <context> -> <task> -> <constraints> -> <output_format>; peça passo a passo em tarefas difíceis.",
        strengths: "Instruções longas e cuidadosas; formatação fiel; escrita com nuance.",
        params: "Coloque as entradas em tags como <document>...</document>; peça um checklist final.",
        negatives: "Evite pedidos vagos; declare a condição de sucesso explicitamente.",
        example: "<role>...</role><task>...</task><constraints>...</constraints><output_format>markdown</output_format>",
      },
    },
    gemini: {
      en: {
        syntax: "Handles very long context and multimodal input; likes structured prompts.",
        recipe: "context up front -> clear task -> explicit format; reference attached media directly.",
        strengths: "Long-context synthesis, multimodal grounding.",
        params: "Use system instructions + clearly labeled sections.",
        negatives: "Don't bury the instruction inside long context; state it clearly.",
        example: "Context: <docs>. Task: summarize into 5 bullets. Format: markdown bullets, max 15 words each.",
      },
      pt: {
        syntax: "Lida com contexto muito longo e entrada multimodal; gosta de prompts estruturados.",
        recipe: "contexto primeiro -> tarefa clara -> formato explícito; referencie a mídia anexada diretamente.",
        strengths: "Síntese de contexto longo, fundamentação multimodal.",
        params: "Use instruções de sistema + seções claramente rotuladas.",
        negatives: "Não enterre a instrução dentro do contexto longo; declare com clareza.",
        example: "Contexto: <docs>. Tarefa: resumir em 5 bullets. Formato: bullets markdown, máx 15 palavras cada.",
      },
    },
  },
};

// Pega o guia certo com fallback de idioma e de id.
export function getModelGuide(type, id, lang = "pt") {
  const bucket = MODEL_GUIDES[type];
  if (!bucket) return null;
  const entry = bucket[id] || bucket[Object.keys(bucket)[0]];
  if (!entry) return null;
  return entry[lang] || entry.en || null;
}


// -----------------------------------------------------------------------------
// 2) COPY  (superset compatível com o seu COPY atual)
// -----------------------------------------------------------------------------
export const COPY = {
  en: {
    languageName: "English",

    tone: {
      neutral: "Neutral, precise and plain-spoken. No hype, no filler.",
      professional: "Professional and polished, practical and confident.",
      friendly: "Warm, friendly and clear, like a helpful expert.",
      playful: "Playful and energetic, but still genuinely useful.",
      authoritative: "Authoritative, direct and decisive.",
      academic: "Academic, rigorous and well-structured, with precise terms.",
    },

    length: {
      concise: "Keep it compact: only the essential instructions, no padding.",
      balanced: "Balanced detail: enough structure to guide the model without bloat.",
      detailed: "Detailed: clear sections, edge cases and success criteria.",
      exhaustive: "Exhaustive: context slots, constraints, examples, validation steps and edge cases.",
    },

    reasoning: {
      direct: "Prefer a direct answer. Do not expose hidden reasoning.",
      step: "Work step by step before the final answer when the task benefits from it.",
      deep: "Analyze deeply, weigh options and tradeoffs, then present the final answer clearly.",
    },

    format: {
      prose: "Return polished prose in clear paragraphs.",
      markdown: "Return clean Markdown: short sections, helpful headings, lists where useful.",
      bullets: "Return a tight, grouped bullet list.",
      json: "Return valid JSON only. Clear keys, no markdown fences unless explicitly requested.",
      table: "Return a readable table with short, useful cells.",
    },

    roleFor: (category) =>
      `You are a senior ${category} specialist with sharp product sense, strong prompt-engineering judgment and a bias for practical, high-quality output. You think about the goal, the audience and the single result that would count as success before you write a word.`,

    taskFor: (category) =>
      `Turn the user's raw idea into a precise, copy-ready prompt for their ${category} request — specific enough that a strong AI model produces a genuinely useful result on the first try, with no follow-up clarification needed.`,

    context: {
      idea: "User idea",
      category: "Category",
      target: "Target model",
      format: "Requested answer format",
      depth: "Desired prompt depth",
      language: "Detected/requested prompt language",
      audience: "Target audience",
      goal: "Goal / success condition",
      constraints: "Hard constraints",
    },

    smartConstraints: [
      "First infer the likely goal, audience and the one success condition from the idea.",
      "Adapt every instruction to the selected target model's prompt language and strengths.",
      "Where details are missing, add the most reasonable assumption as a clearly-marked, editable slot — never stop to ask.",
      "Separate context, task, constraints and the output contract so the model can't miss any of them.",
      "Be concrete: name deliverables, formats and quantities instead of vague advice.",
      "For text models, prefer positive instructions ('do this') over long lists of prohibitions.",
      "For image, video and music models, include an explicit exclusion / negative section where the model supports it.",
      "Right-size the prompt: rich enough to remove ambiguity, tight enough to stay sharp (model reasoning degrades when prompts bloat past a few thousand tokens).",
      "Do not invent facts. Mark every assumption clearly so the user can edit or confirm it.",
      "Make the result ready to paste into the chosen model with zero cleanup.",
    ],

    outputContract: (format, languageName) => [
      COPY.en.format[format] || COPY.en.format.markdown,
      `Write the generated prompt in ${languageName}.`,
      "Use scannable section titles so the prompt is easy to read.",
      "Lead with the single most important instruction.",
      "End with a short checklist the AI should verify before answering.",
    ],

    examples: (idea) => [
      `Input idea: "${idea}"`,
      "Output: a precise prompt with role, context, task, constraints, output format, clearly-marked assumptions and a short quality checklist — tuned to the selected model.",
    ],

    success: [
      "The prompt is specific, model-tuned and ready to paste.",
      "The output language matches the user's input or selection.",
      "Ambiguity is removed without the prompt becoming bloated.",
      "The target model has an unambiguous contract for what to produce.",
      "Every assumption is visible and editable.",
    ],

    sections: {
      role: "Role",
      context: "Context",
      task: "Task",
      model: "Target model rules",
      constraints: "Constraints",
      output: "Output format",
      assumptions: "Assumptions (edit me)",
      checklist: "Checklist before answering",
    },

    image: {
      intro: "Image prompt",
      positive: "Positive prompt",
      negative: "Negative prompt",
      framework: [
        "subject + action",
        "style / medium",
        "composition, framing, camera & lens",
        "lighting",
        "color, texture, mood, atmosphere",
        "technical parameters",
      ],
      descriptors: [
        "clear focal subject",
        "intentional pose or action",
        "specific environment",
        "cinematic mood",
        "controlled lighting (e.g. rim light, golden hour, soft window light)",
        "rich texture and material detail",
        "clean, deliberate composition",
        "high detail and sharp focus",
      ],
      natural: (idea, descriptors) =>
        `Create a detailed image of ${idea}. The scene has ${descriptors.join(", ")}. Order the description by visual importance, use a coherent color palette and readable silhouettes, and add no text unless it is essential to the concept.`,
    },

    video: {
      intro: "Video prompt",
      framework: [
        "shot size (wide / medium / close-up)",
        "subject + appearance",
        "action / motion beat",
        "camera move (static, pan, dolly, tracking, orbit, push-in)",
        "lens / focal length",
        "lighting + time of day",
        "setting / background",
        "mood + style",
        "audio cues (if the model supports native audio)",
        "duration & pacing",
      ],
      shotSizes: ["extreme wide", "wide / establishing", "medium", "close-up", "extreme close-up", "POV", "over-the-shoulder"],
      cameraMoves: ["static", "pan", "tilt", "dolly in/out", "tracking", "orbit", "crane", "handheld", "gimbal push-in"],
      note: "Aim for ~50-100 words per shot; keep one coherent camera logic per shot; for multi-shot models, define each shot separately with its own framing and transition.",
    },

    music: {
      intro: "Music prompt",
      styleFormula: [
        "specific genre / subgenre",
        "mood + energy level",
        "vocal persona (or [no vocals])",
        "key instruments + production quality",
        "tempo (BPM) + key",
      ],
      structureTags: ["[Intro]", "[Verse]", "[Pre-Chorus]", "[Chorus]", "[Post-Chorus]", "[Bridge]", "[Instrumental]", "[Outro]"],
      vocalPersonas: ["breathy female mid-range", "male tenor, clear diction", "raspy male", "powerful belt", "soft duet with harmonies", "spoken-word"],
      productionDescriptors: ["radio-ready mix", "punchy drums", "wide stereo field", "warm analog bass", "crisp high-end", "subtle reverb", "lo-fi tape hiss", "polished mix"],
      note: "Two fields: 8-15 ordered tags in the Style field (most important first) and section-tagged lyrics in the Lyrics field. Place any exclusions at the END of the style text.",
    },

    // Mantidos por compatibilidade com seu código atual:
    videoIntro: (model) =>
      model && model.type === "video"
        ? `Create a ${model.label} video prompt.`
        : "Create a video script and a generation-ready shot list.",
    musicLanguage: "Language",

    roleLabel: "Prompt engineer",
  },

  pt: {
    languageName: "português brasileiro",

    tone: {
      neutral: "Voz neutra, precisa e fácil de entender. Sem hype, sem enrolação.",
      professional: "Voz profissional e polida, prática e confiante.",
      friendly: "Voz amigável, humana e clara, como um especialista que ajuda.",
      playful: "Voz criativa e energética, sem perder utilidade.",
      authoritative: "Voz firme, direta e decidida.",
      academic: "Voz acadêmica, rigorosa e bem estruturada, com termos precisos.",
    },

    length: {
      concise: "Mantenha curto: só as instruções essenciais, sem encher linguiça.",
      balanced: "Detalhe equilibrado: estrutura suficiente para guiar o modelo sem inflar.",
      detailed: "Detalhado: seções claras, casos de borda e critérios de sucesso.",
      exhaustive: "Exaustivo: contexto, restrições, exemplos, etapas de validação e casos de borda.",
    },

    reasoning: {
      direct: "Prefira uma resposta direta. Não exponha raciocínio oculto.",
      step: "Pense passo a passo antes da resposta final quando a tarefa se beneficiar disso.",
      deep: "Analise a fundo, pese opções e trade-offs e só então apresente a resposta final com clareza.",
    },

    format: {
      prose: "Entregue em texto corrido, com parágrafos claros.",
      markdown: "Entregue em Markdown limpo: seções curtas, títulos úteis, listas quando ajudar.",
      bullets: "Entregue uma lista de bullets enxuta e agrupada.",
      json: "Entregue apenas JSON válido. Chaves claras, sem cercas de markdown salvo se pedirem.",
      table: "Entregue uma tabela legível, com células curtas e úteis.",
    },

    roleFor: (category) =>
      `Você é um(a) especialista sênior em ${category}, com ótimo senso de produto, julgamento forte de engenharia de prompt e foco em resultado prático e de alta qualidade. Você pensa no objetivo, no público e no único resultado que contaria como sucesso antes de escrever uma palavra.`,

    taskFor: (category) =>
      `Transforme a ideia crua do usuário num prompt preciso e pronto pra colar, para o pedido de ${category} — específico o suficiente para um bom modelo de IA gerar um resultado realmente útil de primeira, sem precisar de mais esclarecimentos.`,

    context: {
      idea: "Ideia do usuário",
      category: "Categoria",
      target: "Modelo alvo",
      format: "Formato de resposta pedido",
      depth: "Profundidade desejada do prompt",
      language: "Idioma detectado/solicitado do prompt",
      audience: "Público-alvo",
      goal: "Objetivo / condição de sucesso",
      constraints: "Restrições inegociáveis",
    },

    smartConstraints: [
      "Primeiro infira o objetivo provável, o público e a única condição de sucesso a partir da ideia.",
      "Adapte cada instrução à linguagem de prompt e às forças do modelo alvo selecionado.",
      "Onde faltar detalhe, adicione a suposição mais razoável como um campo editável e claramente marcado — nunca pare para perguntar.",
      "Separe contexto, tarefa, restrições e contrato de saída para o modelo não deixar nada passar.",
      "Seja concreto: nomeie entregáveis, formatos e quantidades em vez de dar conselho vago.",
      "Para modelos de texto, prefira instruções positivas ('faça isto') a longas listas de proibições.",
      "Para modelos de imagem, vídeo e música, inclua uma seção explícita de exclusão / negativos onde o modelo suportar.",
      "Dimensione bem o prompt: rico o bastante para tirar a ambiguidade, enxuto o bastante para seguir afiado (a qualidade do raciocínio cai quando o prompt incha além de alguns milhares de tokens).",
      "Não invente fatos. Marque cada suposição com clareza para o usuário editar ou confirmar.",
      "Deixe o resultado pronto pra colar no modelo escolhido, sem precisar de limpeza.",
    ],

    outputContract: (format, languageName) => [
      COPY.pt.format[format] || COPY.pt.format.markdown,
      `Escreva o prompt gerado em ${languageName}.`,
      "Use títulos de seção escaneáveis para o prompt ser fácil de ler.",
      "Comece pela instrução mais importante.",
      "Termine com um checklist curto que a IA deve verificar antes de responder.",
    ],

    examples: (idea) => [
      `Ideia de entrada: "${idea}"`,
      "Saída: um prompt preciso com papel, contexto, tarefa, restrições, formato de saída, suposições claramente marcadas e um checklist curto de qualidade — afinado para o modelo selecionado.",
    ],

    success: [
      "O prompt é específico, afinado ao modelo e pronto pra colar.",
      "O idioma da saída combina com a entrada ou a seleção do usuário.",
      "A ambiguidade some sem o prompt ficar inflado.",
      "O modelo alvo tem um contrato inequívoco do que produzir.",
      "Toda suposição está visível e editável.",
    ],

    sections: {
      role: "Papel",
      context: "Contexto",
      task: "Tarefa",
      model: "Regras do modelo alvo",
      constraints: "Restrições",
      output: "Formato de saída",
      assumptions: "Suposições (edite aqui)",
      checklist: "Checklist antes de responder",
    },

    image: {
      intro: "Prompt de imagem",
      positive: "Prompt positivo",
      negative: "Prompt negativo",
      framework: [
        "sujeito + ação",
        "estilo / meio",
        "composição, enquadramento, câmera e lente",
        "iluminação",
        "cor, textura, mood, atmosfera",
        "parâmetros técnicos",
      ],
      descriptors: [
        "sujeito focal claro",
        "pose ou ação intencional",
        "ambiente específico",
        "mood cinematográfico",
        "iluminação controlada (ex.: rim light, golden hour, luz suave de janela)",
        "textura e detalhe de material ricos",
        "composição limpa e deliberada",
        "alto detalhe e foco nítido",
      ],
      natural: (idea, descriptors) =>
        `Crie uma imagem detalhada de ${idea}. A cena tem ${descriptors.join(", ")}. Ordene a descrição por importância visual, use uma paleta de cores coerente e silhuetas legíveis, e não inclua texto a menos que seja essencial ao conceito.`,
    },

    video: {
      intro: "Prompt de vídeo",
      framework: [
        "tamanho do plano (aberto / médio / close)",
        "sujeito + aparência",
        "ação / beat de movimento",
        "movimento de câmera (estática, pan, dolly, tracking, orbit, push-in)",
        "lente / distância focal",
        "iluminação + hora do dia",
        "cenário / fundo",
        "mood + estilo",
        "deixas de áudio (se o modelo tiver áudio nativo)",
        "duração e ritmo",
      ],
      shotSizes: ["super aberto", "aberto / estabelecimento", "médio", "close", "super close", "POV", "over-the-shoulder"],
      cameraMoves: ["estática", "pan", "tilt", "dolly in/out", "tracking", "orbit", "crane", "handheld", "push-in com gimbal"],
      note: "Mire em ~50-100 palavras por plano; mantenha uma lógica de câmera coerente por plano; em modelos multi-shot, defina cada plano separadamente, com seu enquadramento e transição.",
    },

    music: {
      intro: "Prompt de música",
      styleFormula: [
        "gênero / subgênero específico",
        "mood + nível de energia",
        "persona vocal (ou [no vocals])",
        "instrumentos-chave + qualidade de produção",
        "tempo (BPM) + tom",
      ],
      structureTags: ["[Intro]", "[Verse]", "[Pre-Chorus]", "[Chorus]", "[Post-Chorus]", "[Bridge]", "[Instrumental]", "[Outro]"],
      vocalPersonas: ["feminino sussurrado mid-range", "tenor masculino, dicção clara", "masculino rasgado", "belt potente", "dueto suave com harmonias", "spoken-word"],
      productionDescriptors: ["mix radio-ready", "bateria encorpada", "campo estéreo largo", "grave analógico quente", "agudos nítidos", "reverb sutil", "lo-fi tape hiss", "mix polido"],
      note: "Dois campos: 8-15 tags ordenadas no campo de Estilo (mais importante primeiro) e a letra com tags de seção no campo de Letra. Coloque as exclusões no FINAL do texto de estilo.",
    },

    // Mantidos por compatibilidade com seu código atual:
    videoIntro: (model) =>
      model && model.type === "video"
        ? `Crie um prompt de vídeo para ${model.label}.`
        : "Crie um roteiro de vídeo e um shot list pronto para geração.",
    musicLanguage: "Idioma",

    roleLabel: "engenheiro(a) de prompt",
  },
};


// -----------------------------------------------------------------------------
// 3) inferIntent — palpite leve de categoria/modalidade a partir do texto livre
// -----------------------------------------------------------------------------
// Serve para auto-selecionar a aba certa no app quando a pessoa só digita a
// ideia. É heurística (não substitui a escolha do usuário).
export function inferIntent(idea = "") {
  const t = (idea || "").toLowerCase();
  const has = (...words) => words.some((w) => t.includes(w));

  let type = "text";
  if (has("imagem", "image", "foto", "photo", "logo", "pôster", "poster", "ilustra", "render", "thumbnail", "capa", "midjourney", "flux", "dall")) type = "image";
  if (has("vídeo", "video", "clipe", "clip", "reel", "shot", "filme", "cena", "veo", "kling", "runway", "sora", "pika", "animação", "animation")) type = "video";
  if (has("música", "musica", "song", "beat", "letra", "lyrics", "suno", "udio", "trilha", "jingle")) type = "music";

  let category = "general";
  if (has("post", "instagram", "tiktok", "reels", "carrossel", "carousel", "tweet", "thread", "caption", "legenda", "social")) category = "social media";
  else if (has("e-mail", "email", "newsletter", "copy", "anúncio", "anuncio", "ad ", "vendas", "sales", "landing")) category = "copywriting";
  else if (has("código", "codigo", "code", "função", "function", "bug", "api", "script", "sql")) category = "coding";
  else if (has("artigo", "article", "blog", "ensaio", "essay", "roteiro", "script")) category = "content writing";
  else if (type === "image") category = "image generation";
  else if (type === "video") category = "video generation";
  else if (type === "music") category = "music generation";

  return { type, category };
}


// -----------------------------------------------------------------------------
// 4) composeFallbackPrompt — montador 100% local (sem chamar IA)
// -----------------------------------------------------------------------------
// Gera um prompt estruturado e decente na hora. Bom para preview e para
// funcionar offline. Para o resultado "afinado nos mínimos detalhes",
// use buildMetaPrompt + uma LLM (abaixo).
export function composeFallbackPrompt(opts = {}) {
  const {
    idea = "",
    category = "general",
    modelType = "text",
    modelId = "",
    modelLabel = "",
    lang = "pt",
    tone = "neutral",
    length = "detailed",
    reasoning = "direct",
    format = "markdown",
    audience = "",
    goal = "",
    constraints = "",
  } = opts;

  const C = COPY[lang] || COPY.en;
  const S = C.sections;
  const guide = getModelGuide(modelType, modelId, lang);
  const slot = (label) => `{{${label}}}`;

  const lines = [];
  lines.push(`## ${S.role}`);
  lines.push(`${C.roleFor(category)} ${C.tone[tone] || ""}`.trim());
  lines.push("");

  lines.push(`## ${S.context}`);
  lines.push(`- ${C.context.idea}: ${idea || slot(lang === "pt" ? "descreva a ideia" : "describe the idea")}`);
  lines.push(`- ${C.context.audience}: ${audience || slot(lang === "pt" ? "público-alvo" : "audience")}`);
  lines.push(`- ${C.context.goal}: ${goal || slot(lang === "pt" ? "objetivo / sucesso" : "goal / success")}`);
  if (modelLabel || modelId) lines.push(`- ${C.context.target}: ${modelLabel || modelId} (${modelType})`);
  lines.push("");

  lines.push(`## ${S.task}`);
  lines.push(C.taskFor(category));
  lines.push(C.reasoning[reasoning] || "");
  lines.push(C.length[length] || "");
  lines.push("");

  if (guide) {
    lines.push(`## ${S.model}`);
    lines.push(`- ${guide.syntax}`);
    lines.push(`- ${guide.recipe}`);
    if (guide.params) lines.push(`- ${guide.params}`);
    if (guide.negatives) lines.push(`- ${guide.negatives}`);
    lines.push("");
  }

  // Bloco específico por modalidade
  if (modelType === "image") {
    lines.push(`## ${C.image.intro}`);
    lines.push(`${C.image.positive}: ${C.image.natural(idea || slot(lang === "pt" ? "seu assunto" : "your subject"), C.image.descriptors)}`);
    lines.push(`${lang === "pt" ? "Ordem recomendada" : "Recommended order"}: ${C.image.framework.join(" -> ")}.`);
    if (guide && guide.example) lines.push(`${lang === "pt" ? "Exemplo no estilo do modelo" : "Model-style example"}: ${guide.example}`);
    lines.push(`${C.image.negative}: ${slot(lang === "pt" ? "o que evitar" : "what to avoid")}`);
    lines.push("");
  } else if (modelType === "video") {
    lines.push(`## ${C.video.intro}`);
    lines.push(`${lang === "pt" ? "Monte por plano nesta ordem" : "Build per shot in this order"}: ${C.video.framework.join(" -> ")}.`);
    lines.push(`${lang === "pt" ? "Tamanhos de plano" : "Shot sizes"}: ${C.video.shotSizes.join(", ")}.`);
    lines.push(`${lang === "pt" ? "Movimentos de câmera" : "Camera moves"}: ${C.video.cameraMoves.join(", ")}.`);
    lines.push(C.video.note);
    if (guide && guide.example) lines.push(`${lang === "pt" ? "Exemplo no estilo do modelo" : "Model-style example"}: ${guide.example}`);
    lines.push("");
  } else if (modelType === "music") {
    lines.push(`## ${C.music.intro}`);
    lines.push(`${lang === "pt" ? "Campo de Estilo (5 partes)" : "Style field (5 parts)"}: ${C.music.styleFormula.join(" -> ")}.`);
    lines.push(`${lang === "pt" ? "Personas vocais" : "Vocal personas"}: ${C.music.vocalPersonas.join(", ")}.`);
    lines.push(`${lang === "pt" ? "Produção" : "Production"}: ${C.music.productionDescriptors.join(", ")}.`);
    lines.push(`${lang === "pt" ? "Tags de estrutura (na letra)" : "Structure tags (in lyrics)"}: ${C.music.structureTags.join(" ")}.`);
    lines.push(C.music.note);
    if (guide && guide.example) lines.push(`${lang === "pt" ? "Exemplo no estilo do modelo" : "Model-style example"}: ${guide.example}`);
    lines.push("");
  }

  lines.push(`## ${S.constraints}`);
  C.smartConstraints.forEach((c) => lines.push(`- ${c}`));
  if (constraints) lines.push(`- ${constraints}`);
  lines.push("");

  lines.push(`## ${S.output}`);
  C.outputContract(format, C.languageName).forEach((o) => lines.push(`- ${o}`));
  lines.push("");

  lines.push(`## ${S.assumptions}`);
  lines.push(lang === "pt"
    ? "- (preencha/edite as suposições que o gerador assumiu acima)"
    : "- (fill in / edit the assumptions used above)");
  lines.push("");

  lines.push(`## ${S.checklist}`);
  C.success.forEach((s) => lines.push(`- [ ] ${s}`));

  return lines.filter((l) => l !== undefined && l !== null).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}


// -----------------------------------------------------------------------------
// 5) buildMetaPrompt — a camada de INTELIGÊNCIA
// -----------------------------------------------------------------------------
// Devolve { system, user }. Você manda isso para uma LLM forte e ela reescreve
// a ideia crua num prompt profissional, afinado ao modelo alvo. É o que faz o
// app "ajustar qualquer coisa que a pessoa escrever nos mínimos detalhes".
export function buildMetaPrompt(opts = {}) {
  const {
    idea = "",
    category = "general",
    modelType = "text",
    modelId = "",
    modelLabel = "",
    lang = "pt",
    tone = "neutral",
    length = "detailed",
    reasoning = "direct",
    format = "markdown",
    audience = "",
    goal = "",
    constraints = "",
  } = opts;

  const C = COPY[lang] || COPY.en;
  const guide = getModelGuide(modelType, modelId, lang);

  const metaLine = lang === "pt"
    ? "Você está operando como engenheiro(a) de prompt: sua única função é transformar uma ideia crua num prompt finalizado, pronto pra colar, para um modelo de IA alvo específico."
    : "You are operating as a prompt engineer: your only job is to turn a rough idea into a finished, copy-ready prompt for a specific target AI model.";

  const system = [
    C.roleFor(category),
    C.tone[tone] || "",
    metaLine,
    ...C.smartConstraints,
  ].filter(Boolean).join("\n");

  const lblTarget = lang === "pt" ? "Modelo alvo" : "Target model";
  const lblFollow = lang === "pt" ? "Siga a linguagem de prompt dele" : "Follow its prompt language";
  const guideBlock = guide
    ? [
        `${lblTarget}: ${modelLabel || modelId || modelType} (${modelType}).`,
        `${lblFollow}:`,
        `- ${lang === "pt" ? "Sintaxe" : "Syntax"}: ${guide.syntax}`,
        `- ${lang === "pt" ? "Receita de ordem" : "Order recipe"}: ${guide.recipe}`,
        `- ${lang === "pt" ? "Forças" : "Strengths"}: ${guide.strengths}`,
        `- ${lang === "pt" ? "Parâmetros" : "Parameters"}: ${guide.params}`,
        `- ${lang === "pt" ? "Negativos / exclusões" : "Negatives / exclusions"}: ${guide.negatives}`,
        `- ${lang === "pt" ? "Exemplo de referência" : "Reference example"}: ${guide.example}`,
      ].join("\n")
    : `${lblTarget}: ${modelType}.`;

  const idYou = lang === "pt"
    ? "IDEIA CRUA:\n"
    : "RAW IDEA:\n";
  const audLine = audience
    ? `${C.context.audience.toUpperCase()}: ${audience}`
    : (lang === "pt" ? "PÚBLICO: infira e marque como suposição editável." : "AUDIENCE: infer it and mark as an editable assumption.");
  const goalLine = goal
    ? `${C.context.goal.toUpperCase()}: ${goal}`
    : (lang === "pt" ? "OBJETIVO: infira a única condição de sucesso." : "GOAL: infer the single success condition.");
  const onlyPrompt = lang === "pt"
    ? "Retorne APENAS o prompt finalizado (com o checklist no fim). Não explique seu processo."
    : "Return ONLY the finished prompt (with its checklist at the end). Do not explain your process.";

  const user = [
    `${idYou}${idea || `{{${lang === "pt" ? "descreva a ideia aqui" : "describe the idea here"}}}`}`,
    audLine,
    goalLine,
    constraints ? `${C.context.constraints.toUpperCase()}: ${constraints}` : "",
    guideBlock,
    C.reasoning[reasoning] || "",
    `${(lang === "pt" ? "PROFUNDIDADE" : "DEPTH")}: ${C.length[length] || ""}`,
    `${(lang === "pt" ? "FORMATO DE SAÍDA" : "OUTPUT FORMAT")}: ${C.format[format] || C.format.markdown}`,
    ...C.outputContract(format, C.languageName),
    onlyPrompt,
  ].filter(Boolean).join("\n\n");

  return { system, user };
}


// -----------------------------------------------------------------------------
// 6) EXEMPLO DE USO  (referência — adapte ao seu app)
// -----------------------------------------------------------------------------
//
//  import { buildMetaPrompt, composeFallbackPrompt, inferIntent } from "./prompt-engine.js";
//
//  // (a) palpite de aba a partir do texto livre:
//  const guess = inferIntent("quero um post de instagram sobre café especial");
//  // -> { type: "text", category: "social media" }
//
//  // (b) preview instantâneo, sem IA:
//  const preview = composeFallbackPrompt({
//    idea: userText, category: "social media", modelType: "text",
//    modelId: "claude", modelLabel: "Claude", lang: "pt",
//    tone: "friendly", length: "detailed", reasoning: "direct", format: "markdown",
//  });
//
//  // (c) versão "inteligente" (reescreve nos mínimos detalhes via LLM):
//  const { system, user } = buildMetaPrompt({
//    idea: userText, category: "image generation", modelType: "image",
//    modelId: "midjourney", modelLabel: "Midjourney v7", lang: "pt",
//    tone: "neutral", length: "exhaustive", reasoning: "deep", format: "markdown",
//  });
//
//  // Chamada à API (no app/artifact não passe API key — já é tratada):
//  const res = await fetch("https://api.anthropic.com/v1/messages", {
//    method: "POST",
//    headers: { "Content-Type": "application/json" },
//    body: JSON.stringify({
//      model: "claude-sonnet-4-20250514",
//      max_tokens: 1500,
//      system,
//      messages: [{ role: "user", content: user }],
//    }),
//  });
//  const data = await res.json();
//  const finalPrompt = data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
//
// =============================================================================

export default COPY;
