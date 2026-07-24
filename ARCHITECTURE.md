# Architecture

## Overview

BobbleheadRob is a dependency-free static website. A browser requests HTML, CSS, two small JavaScript files, and site-owned visual assets. There is no compile step, server runtime, framework, package manager, or client-side router.

## File responsibilities

- `public/index.html` owns content, semantics, links, metadata, and structured data.
- `public/styles.css` owns the layout, design tokens, responsive rules, illustrations, focus states, and reduced-motion behavior.
- `public/app.js` performs one nonessential enhancement: keeping the footer year current.
- `public/mascot.js` contains the optional mascot input, physics state, and animation rendering.
- `public/assets/` contains the favicon, visual mark, and social preview image.
- `public/robots.txt` and `public/sitemap.xml` support search discovery.
- Root Markdown files contain project guidance and are excluded from deployment.

## Runtime model

The page remains complete if JavaScript fails or is disabled. There are no runtime network calls, cookies, local storage, analytics, third-party fonts, or external assets.

## Mascot runtime

The rings, star, and plus remain normal hero decorations. Only the `.bobble` character becomes interactive. It stays in the document flow while docked and switches to viewport-fixed positioning while dragged, thrown, or returning, preventing the interaction from reflowing the page.

Pointer events provide one mouse, pen, and touch path with pointer capture and a preserved grab offset. The face and base are direct pointer targets; a pointer beginning on the spring or open middle chooses the nearest rendered body. The selected head-or-base grab mode remains fixed for the gesture. Recent pointer samples produce a capped release velocity. A `requestAnimationFrame` loop integrates gravity, drag, angular momentum, restitution, collision insets, settling, and a damped magnetic return.

The base owns the persistent viewport-level body state. During a base grab, it follows the pointer and the head responds through its local two-dimensional position, velocity, and angular state. During a head grab, a world-space head attachment anchor follows the pointer while the base integrates toward the corresponding rest position in variable-size substeps capped at 1/120 second. If the local head displacement reaches its elliptical limit, the base position is projected to the boundary and only follower velocity directed farther outside the constraint is removed; projection distance is never converted into velocity. Head release velocity is sampled from the driven head and divided between whole-body travel and local spring motion. Lateral and vertical damped spring forces handle the unheld state, drag acceleration, release momentum, and collision impulses. The trailing base has its own bounded damped angular state, while the existing head angle gains a velocity-sensitive trail target during base grabs; the directly held part keeps its current local angle for pointer stability. Whole-mascot airborne rotation remains a separate viewport-body transform. The spring's angle and length are derived from the base and head attachment points on every rendered frame, allowing sideways bend, stretch, compression, and diagonal deformation without layout reads in the animation loop. The base, head, spring, eyes, and shadow therefore render through separate transforms without competing for transform ownership.

The home anchor is stored in document coordinates and converted to a viewport-relative return target from the current scroll position on every return frame. This lets a settled mascot return above or below the viewport, follow scroll changes during the return, and restore its docked document-flow state while the hero remains offscreen.

The loop throttles the docked idle animation, pauses on hidden tabs, and stops while a loose character is fully settled and waiting to return. When `IntersectionObserver` is supported, it suspends only the docked idle loop while the hero is outside the viewport; return eligibility does not depend on intersection state. Browsers without that API retain the throttled docked loop. Resize and orientation changes recalculate viewport bounds and the document-space home anchor, and non-returning loose characters are clamped back into reach.

Primary tuning values—including gravity, drag, restitution, fling cap, lateral and vertical head stiffness, head damping, maximum displacement, angular stiffness, idle impulse strength, and return spring—live together near the top of `public/mascot.js`. Current limitations are intentional: one active pointer at a time and no persisted mascot position across page loads.

This code is a homepage-specific interaction prototype. A future **Fling Pet** project should treat its game loop, progression, assets, and accessibility model as a separate product rather than expanding the landing-page module into a game.

## URL policy

- Production canonical: `https://bobbleheadrob.com/`
- Project links use canonical HTTPS destinations.
- Unreleased projects do not receive speculative URLs.
- Internal page and asset references are root-relative to match the production domain.
- The root sitemap lists only URLs hosted on `bobbleheadrob.com`; subdomains own their sitemap entries.

## Hosting

The `public` directory is the Cloudflare Pages build output directory. It contains only files intended for production hosting; repository-level planning and architecture documents remain outside it. No build command or platform-specific generation step is required.

## Adding a project

1. Add a semantic `article` to the project grid in `public/index.html`.
2. Use a real anchor only when the project destination exists.
3. Add a project-specific class or symbol style in `public/styles.css` when useful.
4. Add a URL to `public/sitemap.xml` only when it is hosted on `bobbleheadrob.com`.
5. Update `PROJECT_STATUS.md`.

As the collection grows, repeated project data may justify a build step. That tradeoff should be reconsidered only when manual HTML becomes error-prone; it is deliberately unnecessary now.
