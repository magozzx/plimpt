<div align="center">

```text
 ____  ____   ___  __  __ ____ _____ ____   ___  _   _
|  _ \|  _ \ / _ \|  \/  |  _ \_   _|  _ \ / _ \| \ | |
| |_) | |_) | | | | |\/| | |_) || | | |_) | | | |  \| |
|  __/|  _ <| |_| | |  | |  __/ | | |  _ <| |_| | |\  |
|_|   |_| \_\\___/|_|  |_|_|    |_| |_| \_\\___/|_| \_|
```

### Type an idea -> get a pro-grade prompt. Retro vibes, zero install, runs in your browser.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Made with](https://img.shields.io/badge/made%20with-HTML%20%7C%20CSS%20%7C%20JS-006dff)
![No build](https://img.shields.io/badge/build-none%20needed-success)
![PWA](https://img.shields.io/badge/PWA-installable-blueviolet)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
[![Instagram](https://img.shields.io/badge/Instagram-%40gabriel.mago34-E4405F?logo=instagram&logoColor=white)](https://instagram.com/gabriel.mago34)

**[Live Demo](https://YOUR_USER.github.io/promptron)** · [Português](README.pt-BR.md) · [Contribute a template](CONTRIBUTING.md) · [Instagram @gabriel.mago34](https://instagram.com/gabriel.mago34)

</div>

![PROMPTRON preview](assets/og-image.png)

## What is this?

PROMPTRON turns a vague idea into a detailed, ready-to-use prompt. Pick a category, pick your target model, tweak a couple of options, hit **GENERATE**, and copy.

- **23 categories**: images, websites, SaaS, code, writing, marketing, music, video, system prompts, and more.
- **Model-aware output**: XML for Claude, Markdown for GPT, labeled checks for Gemini, comma formulas for image models.
- **Retro CRT interface**: white shell, blue CRT details, scanlines, typewriter output, synth beeps, and boot screen.
- **100% client-side**: your ideas stay in your browser. No account, no cookies, no tracking.
- **Security-minded by default**: CSP, disabled sensitive browser permissions, safe local rendering, and no backend.
- **Zero install**: pure HTML, CSS, and JavaScript. Installable as a PWA and works offline after the first load.

## Quick Start

No build step.

```bash
git clone https://github.com/YOUR_USER/promptron.git
cd promptron
python3 -m http.server 8080
```

Open `http://localhost:8080`.

You can also publish the folder directly with GitHub Pages. The app is static.

## How It Works

```text
Your idea -> category + target model + options -> prompt engine -> copy-ready prompt
```

The engine adds role, context, task, constraints, output contract, optional examples, success criteria, and model-specific formatting.

## Visual Style

White/Blue CRT: a light retro shell with blue signal lines, scanlines, chunky controls, and terminal motion.

Try the Konami code.

## Contributing

Pull requests are welcome, especially new prompt templates. A template is one object in `scripts/templates.js`; see [CONTRIBUTING.md](CONTRIBUTING.md).

Security notes live in [SECURITY.md](SECURITY.md).

Good first template ideas: slides, recipes, workout plans, travel itineraries, localization, game design docs, interview prep, negotiation scripts, and customer support replies.

## Roadmap

- More categories and prompt packs.
- Import/export community templates.
- Prompt rating and local favorites gallery.
- More interface languages.
- Extra retro themes.

## Created By

Made with care by **Gabriel**.

Follow for more: [Instagram @gabriel.mago34](https://instagram.com/gabriel.mago34)

## License

MIT © Gabriel ([@gabriel.mago34](https://instagram.com/gabriel.mago34))
