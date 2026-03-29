---
title: Project Structure
impact: CRITICAL
tags: vtex, store-framework, project-structure, store-theme, directory
---

# Project Structure

## Directory Tree

A complete store theme project follows this structure:

```
{vendor}-store-theme/
├── manifest.json              # App identity, builders, dependencies
├── package.json               # Dev tooling: eslint, prettier, standard-version
├── CHANGELOG.md               # Keep a Changelog format, auto-managed by standard-version
├── README.MD                  # Installation instructions
├── RELEASE.md                 # Release procedure notes
├── TRANSLATE.md               # Message translation mutations (GraphQL vtex.messages)
├── .editorconfig              # Editor settings (LF, 2-space indent, UTF-8)
├── .gitignore                 # node_modules, .build, dist, OS files
├── .vtexignore                # Folders excluded from vtex link/publish (e.g., transactional-email/)
│
├── assets/                    # Static files (requires "assets": "0.x" builder)
│   └── fonts/                 # Custom font files (.woff, .woff2)
│       └── {font-name}/
│           ├── Font-Regular.woff2
│           ├── Font-SemiBold.woff2
│           └── Font-Bold.woff2
│
├── store/                     # Store builder files (requires "store": "0.x" builder)
│   ├── interfaces.json        # Block ↔ component mapping
│   ├── routes.json            # Custom page URL routes
│   └── blocks/                # JSON block declarations (.jsonc)
│       ├── blocks.jsonc       # Shared/global blocks
│       ├── home/
│       │   └── home.jsonc
│       ├── header/
│       │   ├── header.jsonc
│       │   └── menu.jsonc
│       ├── footer/
│       │   ├── footer.jsonc
│       │   └── back-to-top.jsonc
│       ├── product/
│       │   └── product.jsonc
│       └── my-account/
│           └── my-account.jsonc
│
├── styles/                    # Styles builder files (requires "styles": "2.x" builder)
│   ├── configs/
│   │   ├── style.json         # Tachyons design tokens (colors, typography, spacing, breakpoints)
│   │   └── font-faces.css     # @font-face declarations referencing assets/fonts/
│   ├── css/                   # CSS Handle overrides per VTEX app
│   │   └── vtex.store-components.css
│   ├── global/                # Unrestricted global CSS (bypasses VTEX selector limits)
│   │   ├── index.css          # Entry point, imports variables.css
│   │   ├── variables.css      # CSS custom properties (:root), imports figma.css
│   │   └── figma.css          # Design token variables exported from Figma
│   └── iconpacks/
│       └── iconpack.svg       # Custom icon overrides (see skill: vtex-icons)
│
└── transactional-email/       # Email templates (usually .vtexignored)
```

## Root Files

### manifest.json

Defines the app identity, builders, and dependencies. Required builders for a store theme:

```json
{
  "vendor": "{accountName}",
  "name": "store-theme",
  "version": "1.0.0",
  "builders": {
    "assets": "0.x",
    "styles": "2.x",
    "store": "0.x"
  },
  "scripts": {
    "postreleasy": "vtex publish --verbose"
  },
  "dependencies": {
    "vtex.store": "2.x",
    "vtex.store-header": "2.x",
    "vtex.store-footer": "2.x",
    "vtex.store-components": "3.x",
    "vtex.rich-text": "0.x",
    "vtex.slider-layout": "0.x",
    "vtex.stack-layout": "0.x",
    "vtex.menu": "2.x",
    "vtex.minicart": "2.x",
    "vtex.product-summary": "2.x",
    "vtex.search-result": "3.x",
    "vtex.login": "2.x",
    "vtex.my-account": "1.x",
    "vtex.breadcrumb": "1.x",
    "{vendor}.store-blocks": "1.x",
    "{vendor}.commons-components": "1.x"
  }
}
```

> **Do NOT add `vtex.flex-layout` as dependency.** Use `container-layout` from the store-blocks/components app instead (see skill: `vtex-patterns` → `rules/container-layout.md`).

### package.json

Dev tooling only — no runtime dependencies needed for a store theme:

```json
{
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "lint": "eslint --ext js,jsx,ts,tsx ",
    "fix": "eslint --ext js,jsx,ts,tsx  --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css}\"",
    "verify": "yarn lint && yarn test",
    "release": "standard-version",
    "lint:locales": "intl-equalizer"
  },
  "lint-staged": {
    "*.{ts,js,tsx,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,graphql,gql}": ["prettier --write"]
  },
  "devDependencies": {
    "@vtex/prettier-config": "^1.0.0",
    "@vtex/tsconfig": "^0.6.0",
    "eslint": "^7.12.1",
    "eslint-config-vtex": "^12.3.2",
    "husky": "^4.2.3",
    "lint-staged": "^10.1.1",
    "prettier": "^2.0.2",
    "standard-version": "^9.5.0",
    "typescript": "^3.8.3"
  }
}
```

### CHANGELOG.md

Uses [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format. Managed by `standard-version`:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - YYYY-MM-DD
```

### TRANSLATE.md

Documents how to override native VTEX app messages per workspace using the `vtex.messages` GraphQL mutation:

```graphql
mutation Save($saveArgs: SaveArgsV2!) {
  saveV2(args: $saveArgs)
}
```

Query variables follow this structure:

```json
{
  "saveArgs": {
    "to": "es-CO",
    "messages": [
      {
        "srcLang": "en-DV",
        "srcMessage": "store/add-to-cart.add-to-cart",
        "context": "vtex.add-to-cart-button@.x",
        "targetMessage": "AGREGAR"
      }
    ]
  }
}
```

Execute in GraphQL IDE selecting `vtex.messages@...` app. Must be applied per workspace.

### .editorconfig

```ini
root = true

[*]
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
charset = utf-8
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

### .gitignore

Must include: `node_modules/`, `react/node_modules`, `node/node_modules`, `.build/`, `dist`, `build`, `lib`, `.idea`, `.tmp`, `*.orig`, OS files (`Thumbs.db`, `.DS_Store`).

### .vtexignore

Excludes directories from `vtex link` and `vtex publish`. Example:

```
transactional-email/
```

## Global CSS Pattern — Bypassing VTEX Selector Restrictions

VTEX's `styles/css/` files enforce strict CSS selector rules (no child combinator `>`, no specific `:nth-child(n)`, no attribute selectors with values — see `rules/styling.md`). The **global CSS pattern** bypasses these restrictions completely.

### How It Works

The `styles/global/` directory is processed by the styles builder as unrestricted global CSS. Any valid CSS selector works here — no VTEX filtering applied.

The bridge between restricted and unrestricted CSS is a single `@import` line in a `styles/css/` file:

```css
/* styles/css/vtex.store-components.css */
@import url("../global/index.css");
```

This import is the **entry point**: `vtex.store-components.css` (a restricted VTEX CSS handles file) imports `global/index.css`, which then loads the unrestricted global stylesheets.

### Chain of Imports

```
styles/css/vtex.store-components.css
  └── @import "../global/index.css"
        └── @import "./variables.css"
              └── @import "./figma.css"       ← Figma design tokens
```

### File Roles

| File | Purpose |
|------|---------|
| `styles/css/vtex.store-components.css` | **Bridge file** — contains ONLY `@import url("../global/index.css");` |
| `styles/global/index.css` | Entry point for global CSS. Imports `variables.css`. Place global rules here (e.g., `:focus-visible` reset) |
| `styles/global/variables.css` | CSS custom properties on `:root`. Imports `figma.css`. Store-level variables like `--max-width`, `--font-montserrat` |
| `styles/global/figma.css` | Design system tokens exported from Figma — typography scales, spacing, colors, semantic tokens, border radius |

### What You Can Do in `styles/global/` (Unrestricted)

Everything that VTEX normally blocks in `styles/css/`:

```css
/* Child combinator — BLOCKED in styles/css/, ALLOWED in styles/global/ */
.container > .item { ... }

/* Specific nth-child — BLOCKED in styles/css/, ALLOWED in styles/global/ */
.list:nth-child(2) { ... }

/* Attribute selector with value — BLOCKED in styles/css/, ALLOWED in styles/global/ */
[data-testid="product-card"] { ... }

/* Element selectors — BLOCKED in styles/css/, ALLOWED in styles/global/ */
body { ... }
h1, h2, h3 { ... }
input[type="text"] { ... }

/* Any complex selector */
.parent .child:not(:last-child) > span { ... }
```

### Figma Design Tokens Structure

The `figma.css` file organizes tokens in layers:

```
:root (figma.css)
├── Typography: --font-size-*, --font-line-height-*, --font-family-*, --font-weight-*
├── General: --border-*, --sizes-*, --space-*
├── Color primitives: --basic-*, --primary-*, --secondary-*, --accent-*, --error-*, --success-*, --warning-*, --neutral-*
├── Semantic tokens: --bg-*, --c-*, --b--*, --hover-*, --active-*
└── Mapped scales: --f1..--f10, --heading-1..--heading-6, --spacing-1..--spacing-10, --border-radius-*

:root (variables.css)
├── --max-width
├── --font-montserrat (font stack)
└── Store-specific overrides

:root (style.json → Tachyons)
├── typeScale, spacing, customMedia
├── semanticColors (background, text, border, on, hover-*, active-*)
└── typography.styles (heading-1..6, body, small, mini, action, code)
```

### Design Token Naming Convention

| Layer | Pattern | Example |
|-------|---------|---------|
| Primitives | `--{palette}-{shade}` | `--primary-500`, `--neutral-300` |
| Semantic | `--{property}-{role}` | `--bg-action-primary`, `--c-on-base` |
| State | `--{state}-{property}-{role}` | `--hover-bg-action-primary` |
| Scale | `--{category}-{step}` | `--spacing-4`, `--font-size-md` |
| Tokens | `--color-{purpose}` | `--color-primary`, `--color-hover-primary` |

### style.json — Tachyons Configuration

Configures the Tachyons CSS framework tokens. Key sections:

| Section | Purpose |
|---------|---------|
| `semanticColors` | Maps semantic roles (action-primary, danger, muted-1..5) to hex colors for background, text, border, on, hover-*, active-* |
| `typography.styles` | Defines font family, weight, size, textTransform, letterSpacing for heading-1..6, body, small, mini, action, code |
| `customMedia` | Responsive breakpoints: `s` (20em), `ns`/`m` (40em), `l` (64em), `xl` (80em) |
| `spacing` | Scale array used for Tachyons pa/ma classes |

### Font Setup

1. Place font files in `assets/fonts/{font-name}/`
2. Declare `@font-face` in `styles/configs/font-faces.css`:

```css
@font-face {
  font-family: 'Montserrat';
  src: url('assets/fonts/montserrat/Montserrat-Regular.woff2') format('woff2'),
       url('assets/fonts/montserrat/Montserrat-Regular.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

3. Reference in `style.json` typography and in `figma.css` variables

### Block Files Organization

Organize `store/blocks/` by page/section:

```
store/blocks/
├── blocks.jsonc           # Shared blocks used across pages
├── home/home.jsonc        # store.home template
├── header/
│   ├── header.jsonc       # header-row blocks
│   └── menu.jsonc         # menu items
├── footer/
│   ├── footer.jsonc       # footer-row blocks
│   └── back-to-top.jsonc  # back-to-top component
├── product/product.jsonc  # store.product template (PDP)
└── my-account/my-account.jsonc
```

Use `.jsonc` (JSON with comments) for all block files.
