# Project Status

Last reviewed: 2026-07-21

## Current release

Pre-release landing-page revision complete and ready for final browser and infrastructure verification.

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

## Release constraints

- Preserve the existing identity mark and lime, coral, and blue palette
- Keep the homepage focused on projects, with concise Rob attribution
- Acknowledge the small team of agents without making the agents the focus
- Do not add contact or social links
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

- No deployment or Cloudflare Pages project setup
- No commit or remote push
- No speculative URL for Left Right Center
- No analytics or visitor tracking
