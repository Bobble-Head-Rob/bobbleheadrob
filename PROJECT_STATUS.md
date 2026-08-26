# Project Status

Last reviewed: 2026-08-26

## Current release

Workshop identity, project ownership, cross-property source work, and the branded Workers Static Assets 404 are deployed. The canonical apex host and Cloudflare-managed WWW normalization are verified in production. The interactive mascot remains ready for final manual verification.

### Included projects

| Project | Lifecycle / ownership | Destination |
| --- | --- | --- |
| Guitar Key Compass | Live personal project | <https://guitar.bobbleheadrob.com/> |
| Camp Dice | Graduated / Disdained EGG product | <https://disdainedegg.com/camp-dice/> |

### Analytics

- Cloudflare Web Analytics is intentionally enabled with Automatic Setup for aggregate website traffic measurement, and historical baseline data already exists.
- Current strategic use is to compare pre-launch, launch-week, and post-launch traffic; understand BobbleheadRob discovery; follow page/path and referrer trends; and observe referrals to Disdained EGG around the Camp Dice launch.
- The repository contains no custom application analytics library. `public/app.js` and `public/mascot.js` implement site behavior, Cloudflare security/challenge scripts are separate from Web Analytics, and no Google Analytics or additional analytics stack is authored here.
- This aggregate measurement does not represent user-level tracking, custom conversion events, outbound-click tracking, cross-site identity, or exact individual journeys. Future agents must not remove or replace Cloudflare Web Analytics merely because analytics code is absent from the repository.

### Implementation

- Dependency-free HTML, CSS, and JavaScript
- Mobile-first project shelf and responsive hero
- Semantic landmarks, skip navigation, visible focus styling, and reduced-motion support
- Canonical, description, Open Graph and Twitter card fields, and WebSite JSON-LD
- Same-host search crawler files, favicon, and original social preview image
- Dedicated `public` deployment directory with planning documents excluded
- Branded `public/404.html` recovery page served with a real HTTP 404 through Workers Static Assets `not_found_handling`
- Canonical `https://bobbleheadrob.com` host with the dashboard-managed Cloudflare `WWW to apex` rule permanently normalizing HTTP and HTTPS WWW requests in one hop while preserving path and query string
- No external asset requests, custom analytics integration, forms, or tracking in the authored source; production aggregate measurement is Cloudflare-managed through Web Analytics Automatic Setup
- Workshop identity copy that distinguishes BobbleheadRob from Disdained EGG without making the company relationship dominant
- Crawlable links to the Disdained EGG homepage and authoritative Camp Dice product home
- A brief personal note near the bottom of the homepage
- A lightweight contact section linking to `rob@bobbleheadrob.com`
- Pointer-aware, draggable hero mascot with capped fling physics, viewport collisions, impact response, and automatic return
- Multi-window release-intent estimation with duplicate filtering, a short release grace, bounded mouse calibration, and deliberate-pause drop behavior
- Unrestricted loose-state whole-body rotation with leverage- and curvature-derived fling spin, contact-derived collision torque, floor rolling, and angular friction
- Orientation-aware collision extents and settling that permit upright or either-side rest while tipping unstable inverted head balances consistently
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
- Browser-driven centered, off-center head, off-center base, curved, clockwise, counterclockwise, multi-revolution, ground-roll, sideways-settle, and rotational-unwind checks
- Browser-driven rotated collision-bound checks and clean final docking after sideways and multi-turn loose states
- A 224-case static compound-envelope matrix covering eight whole-body angles, maximum legal head travel, diagonal offsets, base tilt, and non-uniform scale with no measured visible edge intrusion
- High-energy browser and fixed-step stress checks for head, spring, and base edge contact, repeated tumbling, torque direction, multi-turn stability, and less than 0.11px residual proxy penetration
- Automated hint timing, sequence completion, offscreen gating, interaction suppression, session persistence, responsive placement, and accessibility-source checks
- Source-level JavaScript syntax, page-link, fragment-target, metadata, XML, and deployment-file-scope checks
- Recorded-gesture release comparisons plus ten automated short mouse-style flicks and ten longer mouse-style throws in a visible local browser

### Independent and real-device validation outstanding

- Independent visual and interaction review in ordinary desktop and mobile browsers
- Physical touch-device testing on representative iOS and Android hardware
- Rob's final physical-mouse approval of short flick reliability, button-release grace, gentle placement, and head-versus-base throw feel
- Rob's final physical mouse-wheel, trackpad, and mobile scrolling approval of docked scroll strength, rebound feel, and post-scroll idle resumption
- Rob's final physical-device approval of high-energy spin, glancing-impact torque, rolling weight, inverted tipping, and upright-versus-sideways settling feel
- Manual keyboard-only navigation and operating-system reduced-motion review
- Subjective tuning review for startle intensity, hard impacts, and return timing

The current physics tuning gives secondary head motion more personality while keeping the base trajectory and interaction controls conservative. Real-device follow-up should focus on touch release feel, whether the stronger head lag remains balanced during very slow and very fast gestures, high-refresh displays, and whether the return delay feels patient rather than slow. The homepage mascot remains separate from the future **Fling Pet** project, which would require its own product and accessibility decisions.

## Release constraints

- Preserve the existing identity mark and lime, coral, and blue palette
- Keep the homepage focused on projects, with concise Rob attribution
- Keep BobbleheadRob distinct from Disdained EGG in purpose, ownership, and presentation
- Keep contact limited to the approved public email address; do not add forms or social links
- Keep graduated product entries concise and send visitors to the authoritative company home
- Keep Guitar Key Compass a BobbleheadRob personal tool

## Pre-release checklist

- [ ] Smoke-test ordinary desktop, 768–900px tablet, and 320px mobile viewports
- [ ] Complete keyboard-only navigation and focus-order check
- [ ] Verify reduced-motion behavior at the operating-system or browser level
- [ ] Confirm a clean browser console on initial load and navigation
- [ ] Validate the Open Graph and Twitter social preview in production-facing tools
- [ ] Validate that the sitemap contains only canonical `bobbleheadrob.com` URLs
- [x] Verify canonical-host normalization; Cloudflare redirects HTTP and HTTPS `www` requests directly to the HTTPS apex with a path- and query-preserving 301
- [ ] After owner approval, push `main` for automatic Cloudflare Workers Builds deployment and verify the branded 404 in production
- [ ] Confirm DNS records and Cloudflare proxy status in the separate infrastructure audit
- [ ] Recheck production page, asset, and Guitar Key Compass links

## Not done by design

- No manual deployment; production changes flow through the approved GitHub-integrated Workers Builds workflow
- No live hosting, DNS, domain, analytics, or Cloudflare account configuration changes
- Production uses GitHub-integrated Cloudflare Workers Builds; pushing `main` is production-affecting and requires owner approval
- Dashboard-only infrastructure such as the `WWW to apex` redirect is documented separately because Git alone does not reproduce it; do not duplicate that redirect in Worker or application code unless the architecture intentionally changes
- No local Camp Dice product page or duplicated company product content
- No changes to Guitar Key Compass or the Disdained EGG repository
