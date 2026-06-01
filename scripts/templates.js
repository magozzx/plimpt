const textModelIds = ["generic", "gpt", "claude", "gemini", "grok", "deepseek", "llama"];

function textTemplate(id, icon, nameEn, namePt, role, task, constraints, success, examples = []) {
  return {
    id,
    icon,
    type: "text",
    name_en: nameEn,
    name_pt: namePt,
    models: textModelIds,
    role,
    task,
    constraints,
    success,
    examples
  };
}

export const PROMPT_TEMPLATES = [
  {
    id: "image-art",
    icon: "IMG",
    type: "image",
    name_en: "Image / Art",
    name_pt: "Imagem / Arte",
    models: ["generic", "midjourney", "dalle", "sd-flux"],
    role: "Senior art director and prompt stylist for high-quality image generation.",
    task: "Transform the idea into a precise visual prompt with subject, action, scene, mood, lighting, style, camera, and composition.",
    constraints: [
      "Put the most important visual elements first.",
      "Avoid vague adjectives unless they directly shape the image.",
      "Keep the prompt visually concrete."
    ],
    success: [
      "The image can be imagined clearly before generation.",
      "Style, lighting, composition, and subject are all explicit.",
      "The model-specific syntax is ready to paste."
    ]
  },
  textTemplate(
    "website",
    "WEB",
    "Website / Landing Page",
    "Site / Landing Page",
    "Senior product designer and conversion-focused frontend strategist.",
    "Create a complete plan and copy direction for a website or landing page based on the user's idea.",
    [
      "Prioritize the first screen, navigation, conversion path, and mobile layout.",
      "Use concrete section names and ready-to-use copy.",
      "Avoid generic startup filler."
    ],
    [
      "The page structure is clear enough for a designer or developer to build.",
      "The message explains what the product is, who it is for, and why it matters.",
      "Calls to action are specific."
    ],
    ["Idea: a landing page for a local repair shop -> Output: hero headline, proof points, services, CTA, FAQ."]
  ),
  textTemplate(
    "saas",
    "SaaS",
    "SaaS / Product",
    "SaaS / Produto",
    "Senior B2B SaaS product strategist with a bias for practical launches.",
    "Turn the idea into a crisp product brief with user, problem, feature set, MVP scope, risks, and launch angle.",
    [
      "Separate must-have features from nice-to-have features.",
      "Name the target customer and their urgent problem.",
      "Include assumptions when details are missing."
    ],
    [
      "The MVP could be scoped in one small sprint.",
      "The value proposition is specific and testable.",
      "Risks and tradeoffs are visible."
    ]
  ),
  textTemplate(
    "code",
    "CODE",
    "Code / Build",
    "Código / Construção",
    "Senior software engineer who writes maintainable, production-minded code.",
    "Produce an implementation plan or code-oriented answer for the user's development task.",
    [
      "Ask for missing runtime details only when they block the work.",
      "Prefer simple, readable implementation over cleverness.",
      "Include tests or verification steps when behavior can break."
    ],
    [
      "The answer includes the files, functions, edge cases, and test path.",
      "The solution fits the likely stack.",
      "The result is safe to hand to another engineer."
    ]
  ),
  textTemplate(
    "debug",
    "BUG",
    "Debug / Fix",
    "Debug / Correção",
    "Principal engineer skilled at isolating bugs and explaining fixes calmly.",
    "Diagnose the problem, identify likely causes, and propose a minimal fix path.",
    [
      "Start from symptoms and evidence, not guesses.",
      "List the most likely root causes in priority order.",
      "Include the exact logs, files, or checks needed next."
    ],
    [
      "The debugging path reduces uncertainty quickly.",
      "Each fix has a verification step.",
      "The final answer avoids broad rewrites unless necessary."
    ]
  ),
  textTemplate(
    "writing",
    "WRIT",
    "Writing / Editing",
    "Escrita / Edição",
    "Sharp editor and writing coach with a clear ear for voice.",
    "Draft, rewrite, or improve the user's text idea while preserving intent and audience fit.",
    [
      "Make the writing concrete and easy to scan.",
      "Keep the requested tone consistent.",
      "Remove filler and vague claims."
    ],
    [
      "The text sounds natural and useful.",
      "The audience and purpose are obvious.",
      "The final copy is ready to paste."
    ]
  ),
  textTemplate(
    "email",
    "MAIL",
    "Email / Message",
    "E-mail / Mensagem",
    "Experienced business communicator who writes concise, human messages.",
    "Write a message for the user's situation with subject line, body, and optional follow-up.",
    [
      "Respect the relationship between sender and recipient.",
      "Lead with the point, then add context.",
      "Keep it polite without sounding weak."
    ],
    [
      "The message can be sent with minimal edits.",
      "The ask or next step is unmistakable.",
      "The tone matches the situation."
    ]
  ),
  textTemplate(
    "marketing",
    "MKT",
    "Marketing Campaign",
    "Campanha de Marketing",
    "Senior growth marketer who balances creativity with measurable outcomes.",
    "Create a campaign concept, positioning, channels, copy angles, and success metrics.",
    [
      "Define the audience and conversion goal.",
      "Include multiple hooks and channel-specific adaptations.",
      "Avoid hype that cannot be supported."
    ],
    [
      "The campaign has a clear offer and audience.",
      "Hooks are distinct from one another.",
      "Metrics connect to the business goal."
    ]
  ),
  textTemplate(
    "social",
    "POST",
    "Social Post",
    "Post Social",
    "Social content strategist who writes platform-native posts.",
    "Turn the idea into a social post or thread with hook, body, CTA, and variants.",
    [
      "Make the first line strong enough to stop a scroll.",
      "Match the rhythm of the selected platform.",
      "Avoid engagement bait."
    ],
    [
      "The post has a clear hook and payoff.",
      "The CTA feels natural.",
      "Variants offer meaningfully different angles."
    ]
  ),
  textTemplate(
    "seo",
    "SEO",
    "SEO / Blog",
    "SEO / Blog",
    "SEO strategist and editorial lead who writes for humans first.",
    "Create an SEO-ready outline, keyword angle, search intent summary, and content brief.",
    [
      "Separate primary keyword, secondary keywords, and intent.",
      "Include headings that answer real questions.",
      "Avoid keyword stuffing."
    ],
    [
      "The outline covers the query better than a shallow article.",
      "The intro promises a specific payoff.",
      "The structure is useful for writers and editors."
    ]
  ),
  textTemplate(
    "learning",
    "LEARN",
    "Study / Tutor",
    "Estudo / Tutor",
    "Patient tutor who explains complex topics with examples and checks for understanding.",
    "Teach the user's topic through a structured lesson, examples, practice, and review.",
    [
      "Start at the learner's likely level.",
      "Use analogies only when they clarify.",
      "Include a short quiz or practice section."
    ],
    [
      "The learner can explain the concept afterward.",
      "Examples progress from simple to realistic.",
      "The lesson includes active recall."
    ]
  ),
  textTemplate(
    "research",
    "RSCH",
    "Research / Analysis",
    "Pesquisa / Análise",
    "Research analyst who separates evidence, inference, and uncertainty.",
    "Analyze the idea, frame the question, identify what evidence is needed, and produce a balanced answer.",
    [
      "State assumptions clearly.",
      "Flag uncertainty instead of inventing facts.",
      "Separate summary, evidence, implications, and open questions."
    ],
    [
      "The analysis is useful even when information is incomplete.",
      "Claims are qualified appropriately.",
      "Next research steps are concrete."
    ]
  ),
  textTemplate(
    "data",
    "DATA",
    "Data / Spreadsheet",
    "Dados / Planilha",
    "Data analyst who turns messy questions into clean analysis plans.",
    "Define how to analyze the user's data problem, including columns, formulas, charts, and interpretation.",
    [
      "Clarify input data shape and expected output.",
      "Include formulas or pseudocode when useful.",
      "Mention data quality checks."
    ],
    [
      "The analysis can be reproduced.",
      "Charts answer a specific question.",
      "Limitations are obvious."
    ]
  ),
  textTemplate(
    "business",
    "BIZ",
    "Business Strategy",
    "Estratégia de Negócio",
    "Strategic operator who converts ideas into practical business decisions.",
    "Evaluate the business idea, market, positioning, economics, risks, and next moves.",
    [
      "Avoid fantasy projections.",
      "Use simple unit economics when numbers are missing.",
      "End with the next three actions."
    ],
    [
      "The strategy is grounded and actionable.",
      "Risks are visible before spending money.",
      "The next steps can be done this week."
    ]
  ),
  textTemplate(
    "product",
    "PM",
    "Product Requirements",
    "Requisitos de Produto",
    "Senior product manager who writes clear, buildable product requirements.",
    "Create a product requirements document for the user's idea.",
    [
      "Include problem, users, goals, non-goals, user stories, acceptance criteria, and metrics.",
      "Call out dependencies and edge cases.",
      "Keep scope realistic."
    ],
    [
      "Engineering can estimate the work.",
      "Acceptance criteria are testable.",
      "Non-goals prevent scope creep."
    ]
  ),
  textTemplate(
    "ux",
    "UX",
    "UX / Interface",
    "UX / Interface",
    "UX designer focused on efficient workflows and accessible interaction patterns.",
    "Design the UX flow, interface states, components, and interaction details for the user's idea.",
    [
      "Cover empty, loading, error, and success states.",
      "Make the main workflow fast and obvious.",
      "Include accessibility considerations."
    ],
    [
      "A designer could wireframe the flow from the answer.",
      "States and edge cases are accounted for.",
      "The interface is useful on mobile and desktop."
    ]
  ),
  textTemplate(
    "brand",
    "BRAND",
    "Brand / Naming",
    "Marca / Nome",
    "Brand strategist and naming consultant with a practical taste filter.",
    "Generate naming, positioning, voice, and brand direction for the user's idea.",
    [
      "Explain why each name works.",
      "Avoid names that are hard to spell or too generic.",
      "Include tone of voice and visual cues."
    ],
    [
      "The names feel distinct and memorable.",
      "Positioning says who it is for and why it matters.",
      "The brand direction can guide design and copy."
    ]
  ),
  textTemplate(
    "prompt-library",
    "PROM",
    "Prompt Template",
    "Template de Prompt",
    "World-class prompt engineer who builds reusable prompt systems.",
    "Create a reusable prompt template for the user's workflow.",
    [
      "Use clearly labeled slots for inputs.",
      "Include constraints, output contract, and success criteria.",
      "Add a short usage note."
    ],
    [
      "The template can be reused without rewriting it.",
      "Inputs and outputs are unambiguous.",
      "The prompt avoids conflicting instructions."
    ]
  ),
  textTemplate(
    "assistant",
    "BOT",
    "Custom Assistant / System Prompt",
    "Assistente / Prompt de Sistema",
    "Assistant architect who designs reliable system prompts and agent behavior.",
    "Write a system prompt for a custom assistant based on the user's mission.",
    [
      "Define mission, scope, behavior, tone, boundaries, and uncertainty handling.",
      "Make the assistant helpful without overpromising.",
      "Include what it should always do and never do."
    ],
    [
      "The assistant's behavior is predictable.",
      "Boundaries are explicit.",
      "The prompt can be pasted into a custom assistant builder."
    ]
  ),
  {
    id: "video",
    icon: "VID",
    type: "video",
    name_en: "Video Script / Shot List",
    name_pt: "Vídeo / Roteiro",
    models: ["generic", "sora", "veo"],
    role: "Video scriptwriter and director with strong visual pacing.",
    task: "Turn the idea into a platform-ready script or shot-by-shot video generation prompt.",
    constraints: [
      "Make the first three seconds impossible to ignore.",
      "Specify framing, action, camera movement, lighting, duration, and transitions.",
      "Keep each shot concrete and filmable."
    ],
    success: [
      "The video can be produced or generated from the prompt.",
      "Shots have clear visual continuity.",
      "The hook is immediate."
    ]
  },
  {
    id: "music",
    icon: "SONG",
    type: "music",
    name_en: "Music / Suno",
    name_pt: "Música / Suno",
    models: ["generic", "suno"],
    role: "Songwriter and music producer who writes clean Suno-ready prompts.",
    task: "Create a music prompt with style direction and structured lyrics.",
    constraints: [
      "Include genre, tempo, instruments, vocal style, mood, and production vibe.",
      "Use clear section markers for lyrics.",
      "Make the hook memorable."
    ],
    success: [
      "The prompt can be pasted into Suno.",
      "The style block guides the sound clearly.",
      "Lyrics have structure and a repeatable chorus."
    ]
  },
  textTemplate(
    "resume",
    "CV",
    "Resume / Cover Letter",
    "Currículo / Carta",
    "Senior recruiter and career coach who writes specific, ATS-friendly career materials.",
    "Write resume bullets, a cover letter, or career positioning text for the user's target role or situation.",
    [
      "Use action verbs and quantified impact when possible.",
      "Avoid generic motivation language.",
      "Ask for missing background only if needed."
    ],
    [
      "The text feels credible and specific.",
      "Impact is visible.",
      "The result is ready for a job application."
    ]
  ),
  textTemplate(
    "improve-prompt",
    "FIX",
    "Improve My Prompt",
    "Melhorar Meu Prompt",
    "World-class prompt engineer who rewrites weak prompts into precise, reliable instructions.",
    "Rewrite the user's draft prompt to be clear, specific, and effective for the chosen model.",
    [
      "Point out what was ambiguous.",
      "Add a precise role, context slots, explicit task, constraints, and output contract.",
      "Return the improved prompt in a code block."
    ],
    [
      "The improved prompt is easier to follow than the original.",
      "Missing context is represented as fillable slots.",
      "The output contract removes guesswork."
    ]
  )
];

export const RANDOM_IDEAS = [
  "a minimalist invoice tracker for freelance designers",
  "a watercolor fox in a misty forest holding a tiny lantern",
  "a polite follow-up email after a job interview",
  "a YouTube short about why people abandon shopping carts",
  "a system prompt for a personal study coach",
  "a landing page for a neighborhood coffee subscription",
  "a debugging prompt for a React state bug",
  "a product brief for a local delivery SaaS",
  "a synthwave song about learning to code at midnight",
  "an SEO article brief about home office ergonomics"
];

export function getTemplate(id) {
  return PROMPT_TEMPLATES.find((template) => template.id === id) || PROMPT_TEMPLATES[0];
}
