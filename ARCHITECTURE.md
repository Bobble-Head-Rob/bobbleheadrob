# Architecture

## Overview

BobbleheadRob is a dependency-free static website. A browser requests three primary files—HTML, CSS, and JavaScript—plus a small SVG mark. There is no compile step, server runtime, framework, package manager, or client-side router.

## File responsibilities

- `public/index.html` owns content, semantics, links, metadata, and structured data.
- `public/styles.css` owns the layout, design tokens, responsive rules, illustrations, focus states, and reduced-motion behavior.
- `public/app.js` performs one nonessential enhancement: keeping the footer year current.
- `public/assets/` contains the favicon, visual mark, and social preview image.
- `public/robots.txt` and `public/sitemap.xml` support search discovery.
- Root Markdown files contain project guidance and are excluded from deployment.

## Runtime model

The page remains complete if JavaScript fails or is disabled. There are no runtime network calls, cookies, local storage, analytics, third-party fonts, or external assets.

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
