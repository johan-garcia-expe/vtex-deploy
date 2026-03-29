---
title: Building Pages
impact: CRITICAL
tags: vtex, store-framework, pages, templates, routes, custom-pages
---

# Building Pages

## Custom Pages

### Step 1 — Declare the template

```jsonc
// store/blocks/about-us.jsonc
{
  "store.custom#about-us": {
    "blocks": [
      "container-layout#about-us"
    ]
  },
  "container-layout#about-us": {
    "props": { "classes": "flex flex-row" },
    "children": [
      "image#about-us",
      "container-layout#text-about-us"
    ]
  },
  "container-layout#text-about-us": {
    "children": ["rich-text#about-title", "rich-text#about-content"],
    "props": { "classes": "flex flex-column" }
  },
  "rich-text#about-title": {
    "props": { "text": "# About Us" }
  },
  "rich-text#about-content": {
    "props": { "text": "Lorem ipsum dolor sit amet..." }
  },
  "image#about-us": {
    "props": { "src": "https://example.com/image.png", "maxHeight": "600px" }
  }
}
```

### Step 2 — Define the route

**Option A — Code (`store/routes.json`):**

```json
{
  "store.custom#about-us": {
    "path": "/about-us"
  }
}
```

**Option B — Admin:** Storefront > Pages > Create New > select URL and template.

## Product Detail Page (PDP)

Key block: `store.product`

```json
{
  "store.product": {
    "children": [
      "container-layout#product-breadcrumb",
      "container-layout#product-main",
      "shelf.relatedProducts"
    ]
  },
  "container-layout#product-main": {
    "props": { "classes": "flex flex-row mt4 mb7" },
    "children": ["container-layout#product-image", "container-layout#right-col"]
  },
  "container-layout#product-image": {
    "props": { "classes": "flex flex-column w-60" },
    "children": ["product-images"]
  },
  "container-layout#right-col": {
    "props": { "classes": "flex flex-column" },
    "children": [
      "product-name",
      "product-rating-summary",
      "product-price#product-details",
      "product-separator",
      "product-quantity",
      "sku-selector",
      "container-layout#buy-button",
      "availability-subscriber",
      "shipping-simulator",
      "share#default"
    ]
  },
  "product-price#product-details": {
    "props": { "showInstallments": true, "showSavings": true }
  },
  "product-images": {
    "props": { "displayThumbnailsArrows": true }
  },
  "shelf.relatedProducts": {
    "props": {
      "recommendation": "view",
      "productList": { "titleText": "Who saw also saw", "itemsPerPage": 3 }
    }
  }
}
```

**Blocks accepted by `store.product`:** `breadcrumb`, `product-name`, `product-images`, `product-price`, `product-description`, `product-specifications`, `product-identifier`, `product-quantity`, `sku-selector`, `buy-button`, `availability-subscriber`, `shipping-simulator`, `share`, `product-highlights`, `product-reviews`, `product-rating-summary`, `product-rating-inline`, `product-brand`, `product-assembly-options`, `product-kit`, `product-separator`, `product-teaser.product`

**Related products recommendations:** `similars`, `view`, `buy`, `accessories`, `viewAndBought`, `suggestions`

## Customizing Header and Footer by Page

Use the `parent` key to override header/footer per template:

```json
{
  "store.product": {
    "parent": {
      "header": "header#product",
      "footer": "footer#default"
    }
  },
  "header#product": {
    "blocks": ["header-layout.desktop", "header-layout.mobile"]
  }
}
```

**Removing header/footer (empty children):**

```json
{
  "store.custom#landing": {
    "parent": {
      "header": "header#empty",
      "footer": "footer#empty"
    }
  },
  "header#empty": {
    "blocks": ["header-layout.desktop#empty", "header-layout.mobile#empty"]
  },
  "header-layout.desktop#empty": { "children": [] },
  "header-layout.mobile#empty": { "children": [] },
  "footer#empty": {
    "blocks": ["footer-layout.desktop#empty", "footer-layout.mobile#empty"]
  },
  "footer-layout.desktop#empty": { "children": [] },
  "footer-layout.mobile#empty": { "children": [] }
}
```

## 404 Page

```json
{
  "store.not-found#product": {
    "blocks": ["rich-text#not-found"]
  },
  "rich-text#not-found": {
    "props": {
      "textAlignment": "CENTER",
      "textPosition": "CENTER",
      "text": "**PAGE NOT FOUND**",
      "font": "t-heading-1"
    }
  }
}
```

`store.not-found#product` renders only on 404 for product pages. Use `store.not-found#search` for search pages.

## Content Type Routes

URL parameters ending with `_id` create content types:

```json
{
  "store.custom#finder": {
    "path": "/store/:finder_id"
  }
}
```

- Only one `_id` parameter allowed per URL
- Assets stay associated with the content type, not the URL
- Additional variable parameters are ignored for content matching

## Black Friday / Landing Page from Template

1. Add `"assets": "0.x"` builder to `manifest.json`
2. Create template file in `store/blocks/custom-template/`
3. Use `store.custom#blackfriday-lp` or `store.home#blackfriday-lp` (to replace homepage)
4. Assign via Admin: Storefront > Pages > Create New
