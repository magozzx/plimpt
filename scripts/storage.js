const PREFIX = "plimpt:";

function read(key, fallback) {
  try {
    const value = localStorage.getItem(PREFIX + key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function loadPrefs() {
  const defaults = {
    version: 2,
    theme: "theme-whiteblue",
    language: "pt",
    sound: true,
    categoryId: "image-art",
    modelId: "midjourney"
  };
  const prefs = { ...defaults, ...read("prefs", {}) };
  if (!prefs.version || prefs.version < 2) {
    prefs.language = "pt";
    prefs.version = 2;
    write("prefs", prefs);
  }
  return prefs;
}

export function savePrefs(prefs) {
  write("prefs", prefs);
}

export function loadHistory() {
  return read("history", []);
}

export function saveHistory(items) {
  write("history", items.slice(0, 40));
}

export function pushHistory(item) {
  const history = loadHistory().filter((entry) => entry.prompt !== item.prompt);
  history.unshift(item);
  saveHistory(history);
  return history;
}

export function clearHistory() {
  write("history", []);
}

export function loadFavorites() {
  return read("favorites", []);
}

export function saveFavorite(item) {
  const favorites = loadFavorites().filter((entry) => entry.prompt !== item.prompt);
  favorites.unshift(item);
  write("favorites", favorites.slice(0, 60));
  return favorites;
}

export function clearFavorites() {
  write("favorites", []);
}

export function exportData() {
  return {
    prefs: loadPrefs(),
    history: loadHistory(),
    favorites: loadFavorites(),
    exportedAt: new Date().toISOString()
  };
}
