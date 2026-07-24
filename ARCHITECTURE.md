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

The page remains complete if JavaScript fails or is disabled. There are no runtime network calls, cookies, local storage, analytics, third-party fonts, or external assets. Session storage records only whether the current tab session has completed or dismissed the mascot hints.

## Mascot runtime

The rings, star, and plus remain normal hero decorations. Only the `.bobble` character becomes interactive. It stays in the document flow while docked and switches to viewport-fixed positioning while dragged, thrown, or returning, preventing the interaction from reflowing the page.

Pointer events provide one mouse, pen, and touch path with pointer capture and a preserved grab offset. The face and base are direct pointer targets; a pointer beginning on the spring or open middle chooses the nearest rendered body. The selected head-or-base grab mode remains fixed for the gesture. Recent pointer samples produce a capped release velocity. The grab lever relative to the cached body center and signed curvature across recent samples produce a separately capped angular release velocity, so centered linear throws spin less than off-center or curved gestures. A `requestAnimationFrame` loop integrates gravity, drag, angular momentum, restitution, orientation-aware viewport contact, settling, and a damped magnetic return.

The base owns the persistent viewport-level body state. During a base grab, it follows the pointer and the head responds through its local two-dimensional position, velocity, and angular state. During a head grab, a world-space head attachment anchor follows the pointer while the base integrates toward the corresponding rest position in variable-size substeps capped at 1/120 second. If the local head displacement reaches its elliptical limit, the base position is projected to the boundary and only follower velocity directed farther outside the constraint is removed; projection distance is never converted into velocity. Head release velocity is sampled from the driven head and divided between whole-body travel and local spring motion. Lateral and vertical damped spring forces handle the unheld state, drag acceleration, release momentum, and collision impulses. The trailing base has its own bounded damped angular state, while the existing head angle gains a velocity-sensitive trail target during base grabs; the directly held part keeps its current local angle for pointer stability. Whole-mascot rotation is an unrestricted viewport-body transform that carries every internal piece through continuous 360-degree turns; head-local rotation and base-local tilt remain independent beneath it. The spring's angle and length are derived from the base and head attachment points on every rendered frame, allowing sideways bend, stretch, compression, and diagonal deformation without layout reads in the animation loop. The base, head, spring, eyes, and shadow therefore render through separate transforms without competing for transform ownership.

Loose collision geometry uses a cached compound visual envelope rather than the smaller host rectangle. Resize-time reads cache the head, spring, and base boxes plus the shared whole-body origin. Each physics frame transforms those cached boxes from the current legal head displacement and rotation, current spring angle and length, and current base tilt and non-uniform scale, then rotates their combined points around the same `50% 85%` origin used by CSS. At the 16px desktop unit, the padded rest envelope is approximately `148.8 × 249.1px`; the union across maximum head travel and representative tilted/scaled poses is approximately `235.9 × 296.4px`. Per-piece padding scales from 1.4px on the compact mascot to 2.24px at desktop size. A post-head-integration projection closes the one-frame gap that could otherwise follow a fast local spring step, without deriving velocity from correction distance. The geometry remains a conservative set of transformed boxes rather than a pixel-perfect silhouette. The current automated static matrix and browser impact runs measured no visible viewport intrusion on any edge, with less than 0.11px residual proxy penetration in the fixed-step stress simulation.

The compound envelope's transformed edge points also provide contact levers for boundary impulses. Torque uses the inward contact normal, incoming normal velocity, tangential velocity, current orientation, contact lever from the cached body center, and existing angular velocity. Separate wall, ceiling, and ground couplings convert glancing or off-center head, spring, or base contact into bounded torque. Low-energy contacts fall below the impact-torque threshold so resting gravity does not continually inject angular energy.

Ground contact uses a simplified support model rather than a rigid polygon solver. Slip between horizontal speed and the contact-equivalent rolling speed transfers a bounded amount of motion between translation and rotation, then linear and angular friction remove energy. Damped support wells make upright and both side orientations stable. An orientation near inverted chooses one persistent tipping direction from angular velocity, horizontal velocity, recent movement, or a deterministic fallback, then applies a small gravity-like torque until the heavier base falls toward a side. Settle detection includes translation, whole-body angular velocity, support-orientation error, grounded duration, and a short low-energy hold; it does not start the return delay while visible rolling or rocking remains. Return selects the nearest equivalent upright angle, unwinds it with the existing damped return, and resets whole rotation, angular velocity, and local base tilt at docking.

While docked and visible, a separate scroll-velocity sample—capped at 2,400px/s—shifts the vertical spring target by up to `2.15` mascot units and transfers velocity changes into the head with a `0.068` coupling and a 112px/s per-event impulse limit. Scroll targeting uses a 16px minimum unit so the compact mobile mascot retains a perceptible response, while active scroll displacement is independently capped at 14px across breakpoints. Together these values produce an intended visible response of roughly 2–4px for gentle scrolling, 5–9px for typical scrolling, and 9–14px for strong input. Downward page scrolling produces positive local head motion and compression; upward scrolling produces negative local motion and stretch. Every meaningful sample stores that direction and starts a 180ms scroll-activity hold that remains independent of the existing `6s⁻¹` velocity decay, fully suppresses continuous idle forcing, and reschedules the next discrete personality impulse from the current time. During the hold, unilateral post-integration constraints project wrong-direction displacement to neutral and excessive same-direction displacement to the scroll boundary; each removes only velocity directed farther through its boundary and never converts correction distance into velocity. Repeated wheel or trackpad samples update the direction immediately and extend the hold. After it expires, both directional constraints release, continuous idle forcing eases back with a damped fade instead of switching on in one frame, and the unchanged vertical spring (`84` stiffness, `6.8` damping) rebounds across neutral and settles. Skipped pulses are never queued, and the legacy loose and returning scroll paths remain unchanged.

The home anchor is stored in document coordinates and converted to a viewport-relative return target from the current scroll position on every return frame. This lets a settled mascot return above or below the viewport, follow scroll changes during the return, and restore its docked document-flow state while the hero remains offscreen.

Three lightweight first-session hints are scheduled with increasing delays and shown only while the mascot is docked, idle, visible, and the tab is active. The first valid mascot grab immediately hides and suppresses the sequence for the remainder of the tab session. Hint timers and classes remain separate from the physics state and rendering transforms.

The loop throttles the docked idle animation, pauses on hidden tabs, and stops while a loose character is fully settled and waiting to return. When `IntersectionObserver` is supported, it suspends only the docked idle loop while the hero is outside the viewport; return eligibility does not depend on intersection state. Browsers without that API retain the throttled docked loop. Resize and orientation changes recalculate viewport bounds and the document-space home anchor, and non-returning loose characters are clamped back into reach.

Primary tuning values—including gravity, drag, restitution, fling and angular caps, release leverage, collision torque, ground rolling and friction, support stability, lateral and vertical head stiffness, head damping, maximum displacement, angular stiffness, idle impulse strength, and return spring—live together near the top of `public/mascot.js`. Current limitations are intentional: one active pointer at a time, simplified rectangular rotational support rather than pixel-perfect silhouette collision, and no persisted mascot position across page loads.

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
