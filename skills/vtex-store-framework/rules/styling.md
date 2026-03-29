---
title: Styling
impact: HIGH
tags: vtex, store-framework, styling, css-handles, tachyons, blockClass
---

# Styling

## CSS Handles

CSS handles are unique identifiers on HTML elements that allow targeting and customizing block styles.

### Identifying Handles

Navigate to `https://{workspace}--{account}.myvtex.com?__inspect` (development workspace only). Hover over elements to see available handles.

### Applying General Customization

1. In `styles/css/`, create a file named after the app: e.g., `vtex.menu.css`
2. Use the handle as a class selector:

```css
/* styles/css/vtex.menu.css */
.menuItem {
  background: rgba(0, 0, 0, 0.2);
  margin: 5px;
  border-radius: 5px;
}
```

### Customizing a Single Block (`blockClass`)

1. Add `blockClass` prop to the block:

```json
"menu-item#your-item": {
  "props": {
    "blockClass": "header"
  }
}
```

2. Target the specific instance in CSS:

```css
.menuItem--header {
  background: blue;
}
```

### Allowed CSS Selectors

- Class selectors (`.foo`)
- Pseudo-selectors: `:hover`, `:visited`, `:active`, `:disabled`, `:focus`, `:empty`, `:target`
- `:not()`, `:first-child`, `:last-child`
- `:nth-child(even)`, `:nth-child(odd)`, `:nth-child(2n)`, `:nth-child(4n)`, etc.
- All pseudo-elements: `::before`, `::after`, `::placeholder`
- Space combinator (`.foo .bar`)
- `[data-...]` attribute selectors
- `:global(vtex-{AppName}-{AppVersion}-{ComponentName})`
- Media queries: `@media (max-width: 768px)`

### Disallowed Selectors (linking will fail)

- `:nth-child(2)` (specific index, not step)
- Child combinator (`foo > bar`)
- Attribute selectors with specific values (`[alt="bar"]`)

## Markers Prop

For customizing specific text messages within blocks:

1. Add `markers` prop:

```json
"product-price-savings#summary": {
  "props": {
    "markers": ["discount"]
  }
}
```

2. In Site Editor, wrap the message variable: `<discount>-{savingsPercentage}</discount>`
3. This generates a CSS class like `vtex-product-price-1-x-savings-discount` for targeted styling

## Typography

### Prerequisites

Requires `"assets": "0.x"` and `"styles": "2.x"` builders in `manifest.json`.

### Setup

1. Place font files (`.ttf`, `.woff`, `.woff2`) in `assets/fonts/`
2. Create `styles/configs/font-faces.css`:

```css
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  src: local("Roboto"),
    url("assets/fonts/roboto-v20-latin-regular.woff2") format("woff2"),
    url("assets/fonts/roboto-v20-latin-regular.woff") format("woff");
}

@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  src: local("Roboto Medium"),
    url("assets/fonts/roboto-v20-latin-500.woff2") format("woff2"),
    url("assets/fonts/roboto-v20-latin-500.woff") format("woff");
}
```

3. Reference in component CSS files:

```css
/* styles/css/vtex.minicart.css */
.closeIconContainer::before {
  font-family: Roboto;
  font-weight: 500;
}
```

## Block Inspection Tool

Append `?__inspect` to any development workspace URL to interactively inspect blocks. Hover shows:
- The VTEX IO app exporting the block
- Block name
- Associated CSS classes/handles
