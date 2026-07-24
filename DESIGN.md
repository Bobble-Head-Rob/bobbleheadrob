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

The layout is mobile-first. Project cards stack on small screens and become a two-column shelf at tablet sizes. The full decorative hero composition scales down and centers beneath the primary action on small screens. When the character is loose, viewport-relative transforms keep it reachable without changing the hero or project layout.

## Mascot behavior

The mascot should feel observant and pleasantly physical, not frantic. Near-pointer eye tracking and head lean are restrained; fast approaches can produce a brief recoil. Drag ownership follows the part the visitor grabs: the head trails a driven base, while the base trails beneath a directly driven head. Both modes preserve the visual grab point and support two-axis spring motion, overshoot, and settling while the spring bends sideways or changes length. Releases can carry momentum, and impacts deform the base while transferring inertia into the head. Scroll reactions are strongest at the hero dock and deliberately reduced while the mascot is loose.

Slow overlapping idle forces and occasional bounded impulses replace a mechanical repeating nod. At the dock, the base stays planted while expressive but controlled lateral, vertical, and rotational head motion produces the bobble. Shadow offset and restrained parallax add depth without changing the established flat geometric construction. The rings, star, and plus stay anchored as part of the original composition.

## Accessibility

- Semantic landmarks and heading order provide document structure.
- A skip link appears on keyboard focus.
- Focus states use a visible blue outline.
- Text and controls use high-contrast foreground colors.
- Decorative objects are hidden from assistive technology.
- `prefers-reduced-motion` removes sustained idle, startle, fling, and impact motion while preserving eye tracking and direct dragging.
- Navigation uses actual links and the coming-soon project is not presented as interactive.
- The mascot is decorative, hidden from assistive technology, and excluded from the keyboard focus order.

## Approved identity

- The main brand is simply BobbleheadRob.
- The existing mark and lime, coral, and blue palette remain in use.
- The homepage stays focused on projects rather than personal biography.
- Copy uses “Rob,” acknowledges the small team of agents, and avoids implying solo authorship.
- Basic contact is limited to the public email address; forms, social links, support promises, and additional contact channels remain out of scope.
