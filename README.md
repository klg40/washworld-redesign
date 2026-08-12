# washworld-redesign

Redesign project for WashWorld, plus a second project: a pizzeria redesign.

## Projects

- **Wash World** (main) — premium car wash & detailing marketing page.
- **Pizzeria «Маргарита»** (new) — a redesigned single-page site for a pizzeria.
  - New modern design: `public/pizzeria/index.html`
  - Archived "old design" version (2008-style, for comparison):
    `public/pizzeria/old/index.html`

Both sites prefer an **honest, local-only** booking/order flow: buttons open a
modal that collects details into a **draft** (.ics file and/or clipboard text).
Nothing is sent to any backend — there is no configured recipient.

## Structure

- `index.html` — source home page (Wash World)
- `css/styles.css` — stylesheet source (Wash World)
- `js/main.js` — browser interactions (Wash World)
- `pizzeria/` — pizzeria redesign source (index.html, css/, js/, old/)
- `scripts/build.js` — assembles the deployable output
- `scripts/test.js` — verifies required deliverables
- `public/` — generated static output (serve this directory)

## Commands

```sh
npm install
npm run build   # builds public/ (index.html, css/, js/) + public/pizzeria/
npm test        # verifies public/ deliverables
npm audit       # dependency audit
```

Serve the `public/` directory with any static host. The main site requires:

- `public/index.html` → 200 at `/`
- `public/css/styles.css` → 200 at `/css/styles.css`
- `public/js/main.js` → 200 at `/js/main.js`

The pizzeria requires:

- `public/pizzeria/index.html`
- `public/pizzeria/css/styles.css`
- `public/pizzeria/js/main.js`
- `public/pizzeria/old/index.html` (archived old design)
