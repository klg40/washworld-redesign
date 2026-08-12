# washworld-redesign

Redesign project for WashWorld — a static landing page for the Wash World car wash
premium services.

## Structure

- `index.html` — Landing page (RU)
- `styles.css` — Global styles
- `app.js` — Booking form handling
- `vercel.json` — Vercel deployment configuration

## Deployment

This is a pure static site. Connected to Vercel, it deploys with zero config (no
build step required). `vercel.json` enables `cleanUrls` and adds basic security
headers.

Verify locally by opening `index.html` in a browser or serving the directory,
e.g. `npx serve .`.
