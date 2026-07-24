# Project Status

Last reviewed: 2026-07-23

## Current release

Interactive mascot prototype complete and ready for final manual and infrastructure verification.

### Included projects

| Project | Status | Destination |
| --- | --- | --- |
| Guitar Key Compass | Live | <https://guitar.bobbleheadrob.com/> |
| Left Right Center | Coming soon | None assigned |

### Implementation

- Dependency-free HTML, CSS, and JavaScript
- Mobile-first project shelf and responsive hero
- Semantic landmarks, skip navigation, visible focus styling, and reduced-motion support
- Canonical, description, Open Graph and Twitter card fields, and WebSite JSON-LD
- Same-host search crawler files, favicon, and original social preview image
- Dedicated `public` deployment directory with planning documents excluded
- No external requests, analytics, forms, or tracking
- Project-first identity copy reflecting work shaped by Rob and built with a small team of agents
- A brief personal note near the bottom of the homepage
- A lightweight contact section linking to `rob@bobbleheadrob.com`
- Pointer-aware, draggable hero mascot with capped fling physics, viewport collisions, impact response, and automatic return
- Document-space home targeting that completes returns while the hero is offscreen and adapts to scrolling in progress
- A two-body mascot model: viewport-level base physics plus independent two-axis head position, velocity, and angular state
- Explicit head and base grab modes with direct targeting, preserved visual offsets, and part-specific trailing behavior
- Attachment-derived spring bending, stretch, compression, and diagonal deformation with bounded displacement
- Independent bounded tilt for the trailing head or base, with damped reversal overshoot and held-part stability
- A planted docked base with varied head-led idle motion, velocity-scaled vertical scroll lag, occasional stronger bobbles, and cursor reactions
- Three subtle, increasingly delayed docked-idle hints with immediate session-scoped suppression after mascot interaction
- Reduced-motion behavior that preserves eye tracking and direct dragging while suppressing fling and sustained motion
- Visibility, resize, orientation, and offscreen safeguards that reduce work and keep a loose mascot reachable

### Implementation-agent validation completed

- Automated headless-browser checks at 1440px, 768px, 390px, and 320px with no horizontal overflow
- Mouse-event fling plus synthetic touch-event drag, collision reachability, settle-and-return, and return cancellation
- Automated resize-while-loose, directional slow/fast docked scroll reaction, rebound, eye tracking, reduced-motion, and transformed re-grab checks
- Automated slow and rapid horizontal drag, two-axis and diagonal drag, direction reversal, release overshoot, four-edge collision, automatic return, and docked-idle checks
- Exact transformed re-grabs in both rotation directions while base scale deformation was active
- Automated head- and base-driven directional, diagonal, reversal, off-center grab, flick, slow-release, paused-release, and pointer-cancel checks
- Directional trailing-body tilt, reversal overshoot, active-tilt release, strong-shake bounds, and planted-idle checks
- Exact visual pointer deltas for both grab modes during positive and negative rotation with active scale deformation
- Head-driven clamp, reversal, circular-motion, and release stability checks at simulated 60 Hz, 120 Hz, and uneven animation cadences
- Automated above-viewport, below-viewport, mid-scroll, offscreen re-grab, visible-home, and reduced-motion return checks
- Automated hint timing, sequence completion, offscreen gating, interaction suppression, session persistence, responsive placement, and accessibility-source checks
- Source-level JavaScript syntax, page-link, fragment-target, metadata, XML, and deployment-file-scope checks

### Independent and real-device validation outstanding

- Independent visual and interaction review in ordinary desktop and mobile browsers
- Physical touch-device testing on representative iOS and Android hardware
- Physical mouse-wheel and trackpad review of docked scroll strength, direction, and post-scroll idle resumption
- Manual keyboard-only navigation and operating-system reduced-motion review
- Subjective tuning review for startle intensity, hard impacts, and return timing

The current physics tuning gives secondary head motion more personality while keeping the base trajectory and interaction controls conservative. Real-device follow-up should focus on touch release feel, whether the stronger head lag remains balanced during very slow and very fast gestures, high-refresh displays, and whether the return delay feels patient rather than slow. The homepage mascot remains separate from the future **Fling Pet** project, which would require its own product and accessibility decisions.

## Release constraints

- Preserve the existing identity mark and lime, coral, and blue palette
- Keep the homepage focused on projects, with concise Rob attribution
- Acknowledge the small team of agents without making the agents the focus
- Keep contact limited to the approved public email address; do not add forms or social links
- Keep the Left Right Center description brief until launch

## Pre-release checklist

- [ ] Smoke-test ordinary desktop, 768–900px tablet, and 320px mobile viewports
- [ ] Complete keyboard-only navigation and focus-order check
- [ ] Verify reduced-motion behavior at the operating-system or browser level
- [ ] Confirm a clean browser console on initial load and navigation
- [ ] Validate the Open Graph and Twitter social preview in production-facing tools
- [ ] Validate that the sitemap contains only canonical `bobbleheadrob.com` URLs
- [ ] Confirm the deployed file scope matches the contents of `public`
- [ ] Confirm apex-domain and `www` redirect/canonical behavior
- [ ] Confirm DNS records and Cloudflare proxy status
- [ ] Recheck production page, asset, and Guitar Key Compass links

## Not done by design

- No deployment performed as part of this work
- No speculative URL for Left Right Center
- No analytics or visitor tracking
