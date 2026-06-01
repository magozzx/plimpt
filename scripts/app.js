import { getAllowedModels, getModel } from "./models.js";
import { PROMPT_TEMPLATES, RANDOM_IDEAS, getTemplate } from "./templates.js";
import { buildPrompt } from "./generator.js";
import { applyTranslations } from "./i18n.js";
import {
  clearFavorites,
  clearHistory,
  exportData,
  loadFavorites,
  loadHistory,
  loadPrefs,
  pushHistory,
  saveFavorite,
  savePrefs
} from "./storage.js";
import { isSoundEnabled, play, setSoundEnabled } from "./audio.js";
import { rainAscii, runBoot, typeText } from "./effects.js";

const $ = (selector) => document.querySelector(selector);

const nodes = {
  body: document.body,
  boot: $("#bootScreen"),
  clock: $("#clock"),
  form: $("#promptForm"),
  idea: $("#ideaInput"),
  ideaStats: $("#ideaStats"),
  output: $("#outputText"),
  outputStats: $("#outputStats"),
  categoryGrid: $("#categoryGrid"),
  modelSelect: $("#modelSelect"),
  modelHint: $("#modelHint"),
  tone: $("#toneSelect"),
  length: $("#lengthSelect"),
  reasoning: $("#reasoningSelect"),
  outputLang: $("#outputLangSelect"),
  format: $("#formatSelect"),
  examples: $("#examplesToggle"),
  success: $("#successToggle"),
  negative: $("#negativeToggle"),
  generate: $("#generateButton"),
  processing: $("#processing"),
  surprise: $("#surpriseButton"),
  clearIdea: $("#clearIdea"),
  copy: $("#copyButton"),
  regenerate: $("#regenerateButton"),
  save: $("#saveButton"),
  download: $("#downloadButton"),
  share: $("#shareButton"),
  sound: $("#soundToggle"),
  language: $("#languageToggle"),
  historyToggle: $("#historyToggle"),
  historyClose: $("#historyClose"),
  drawer: $("#historyDrawer"),
  historyList: $("#historyList"),
  historyTab: $("#historyTab"),
  favoritesTab: $("#favoritesTab"),
  clearHistory: $("#clearHistoryButton"),
  export: $("#exportButton"),
  command: $("#commandInput"),
  commandOutput: $("#commandOutput"),
  toast: $("#toast")
};

const themeClasses = ["theme-whiteblue"];
const placeholders = [
  "a SaaS for freelancers to track invoices",
  "a watercolor fox in a misty forest",
  "a follow-up email after a job interview",
  "a video script for a product launch",
  "a prompt to debug a stubborn layout bug"
];
const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

const state = {
  prefs: loadPrefs(),
  lastPrompt: "",
  lastItem: null,
  variation: 0,
  drawerMode: "history",
  konamiIndex: 0
};

function stats(text) {
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const tokens = Math.ceil(chars / 4);
  return `${chars} chars · ${words} words · ~${tokens} tokens`;
}

function showToast(message) {
  nodes.toast.textContent = message;
  nodes.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => nodes.toast.classList.remove("show"), 1600);
}

function setTheme(theme) {
  themeClasses.forEach((className) => nodes.body.classList.remove(className));
  nodes.body.classList.add("theme-whiteblue");
  state.prefs.theme = "theme-whiteblue";
  savePrefs(state.prefs);
}

function setLanguage(language) {
  state.prefs.language = language;
  nodes.language.textContent = language === "pt" ? "EN" : "PT";
  nodes.language.title = language === "pt" ? "English" : "Português";
  applyTranslations(language);
  renderCategories();
  savePrefs(state.prefs);
}

function updateSoundButton() {
  nodes.sound.textContent = isSoundEnabled() ? "♪" : "×";
  nodes.sound.title = isSoundEnabled() ? "Sound on" : "Sound off";
}

function renderCategories() {
  nodes.categoryGrid.innerHTML = "";
  PROMPT_TEMPLATES.forEach((template) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-card";
    button.dataset.categoryId = template.id;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(template.id === state.prefs.categoryId));
    button.innerHTML = `<span class="category-icon">${template.icon}</span><span class="category-name">${state.prefs.language === "pt" ? template.name_pt : template.name_en}</span>`;
    button.addEventListener("click", () => {
      state.prefs.categoryId = template.id;
      const allowed = getAllowedModels(template);
      if (!allowed.some((model) => model.id === state.prefs.modelId)) {
        state.prefs.modelId = allowed.find((model) => model.id !== "generic")?.id || "generic";
      }
      renderCategories();
      renderModels();
      savePrefs(state.prefs);
      play("click");
    });
    nodes.categoryGrid.appendChild(button);
  });
}

function renderModels() {
  const template = getTemplate(state.prefs.categoryId);
  const allowed = getAllowedModels(template);
  nodes.modelSelect.innerHTML = "";
  allowed.forEach((model) => {
    const option = document.createElement("option");
    option.value = model.id;
    option.textContent = model.label;
    nodes.modelSelect.appendChild(option);
  });
  if (!allowed.some((model) => model.id === state.prefs.modelId)) {
    state.prefs.modelId = allowed[0].id;
  }
  nodes.modelSelect.value = state.prefs.modelId;
  nodes.modelHint.textContent = getModel(state.prefs.modelId).hint;
  nodes.negative.closest("label").style.display = template.type === "image" ? "inline-flex" : "none";
}

function updateCounters() {
  nodes.ideaStats.textContent = stats(nodes.idea.value);
  nodes.outputStats.textContent = stats(nodes.output.textContent);
}

function collectOptions() {
  return {
    idea: nodes.idea.value.trim(),
    categoryId: state.prefs.categoryId,
    modelId: state.prefs.modelId,
    tone: nodes.tone.value,
    length: nodes.length.value,
    reasoning: nodes.reasoning.value,
    outputLang: nodes.outputLang.value,
    outputFormat: nodes.format.value,
    variation: state.variation,
    flags: {
      examples: nodes.examples.checked,
      success: nodes.success.checked,
      negative: nodes.negative.checked
    }
  };
}

function setActionButtons(enabled) {
  [nodes.copy, nodes.regenerate, nodes.save, nodes.download, nodes.share].forEach((button) => {
    button.disabled = !enabled;
  });
}

function makeHistoryItem(options, prompt) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    ts: new Date().toISOString(),
    idea: options.idea,
    categoryId: options.categoryId,
    modelId: options.modelId,
    options,
    prompt
  };
}

function runProcessing() {
  let frame = 0;
  const glyphs = ["|", "/", "-", "\\"];
  nodes.processing.textContent = "PROCESSING...";
  const timer = setInterval(() => {
    frame += 1;
    const percent = Math.min(100, frame * 12);
    const filled = Math.round(percent / 10);
    nodes.processing.textContent = `${glyphs[frame % glyphs.length]} [${"█".repeat(filled)}${"░".repeat(10 - filled)}] ${percent}%`;
    if (percent >= 100) clearInterval(timer);
  }, 80);
  return new Promise((resolve) => setTimeout(() => {
    clearInterval(timer);
    nodes.processing.textContent = "";
    resolve();
  }, 780));
}

async function generatePrompt({ saveToHistory = true } = {}) {
  try {
    const options = collectOptions();
    const prompt = buildPrompt(options);
    state.lastPrompt = prompt;
    play("generate");
    await runProcessing();
    await typeText(nodes.output, prompt, () => play("click"));
    updateCounters();
    setActionButtons(true);
    if (saveToHistory) {
      state.lastItem = makeHistoryItem(options, prompt);
      pushHistory(state.lastItem);
      renderDrawer();
    }
    showToast("READY");
  } catch (error) {
    play("error");
    showToast(error.message);
  }
}

function fillFromItem(item) {
  nodes.idea.value = item.idea;
  state.prefs.categoryId = item.categoryId;
  state.prefs.modelId = item.modelId;
  Object.assign(state.prefs, { categoryId: item.categoryId, modelId: item.modelId });
  if (item.options) {
    nodes.tone.value = item.options.tone || nodes.tone.value;
    nodes.length.value = item.options.length || nodes.length.value;
    nodes.reasoning.value = item.options.reasoning || nodes.reasoning.value;
    nodes.outputLang.value = item.options.outputLang || nodes.outputLang.value;
    nodes.format.value = item.options.outputFormat || nodes.format.value;
    nodes.examples.checked = item.options.flags?.examples ?? nodes.examples.checked;
    nodes.success.checked = item.options.flags?.success ?? nodes.success.checked;
    nodes.negative.checked = item.options.flags?.negative ?? nodes.negative.checked;
  }
  renderCategories();
  renderModels();
  nodes.output.textContent = item.prompt;
  state.lastPrompt = item.prompt;
  state.lastItem = item;
  setActionButtons(true);
  updateCounters();
  savePrefs(state.prefs);
}

function renderDrawer() {
  const items = state.drawerMode === "history" ? loadHistory() : loadFavorites();
  nodes.historyList.innerHTML = "";
  nodes.historyTab.classList.toggle("active", state.drawerMode === "history");
  nodes.favoritesTab.classList.toggle("active", state.drawerMode === "favorites");
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "drawer-item";
    const title = document.createElement("strong");
    const copy = document.createElement("span");
    title.textContent = "EMPTY";
    copy.textContent = "No saved prompts yet.";
    empty.append(title, copy);
    nodes.historyList.appendChild(empty);
    return;
  }
  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "drawer-item";
    const template = getTemplate(item.categoryId);
    const date = new Date(item.ts).toLocaleString();
    const title = document.createElement("strong");
    const copy = document.createElement("span");
    title.textContent = `${template.name_en} · ${date}`;
    copy.textContent = item.idea;
    button.append(title, copy);
    button.addEventListener("click", () => {
      fillFromItem(item);
      toggleDrawer(false);
    });
    nodes.historyList.appendChild(button);
  });
}

function toggleDrawer(force) {
  const open = typeof force === "boolean" ? force : !nodes.drawer.classList.contains("open");
  nodes.drawer.classList.toggle("open", open);
  nodes.drawer.setAttribute("aria-hidden", String(!open));
  if (open) renderDrawer();
}

function downloadText(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

function encodeState() {
  const payload = {
    idea: nodes.idea.value,
    categoryId: state.prefs.categoryId,
    modelId: state.prefs.modelId,
    tone: nodes.tone.value,
    length: nodes.length.value,
    reasoning: nodes.reasoning.value,
    outputLang: nodes.outputLang.value,
    outputFormat: nodes.format.value,
    flags: {
      examples: nodes.examples.checked,
      success: nodes.success.checked,
      negative: nodes.negative.checked
    }
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decodeState(hash) {
  try {
    const value = hash.replace(/^#s=/, "").replaceAll("-", "+").replaceAll("_", "/");
    const json = decodeURIComponent(escape(atob(value)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function applySharedState() {
  if (!location.hash.startsWith("#s=")) return;
  const payload = decodeState(location.hash);
  if (!payload) return;
  nodes.idea.value = payload.idea || "";
  state.prefs.categoryId = payload.categoryId || state.prefs.categoryId;
  state.prefs.modelId = payload.modelId || state.prefs.modelId;
  nodes.tone.value = payload.tone || nodes.tone.value;
  nodes.length.value = payload.length || nodes.length.value;
  nodes.reasoning.value = payload.reasoning || nodes.reasoning.value;
  nodes.outputLang.value = payload.outputLang || nodes.outputLang.value;
  nodes.format.value = payload.outputFormat || nodes.format.value;
  nodes.examples.checked = payload.flags?.examples ?? nodes.examples.checked;
  nodes.success.checked = payload.flags?.success ?? nodes.success.checked;
  nodes.negative.checked = payload.flags?.negative ?? nodes.negative.checked;
}

function setRandomPlaceholder() {
  const next = placeholders[Math.floor(Math.random() * placeholders.length)];
  nodes.idea.placeholder = next;
}

function surprise() {
  const idea = RANDOM_IDEAS[Math.floor(Math.random() * RANDOM_IDEAS.length)];
  const template = PROMPT_TEMPLATES[Math.floor(Math.random() * PROMPT_TEMPLATES.length)];
  nodes.idea.value = idea;
  state.prefs.categoryId = template.id;
  const allowed = getAllowedModels(template);
  state.prefs.modelId = allowed.find((model) => model.id !== "generic")?.id || "generic";
  renderCategories();
  renderModels();
  updateCounters();
  generatePrompt();
}

function runCommand(command) {
  const value = command.trim();
  if (!value) return;
  const [name] = value.split(/\s+/, 2);
  if (name === "/help") {
    nodes.commandOutput.textContent = "/random · /clear · /export · /about";
  } else if (name === "/random") {
    surprise();
    nodes.commandOutput.textContent = "random prompt loaded";
  } else if (name === "/clear") {
    nodes.output.textContent = "";
    state.lastPrompt = "";
    setActionButtons(false);
    updateCounters();
    nodes.commandOutput.textContent = "output cleared";
  } else if (name === "/export") {
    downloadText("plimpt-export.json", JSON.stringify(exportData(), null, 2), "application/json");
    nodes.commandOutput.textContent = "export downloaded";
  } else if (name === "/about") {
    nodes.commandOutput.textContent = "PLIMPT: retro prompt machine. 100% client-side. created by Gabriel — instagram.com/gabriel.mago34";
  } else {
    nodes.commandOutput.textContent = "unknown command. try /help";
  }
}

function bindEvents() {
  nodes.form.addEventListener("submit", (event) => {
    event.preventDefault();
    generatePrompt();
  });

  nodes.idea.addEventListener("input", updateCounters);
  nodes.clearIdea.addEventListener("click", () => {
    nodes.idea.value = "";
    updateCounters();
    nodes.idea.focus();
  });

  nodes.modelSelect.addEventListener("change", () => {
    state.prefs.modelId = nodes.modelSelect.value;
    nodes.modelHint.textContent = getModel(state.prefs.modelId).hint;
    savePrefs(state.prefs);
  });

  [nodes.tone, nodes.length, nodes.reasoning, nodes.outputLang, nodes.format, nodes.examples, nodes.success, nodes.negative].forEach((node) => {
    node.addEventListener("change", () => savePrefs(state.prefs));
  });

  nodes.surprise.addEventListener("click", surprise);

  nodes.regenerate.addEventListener("click", () => {
    state.variation += 1;
    generatePrompt();
  });

  nodes.copy.addEventListener("click", async () => {
    await copyText(state.lastPrompt);
    play("copy");
    const original = nodes.copy.textContent;
    nodes.copy.textContent = "COPIED!";
    showToast("COPIED");
    setTimeout(() => { nodes.copy.textContent = original; }, 1400);
  });

  nodes.save.addEventListener("click", () => {
    if (!state.lastPrompt) return;
    state.lastItem = state.lastItem || makeHistoryItem(collectOptions(), state.lastPrompt);
    saveFavorite(state.lastItem);
    renderDrawer();
    play("copy");
    showToast("SAVED");
  });

  nodes.download.addEventListener("click", () => {
    if (!state.lastPrompt) return;
    downloadText("plimpt-prompt.md", state.lastPrompt, "text/markdown");
    showToast("DOWNLOADED");
  });

  nodes.share.addEventListener("click", async () => {
    location.hash = `s=${encodeState()}`;
    await copyText(location.href);
    showToast("LINK COPIED");
    play("copy");
  });

  nodes.sound.addEventListener("click", () => {
    state.prefs.sound = !state.prefs.sound;
    setSoundEnabled(state.prefs.sound);
    updateSoundButton();
    savePrefs(state.prefs);
    play("click");
  });

  nodes.language.addEventListener("click", () => {
    setLanguage(state.prefs.language === "pt" ? "en" : "pt");
  });

  nodes.historyToggle.addEventListener("click", () => toggleDrawer());
  nodes.historyClose.addEventListener("click", () => toggleDrawer(false));
  nodes.historyTab.addEventListener("click", () => {
    state.drawerMode = "history";
    renderDrawer();
  });
  nodes.favoritesTab.addEventListener("click", () => {
    state.drawerMode = "favorites";
    renderDrawer();
  });
  nodes.clearHistory.addEventListener("click", () => {
    if (state.drawerMode === "history") clearHistory();
    else clearFavorites();
    renderDrawer();
  });
  nodes.export.addEventListener("click", () => downloadText("plimpt-export.json", JSON.stringify(exportData(), null, 2), "application/json"));

  nodes.command.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runCommand(nodes.command.value);
      nodes.command.value = "";
    }
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      generatePrompt();
    }
    const expected = konami[state.konamiIndex];
    if (event.key === expected) {
      state.konamiIndex += 1;
      if (state.konamiIndex === konami.length) {
        state.konamiIndex = 0;
        rainAscii();
        showToast("SECRET UNLOCKED");
      }
    } else {
      state.konamiIndex = event.key === konami[0] ? 1 : 0;
    }
  });
}

function startClock() {
  const tick = () => {
    const now = new Date();
    nodes.clock.textContent = `[ ${now.toLocaleTimeString([], { hour12: false })} ]`;
  };
  tick();
  setInterval(tick, 1000);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (["localhost", "127.0.0.1", "::1"].includes(location.hostname)) {
    navigator.serviceWorker.getRegistrations?.().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
    window.caches?.keys?.().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
    return;
  }
  if (!location.protocol.startsWith("http")) return;
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

function init() {
  applySharedState();
  setTheme("theme-whiteblue");
  setSoundEnabled(state.prefs.sound);
  updateSoundButton();
  setLanguage(state.prefs.language);
  renderModels();
  setRandomPlaceholder();
  setInterval(setRandomPlaceholder, 4500);
  updateCounters();
  bindEvents();
  renderDrawer();
  startClock();
  registerServiceWorker();
  runBoot(nodes.boot, () => play("boot"));
}

init();
