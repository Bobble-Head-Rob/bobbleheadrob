# BobbleheadRob

The root landing page for [bobbleheadrob.com](https://bobbleheadrob.com/), Rob’s personal workshop for useful tools, small games, experiments, and odd ideas. Some projects stay personal; selected work may grow into products owned and supported by [Disdained EGG](https://disdainedegg.com/).

The homepage also provides the public contact address `rob@bobbleheadrob.com` for bug reports, ideas, and general messages.

## Local preview

The site has no build step or dependencies. Serve the deployable `public` directory with any static server, for example:

```powershell
python -m http.server 8080 --directory public
```

Then open `http://localhost:8080/`.

Opening `public/index.html` directly will display the page, but a local server is preferred because production assets use root-relative URLs.

Use Wrangler local development when checking the branded missing-page behavior; a generic static server does not reproduce Workers Static Assets 404 routing.

## Mascot controls

The hero bobblehead is an optional interactive flourish:

- Move a mouse or trackpad pointer near the face to get a small eye and head reaction.
- Drag the head or base directly with a mouse, pen, or touch, then release it gently or fling it; a short release grace preserves a decisive flick, while pausing before release produces a drop.
- When the base is grabbed, the independently sprung head trails; when the head is grabbed, the base trails beneath it.
- A loose mascot can tumble through complete rotations, gain spin from off-center throws and impacts, roll or settle upright or sideways, and return to its hero position even when the hero is offscreen.
- Reduced-motion mode keeps eye tracking and direct dragging while suppressing fling and sustained idle motion.

The mascot remains decorative, is hidden from assistive technology, and is not part of the keyboard navigation path. The homepage implementation is a focused prototype for the brand character, not the separate, more game-like **Fling Pet** concept.

## Hosting context

The dependency-free `public` directory contains the deployable site. Production is the `bobbleheadrob` Cloudflare Workers service using Workers Static Assets, with `wrangler.jsonc` declaring `./public` as the asset source and `public/404.html` as the branded missing-page body through `not_found_handling: "404-page"`.

Cloudflare Web Analytics is enabled for `bobbleheadrob.com` through Cloudflare-managed Automatic Setup for aggregate website traffic measurement. The authored site contains no custom analytics code and does not include Google Analytics or another separate analytics stack.

Cloudflare Workers Builds is integrated with GitHub and automatically deploys production when `main` is pushed. The approved flow is local work, review, commit, owner approval, push `main`, automatic Workers deployment, and production verification. A push to `main` is production-affecting and must not happen without explicit owner approval. Apex/`www` behavior remains a separate infrastructure question.

## Files

- `public/index.html` — semantic page markup and metadata
- `public/404.html` — branded missing-page content and recovery links
- `public/styles.css` — responsive visual system and layout
- `public/app.js` — footer-year progressive enhancement
- `public/mascot.js` — isolated mascot input, physics, and rendering
- `public/assets/` — original site-owned visual assets
- `VISION.md` — purpose, audience, and product principles
- `DESIGN.md` — visual language and interaction guidance
- `ARCHITECTURE.md` — technical structure and constraints
- `PROJECT_STATUS.md` — current state and next decisions
- `AGENTS.md` — development workflow and cross-property guardrails
- `public/robots.txt` and `public/sitemap.xml` — crawler guidance and discovery
