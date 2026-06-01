export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export async function typeText(node, text, onTick) {
  node.textContent = "";
  if (prefersReducedMotion()) {
    node.textContent = text;
    return;
  }

  const chunk = text.length > 2800 ? 4 : text.length > 1400 ? 3 : 2;
  for (let index = 0; index < text.length; index += chunk) {
    node.textContent += text.slice(index, index + chunk);
    if (onTick && index % 16 === 0) onTick();
    await new Promise((resolve) => setTimeout(resolve, 7));
  }
}

export function rainAscii() {
  const glyphs = ["*", "+", "#", "$", "PROMPT", "199X", "OK", ">"];
  for (let index = 0; index < 42; index += 1) {
    const el = document.createElement("span");
    el.className = "secret-rain";
    el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    el.style.left = `${Math.random() * 100}vw`;
    el.style.animationDelay = `${Math.random() * 0.7}s`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
}

export function runBoot(bootScreen, callback) {
  if (!bootScreen || prefersReducedMotion() || sessionStorage.getItem("promptron:booted")) {
    bootScreen?.remove();
    callback?.();
    return;
  }
  sessionStorage.setItem("promptron:booted", "1");
  setTimeout(() => {
    bootScreen.classList.add("hide");
    setTimeout(() => bootScreen.remove(), 320);
    callback?.();
  }, 1450);
}
