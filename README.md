# BobbleheadRob

The root landing page for [bobbleheadrob.com](https://bobbleheadrob.com/), a project-focused collection of useful tools and small games shaped by Rob and built with a small team of agents.

The homepage also provides the public contact address `rob@bobbleheadrob.com` for bug reports, ideas, and general messages.

## Local preview

The site has no build step or dependencies. Serve the deployable `public` directory with any static server, for example:

```powershell
python -m http.server 8080 --directory public
```

Then open `http://localhost:8080/`.

Opening `public/index.html` directly will display the page, but a local server is preferred because production assets use root-relative URLs.

## Mascot controls

The hero bobblehead is an optional interactive flourish:

- Move a mouse or trackpad pointer near the face to get a small eye and head reaction.
- Drag the head or base directly with a mouse, pen, or touch, then release it gently or fling it.
- When the base is grabbed, the independently sprung head trails; when the head is grabbed, the base trails beneath it.
- A loose mascot collides with the viewport and returns to its hero position after it settles.
- Reduced-motion mode keeps eye tracking and direct dragging while suppressing fling and sustained idle motion.

The mascot remains decorative, is hidden from assistive technology, and is not part of the keyboard navigation path. The homepage implementation is a focused prototype for the brand character, not the separate, more game-like **Fling Pet** concept.

## Deployment

The repository is ready for a static Cloudflare Pages project:

- Framework preset: None
- Build command: leave blank
- Build output directory: `public`

Deployment is intentionally not configured or performed in this scaffold.

## Files

- `public/index.html` — semantic page markup and metadata
- `public/styles.css` — responsive visual system and layout
- `public/app.js` — footer-year progressive enhancement
- `public/mascot.js` — isolated mascot input, physics, and rendering
- `public/assets/` — original site-owned visual assets
- `VISION.md` — purpose, audience, and product principles
- `DESIGN.md` — visual language and interaction guidance
- `ARCHITECTURE.md` — technical structure and constraints
- `PROJECT_STATUS.md` — current state and next decisions
- `public/robots.txt` and `public/sitemap.xml` — crawler guidance and discovery
