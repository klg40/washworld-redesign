# washworld-redesign

Redesign project for WashWorld.

## Structure

- `index.html` — source home page
- `css/styles.css` — stylesheet source
- `js/main.js` — browser interactions
- `scripts/build.js` — assembles the deployable output
- `scripts/test.js` — verifies required deliverables
- `public/` — generated static output (serve this directory)

## Commands

```sh
npm install
npm run build   # builds public/ (index.html, css/styles.css, js/main.js)
npm test        # verifies public/ deliverables
npm audit       # dependency audit
```

Serve the `public/` directory with any static host. The site requires:

- `public/index.html` → 200 at `/`
- `public/css/styles.css` → 200 at `/css/styles.css`
- `public/js/main.js` → 200 at `/js/main.js`
