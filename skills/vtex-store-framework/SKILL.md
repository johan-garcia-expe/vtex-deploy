---
name: vtex-store-framework
description: Use when working with VTEX Store Framework store themes — declaring JSON blocks, configuring templates, building pages (PDP, search, custom, 404), using layout apps (Slider, Modal, Stack, Responsive, Tab, Condition, Disclosure, Sticky), building shelves and carousels, integrating with Site Editor, styling with CSS handles, blockClass, markers, and typography, or using assets/sandbox/override blocks.
related: vtex-native-apps, vtex-react, vtex-styleguide, vtex-context, vtex-manifest, vtex-icons, vtex-tachyons-classes
---

# VTEX Store Framework

Store Framework is the front-end development framework for VTEX IO ecommerce storefronts. Built on VTEX IO and React, it offers native storefront components configured via JSON blocks.

## Auto-Detection

Activate this skill when:
- The project has a `store` builder in `manifest.json`
- Files in `store/blocks/` contain JSON block declarations (`store.home`, `store.product`, `store.search`, `store.custom#...`)
- The user asks about templates, block composition, page routing, shelves, carousels, search layouts, Site Editor schemas, CSS handles, or storefront styling
- Code references `routes.json`, `blocks.jsonc`, `interfaces.json`, or `iconpack.svg`

## Related Skills — MUST load before writing code

> **INSTRUCTION:** Before generating code, you MUST load and apply the rules from the skills listed below when the context applies. These are not optional references — they contain mandatory patterns, components, and conventions. Load each relevant skill and follow its rules directly.

| Skill | When to load | What it provides |
|-------|-------------|-----------------|
| **`vtex-native-apps`** | **ALWAYS** — when working with store blocks, you must know available native blocks before creating custom ones | Native app catalog: add-to-cart-button, minicart, search-result, product-summary, store-components, iframe, sandbox |
| **`vtex-react`** | When creating custom React components not covered by native apps | Custom React components, interfaces, CSS handles in code, GraphQL, i18n |
| **`vtex-styleguide`** | When any React component uses interactive UI elements | vtex.styleguide component catalog (Button, Input, Modal, Table, etc.) |
| **`vtex-context`** | When accessing product, order, or search data in React | Native React contexts (ProductContext, OrderForm, etc.) |
| **`vtex-manifest`** | When configuring app builders or dependencies | manifest.json configuration, builders, dependencies |
| **`vtex-icons`** | When customizing the store icon pack | Store icon pack customization (SVG overrides, all icon IDs) |
| **`vtex-tachyons-classes`** | When applying CSS utility classes | Tachyons CSS utility classes reference |

## Rule Categories

| # | Rule | File |
|---|------|------|
| 0 | Project Structure (directory tree, root files, global CSS pattern, design tokens, font setup) | `rules/project-structure.md` |
| 1 | Templates, Blocks & Composition (JSON blocks, children/blocks/slots, naming) | `rules/templates-and-blocks.md` |
| 2 | Building Pages (custom pages, routes, PDP, 404, header/footer override) | `rules/building-pages.md` |
| 3 | Search Results (search layouts, gallery switcher, custom search, filters) | `rules/search-results.md` |
| 4 | Shelves & Product Summary (shelf, horizontal summary, carousel, badges) | `rules/product-shelves.md` |
| 5 | Advanced Layouts (Slider, Modal, Stack, Responsive, Tab, Condition, Disclosure, Sticky) | `rules/layouts.md` |
| 6 | Site Editor Integration (schema, props, contentSchemas, enum, array) | `rules/site-editor.md` |
| 7 | Styling (CSS handles, blockClass, typography, markers, block inspection) | `rules/styling.md` |
| 8 | Components & Assets (assets builder, sandbox, override blocks, forms, delivery promise) | `rules/components-and-assets.md` |

## Quick Start

```bash
# 1. Init project
vtex init  # select "store" → clones minimum-boilerplate-theme

# 2. Update manifest.json vendor
# Set "vendor": "{yourAccountName}"

# 3. Create workspace and link
vtex use {workspace}
cd minimum-boilerplate-theme
vtex link

# 4. Preview
vtex browse
# → https://{workspace}--{account}.myvtex.com
```

## Architecture Overview

| Pillar | Description |
|---|---|
| Composability | Assemble pre-built and custom components via JSON blocks |
| Workspaces | Create multiple store versions; test safely before deploy |
| A/B Tests | Compare traffic between workspaces |
| Cloud Infrastructure | Fully managed, auto-scalable VTEX IO platform |

## Default Page Templates

| Template | Description |
|---|---|
| `store.home` | Home page |
| `store.product` | Product detail page (PDP) |
| `store.search` | Search results page |
| `store.account` | Client account page |
| `store.login` | Login page |
| `store.orderplaced` | Order placed page |
| `store.custom#{name}` | Custom pages (About Us, Landing, etc.) |
| `store.not-found#product` | 404 for product pages |
| `store.not-found#search` | 404 for search pages |

## Manifest Dependencies Format

```json
"dependencies": {
  "vtex.{appName}": "{majorVersion}.x"
}
```
