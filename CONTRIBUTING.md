# Contributing to PLIMPT

Thanks for helping this little prompt machine grow.

## Run Locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Add a Prompt Template

Most contributions are just one object in `scripts/templates.js`.

```js
textTemplate(
  "travel",
  "TRIP",
  "Travel Itinerary",
  "Roteiro de Viagem",
  "Experienced travel planner who balances fun, timing, budget, and local context.",
  "Create a practical itinerary for the user's trip idea.",
  [
    "Ask for dates and budget only if they are essential.",
    "Group the plan by day and neighborhood.",
    "Include food, transport, timing, and backup options."
  ],
  [
    "The itinerary is realistic.",
    "Travel time is considered.",
    "The user has clear next steps."
  ]
)
```

Please keep templates:

- Useful on the first try.
- Specific about role, task, constraints, and success criteria.
- Free of filler.
- Easy for non-technical people to understand.

## Pull Request Checklist

- Test the app at mobile width and desktop width.
- Generate at least one prompt with your new category.
- Keep the app static: no build step, no required dependencies.
- Do not add tracking, accounts, cookies, or network calls.

We try to respond to PRs within 48 hours.
