# washworld-redesign

Redesign project for WashWorld — a premium car wash &amp; detailing website.

## Structure

- `index.html` — main page (all sections, including hero, services, pricing, about, testimonials, contact, footer)
- `css/styles.css` — all site styling
- `js/main.js` — site interactivity (mobile nav, scroll reveal, contact form, booking buttons)
- `build.js` — deterministic build script

## Build

A deterministic build produces a deployable `public/` directory with all site
files. Vercel (or any static host) serves `public/` as the root.

```bash
npm run build
```

`build.js` copies the required static assets (`index.html`, `css/styles.css`,
`js/main.js`, `README.md`) into `public/` and validates that every internal
asset reference in `index.html` resolves within the artifact.

```bash
npm run check     # runs build with artifact validation
```

No third-party runtime dependencies; build requires only Node.js >= 16.
