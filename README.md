# BobbleheadRob

The root landing page for [bobbleheadrob.com](https://bobbleheadrob.com/), Robert's personal collection of small browser games, useful tools, and curious experiments.

## Local preview

The site has no build step or dependencies. Serve the deployable `public` directory with any static server, for example:

```powershell
python -m http.server 8080 --directory public
```

Then open `http://localhost:8080/`.

Opening `public/index.html` directly will display the page, but a local server is preferred because production assets use root-relative URLs.

## Deployment

The repository is ready for a static Cloudflare Pages project:

- Framework preset: None
- Build command: leave blank
- Build output directory: `public`

Deployment is intentionally not configured or performed in this scaffold.

## Files

- `public/index.html` — semantic page markup and metadata
- `public/styles.css` — responsive visual system and layout
- `public/app.js` — minimal progressive enhancement
- `public/assets/` — original site-owned visual assets
- `VISION.md` — purpose, audience, and product principles
- `DESIGN.md` — visual language and interaction guidance
- `ARCHITECTURE.md` — technical structure and constraints
- `PROJECT_STATUS.md` — current state and next decisions
- `public/robots.txt` and `public/sitemap.xml` — crawler guidance and discovery
