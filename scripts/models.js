export const MODELS = [
  { id: "generic", label: "Generic / any model", type: "text", hint: "Clean, portable sections" },
  { id: "gpt", label: "ChatGPT / GPT", type: "text", hint: "Markdown sections" },
  { id: "claude", label: "Claude", type: "text", hint: "XML tags and literal instructions" },
  { id: "gemini", label: "Gemini", type: "text", hint: "Labeled inputs and verification step" },
  { id: "grok", label: "Grok", type: "text", hint: "Direct sections" },
  { id: "deepseek", label: "DeepSeek", type: "text", hint: "Structured reasoning prompt" },
  { id: "llama", label: "Llama", type: "text", hint: "Compact instruction blocks" },
  { id: "midjourney", label: "Midjourney", type: "image", hint: "Comma formula with parameters" },
  { id: "dalle", label: "DALL·E", type: "image", hint: "Natural image description" },
  { id: "sd-flux", label: "Stable Diffusion / Flux", type: "image", hint: "Positive + negative descriptors" },
  { id: "sora", label: "Sora", type: "video", hint: "Shot-by-shot video prompt" },
  { id: "veo", label: "Veo", type: "video", hint: "Shot-by-shot video prompt" },
  { id: "suno", label: "Suno", type: "music", hint: "Style + lyrics blocks" }
];

const LABELS = {
  en: {
    role: "Role",
    context: "Context",
    input: "Input",
    task: "Task",
    constraints: "Constraints",
    output: "Output Format",
    examples: "Examples",
    success: "Success Criteria",
    verification: "Verification",
    verify: "Before responding, verify that your answer follows every constraint and matches the requested format.",
    claudePreamble: "Use the information inside each XML tag. Follow the requested output contract exactly.",
    gptReasoning: "Think step by step before answering, then provide only the final answer."
  },
  pt: {
    role: "Papel",
    context: "Contexto",
    input: "Entrada",
    task: "Tarefa",
    constraints: "Restrições",
    output: "Formato de saída",
    examples: "Exemplos",
    success: "Critérios de sucesso",
    verification: "Verificação",
    verify: "Antes de responder, verifique se a resposta segue todas as restrições e o formato pedido.",
    claudePreamble: "Use as informações dentro de cada tag XML. Siga exatamente o contrato de saída solicitado.",
    gptReasoning: "Pense passo a passo antes de responder e entregue apenas a resposta final."
  },
  es: {
    role: "Rol",
    context: "Contexto",
    input: "Entrada",
    task: "Tarea",
    constraints: "Restricciones",
    output: "Formato de salida",
    examples: "Ejemplos",
    success: "Criterios de éxito",
    verification: "Verificación",
    verify: "Antes de responder, verifica que la respuesta cumpla todas las restricciones y el formato pedido.",
    claudePreamble: "Usa la información dentro de cada etiqueta XML. Sigue exactamente el formato solicitado.",
    gptReasoning: "Piensa paso a paso antes de responder y entrega solo la respuesta final."
  }
};

export function getModel(id) {
  return MODELS.find((model) => model.id === id) || MODELS[0];
}

export function getAllowedModels(template) {
  if (template.type === "image") {
    return MODELS.filter((model) => model.id === "generic" || model.type === "image");
  }
  if (template.type === "video") {
    return MODELS.filter((model) => model.id === "generic" || model.type === "video");
  }
  if (template.type === "music") {
    return MODELS.filter((model) => model.id === "generic" || model.type === "music");
  }
  return MODELS.filter((model) => model.type === "text");
}

export function labelsFor(language) {
  return LABELS[language] || LABELS.en;
}

function block(title, body) {
  if (!body || (Array.isArray(body) && body.length === 0)) return "";
  const text = Array.isArray(body) ? body.map((item) => `- ${item}`).join("\n") : body;
  return `## ${title}\n${text}`;
}

function xmlBlock(tag, body) {
  if (!body || (Array.isArray(body) && body.length === 0)) return "";
  const text = Array.isArray(body) ? body.map((item) => `- ${item}`).join("\n") : body;
  return `<${tag}>\n${text}\n</${tag}>`;
}

function plainBlock(title, body) {
  if (!body || (Array.isArray(body) && body.length === 0)) return "";
  const text = Array.isArray(body) ? body.map((item) => `- ${item}`).join("\n") : body;
  return `${title.toUpperCase()}:\n${text}`;
}

export function adaptForModel(core, modelId) {
  const model = getModel(modelId);
  const labels = labelsFor(core.language);

  if (model.id === "claude") {
    return [
      labels.claudePreamble,
      xmlBlock("role", core.role),
      xmlBlock("context", core.context),
      xmlBlock("task", core.task),
      xmlBlock("constraints", core.constraints),
      xmlBlock("output_format", core.outputFormat),
      xmlBlock("examples", core.examples),
      xmlBlock("success_criteria", core.successCriteria)
    ].filter(Boolean).join("\n\n");
  }

  if (model.id === "gpt") {
    const reasoningLine = core.reasoning === "direct" ? "" : labels.gptReasoning;
    return [
      block(labels.role, core.role),
      block(labels.context, core.context),
      block(labels.task, core.task),
      block(labels.constraints, [...core.constraints, reasoningLine].filter(Boolean)),
      block(labels.output, core.outputFormat),
      block(labels.examples, core.examples),
      block(labels.success, core.successCriteria)
    ].filter(Boolean).join("\n\n");
  }

  if (model.id === "gemini") {
    return [
      block(labels.role, core.role),
      block(labels.input, core.context),
      block(labels.task, core.task),
      block(labels.constraints, core.constraints),
      block(labels.output, core.outputFormat),
      block(labels.examples, core.examples),
      block(labels.verification, labels.verify),
      block(labels.success, core.successCriteria)
    ].filter(Boolean).join("\n\n");
  }

  if (["deepseek", "grok", "llama"].includes(model.id)) {
    return [
      plainBlock(labels.role, core.role),
      plainBlock(labels.context, core.context),
      plainBlock(labels.task, core.task),
      plainBlock(labels.constraints, core.constraints),
      plainBlock(labels.output, core.outputFormat),
      plainBlock(labels.examples, core.examples),
      plainBlock(labels.success, core.successCriteria)
    ].filter(Boolean).join("\n\n");
  }

  return [
    block(labels.role, core.role),
    block(labels.context, core.context),
    block(labels.task, core.task),
    block(labels.constraints, core.constraints),
    block(labels.output, core.outputFormat),
    block(labels.examples, core.examples),
    block(labels.success, core.successCriteria)
  ].filter(Boolean).join("\n\n");
}
