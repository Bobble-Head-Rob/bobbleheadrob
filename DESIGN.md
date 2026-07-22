# Design

## Direction

The interface pairs warmth with software precision. It should feel credible first and playful second: straightforward, lightly self-aware, and never corporate, childish, or visually noisy.

## Visual language

- **Background:** near-black rather than pure black, with a faint technical grid
- **Type:** the system sans-serif stack for speed and clarity; Georgia is used sparingly as an expressive italic accent; the system monospace stack labels statuses and categories
- **Color:** warm off-white text, muted gray secondary copy, and three restrained accents
  - Lime (`#b8e86f`) signals activity and primary actions
  - Coral (`#ff826c`) adds warmth and curiosity
  - Blue (`#6bbfe5`) supports secondary project identity and keyboard focus
- **Shape:** rounded project surfaces balanced by fine rules, status pills, and schematic illustrations
- **Imagery:** original CSS and SVG forms only; no placeholder or stock imagery

## Page hierarchy

1. The hero establishes identity and tone.
2. The project shelf gives the live project visual priority while keeping the coming-soon project credible.
3. The personal note thanks visitors without turning the homepage into a biography.
4. A lightweight contact section provides one direct email address.
5. The footer closes with a compact brand repeat and current year.

## Responsive behavior

The layout is mobile-first. Project cards stack on small screens and become a two-column shelf at tablet sizes. The full decorative hero composition scales down and centers beneath the primary action on small screens.

## Accessibility

- Semantic landmarks and heading order provide document structure.
- A skip link appears on keyboard focus.
- Focus states use a visible blue outline.
- Text and controls use high-contrast foreground colors.
- Decorative objects are hidden from assistive technology.
- Motion is removed when `prefers-reduced-motion` is enabled.
- Navigation uses actual links and the coming-soon project is not presented as interactive.

## Approved identity

- The main brand is simply BobbleheadRob.
- The existing mark and lime, coral, and blue palette remain in use.
- The homepage stays focused on projects rather than personal biography.
- Copy uses “Rob,” acknowledges the small team of agents, and avoids implying solo authorship.
- Basic contact is limited to the public email address; forms, social links, support promises, and additional contact channels remain out of scope.
