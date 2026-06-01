# Security Policy

PLIMPT is a static, client-side app. It does not have accounts, cookies, analytics, tracking scripts, or a backend API.

## Built-in Protections

- All prompt generation runs in the browser.
- User ideas, history, and favorites are stored only in `localStorage`.
- No user text is sent to a remote server by the app.
- A Content Security Policy limits scripts, images, workers, forms, and network connections.
- User-provided history text is rendered with `textContent`, not injected as HTML.
- External links use `rel="noopener"`.
- Browser permissions for camera, microphone, geolocation, payment, and USB are disabled by policy.

Google Fonts are loaded from Google domains when the network allows it. If they fail, the app falls back to system fonts and keeps working.

## Reporting a Vulnerability

Please open a private report through the maintainer's public profile links or create a GitHub security advisory if the repository is hosted on GitHub.

Include:

- A short description of the issue.
- Steps to reproduce.
- The browser and version used.
- Any proof-of-concept input needed to trigger the problem.

We aim to respond within 48 hours.
