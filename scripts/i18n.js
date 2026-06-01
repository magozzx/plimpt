export const UI = {
  en: {
    tagline: "> turning vague ideas into surgical prompts since 199X",
    ideaLabel: "Your idea",
    privacy: "100% local",
    clear: "clear",
    category: "Category",
    surprise: "SURPRISE ME",
    model: "Target model",
    options: "Options",
    tone: "Tone",
    length: "Prompt size",
    reasoning: "Reasoning",
    outputLang: "Prompt language",
    outputFormat: "Answer format",
    examples: "Include examples",
    success: "Success criteria",
    negative: "Negative prompt",
    output: "Generated prompt",
    history: "History"
  },
  pt: {
    tagline: "> transformando ideias vagas em prompts cirúrgicos desde 199X",
    ideaLabel: "Sua ideia",
    privacy: "100% local",
    clear: "limpar",
    category: "Categoria",
    surprise: "ME SURPREENDA",
    model: "Modelo alvo",
    options: "Opções",
    tone: "Tom",
    length: "Tamanho do prompt",
    reasoning: "Raciocínio",
    outputLang: "Idioma do prompt",
    outputFormat: "Formato da resposta",
    examples: "Incluir exemplos",
    success: "Critérios de sucesso",
    negative: "Prompt negativo",
    output: "Prompt gerado",
    history: "Histórico"
  }
};

const OPTION_LABELS = {
  en: {
    toneSelect: {
      neutral: "Neutral",
      professional: "Professional",
      friendly: "Friendly",
      playful: "Playful",
      authoritative: "Authoritative",
      academic: "Academic"
    },
    lengthSelect: {
      concise: "Concise",
      balanced: "Balanced",
      detailed: "Detailed",
      exhaustive: "Exhaustive"
    },
    reasoningSelect: {
      direct: "Direct answer",
      step: "Step-by-step",
      deep: "Deep reasoning"
    },
    outputLangSelect: {
      match: "Match input",
      en: "EN",
      pt: "PT-BR",
      es: "ES"
    },
    formatSelect: {
      prose: "Prose",
      markdown: "Markdown",
      bullets: "Bullet list",
      json: "JSON",
      table: "Table"
    }
  },
  pt: {
    toneSelect: {
      neutral: "Neutro",
      professional: "Profissional",
      friendly: "Amigável",
      playful: "Criativo",
      authoritative: "Autoridade",
      academic: "Acadêmico"
    },
    lengthSelect: {
      concise: "Curto",
      balanced: "Equilibrado",
      detailed: "Detalhado",
      exhaustive: "Completo"
    },
    reasoningSelect: {
      direct: "Resposta direta",
      step: "Passo a passo",
      deep: "Raciocínio profundo"
    },
    outputLangSelect: {
      match: "Igual ao texto",
      en: "EN",
      pt: "PT-BR",
      es: "ES"
    },
    formatSelect: {
      prose: "Texto corrido",
      markdown: "Markdown",
      bullets: "Lista",
      json: "JSON",
      table: "Tabela"
    }
  }
};

export function t(language, key) {
  return UI[language]?.[key] || UI.en[key] || key;
}

export function applyTranslations(language, root = document) {
  root.documentElement?.setAttribute("lang", language === "pt" ? "pt-BR" : "en");
  root.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(language, node.dataset.i18n);
  });

  const labels = OPTION_LABELS[language] || OPTION_LABELS.en;
  Object.entries(labels).forEach(([selectId, options]) => {
    const select = root.getElementById?.(selectId) || root.querySelector?.(`#${selectId}`);
    if (!select) return;
    Array.from(select.options).forEach((option) => {
      option.textContent = options[option.value] || option.textContent;
    });
  });
}
