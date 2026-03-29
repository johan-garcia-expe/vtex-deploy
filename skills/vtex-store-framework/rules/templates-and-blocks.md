---
title: Templates, Blocks & Composition
impact: CRITICAL
tags: vtex, store-framework, templates, blocks, composition, json
---

# Templates, Blocks & Composition

## Core Concepts

- **Templates** declare JSON blocks that determine which components render on each page
- **Blocks** are the smallest Store Framework abstraction — self-contained pieces of code exported by independent apps
- **Props** define the visual identity and behavior of blocks
- Block files go in the `store/blocks/` folder as `.json` or `.jsonc` (JSONC supports comments)

## Block Naming

Use `#` to create unique identifiers for block instances:

```json
"rich-text#question": {
  "props": {
    "text": "**Want to know more?**",
    "blockClass": "question"
  }
}
```

- `rich-text` — block type (exported by the app)
- `#question` — unique identifier for this instance

## Block Composition — 3 Types

### `blocks` — Fixed position

Position on the page is fixed regardless of declaration order:

```json
"shelf#home": {
  "blocks": ["product-summary.shelf"]
}
```

### `children` — Order-dependent position

First declared = top of page. Order matters:

```json
"product-summary.shelf": {
  "children": [
    "product-summary-name",
    "product-summary-image",
    "product-summary-price",
    "product-summary-buy-button"
  ]
}
```

### `slots` — Dynamic placeholders

Placeholders within a block for inserting dynamic content.

> The composition type (`blocks` vs `children`) is defined by the exporting app's `interfaces.json` file. Check the app documentation.

## Home Page Template Example

```jsonc
// store/blocks/home/home.jsonc
{
  "store.home": {
    "blocks": [
      "list-context.image-list#demo",
      "container-layout#deals",
      "rich-text#shelf-title",
      "container-layout#shelf",
      "info-card#home",
      "newsletter"
    ]
  },

  "rich-text#shelf-title": {
    "props": {
      "text": "## Summer",
      "blockClass": "shelfTitle"
    }
  },

  "info-card#home": {
    "props": {
      "id": "info-card-home",
      "isFullModeStyle": false,
      "textPosition": "left",
      "imageUrl": "https://example.com/banner.png",
      "headline": "Clearance Sale",
      "callToActionText": "DISCOVER",
      "callToActionUrl": "/sale/d",
      "textAlignment": "center"
    }
  }
}
```

## Dependency Registration

Every block requires its exporting app in `manifest.json`:

```json
"dependencies": {
  "vtex.rich-text": "0.x",
  "vtex.store-components": "3.x",
  "vtex.slider-layout": "0.x"
}
```
