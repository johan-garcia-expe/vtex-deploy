---
title: Shelves & Product Summary
impact: HIGH
tags: vtex, store-framework, shelves, product-summary, slider-layout, list-context
---

# Shelves & Product Summary

## Building a Shelf

A shelf combines three blocks: `list-context.product-list`, `product-summary.shelf`, and `slider-layout`.

### Dependencies

```json
"dependencies": {
  "vtex.product-summary": "2.x",
  "vtex.slider-layout": "0.x"
}
```

### Block Declaration

```json
{
  "list-context.product-list#demo1": {
    "blocks": ["product-summary.shelf#demo1"],
    "children": ["slider-layout#demo-products"],
    "props": {
      "orderBy": "OrderByTopSaleDESC"
    }
  },

  "product-summary.shelf#demo1": {
    "children": [
      "product-summary-name",
      "product-summary-image",
      "product-summary-price",
      "product-summary-sku-selector",
      "product-summary-buy-button"
    ]
  },

  "slider-layout#demo-products": {
    "props": {
      "itemsPerPage": {
        "desktop": 5,
        "tablet": 3,
        "phone": 1
      },
      "infinite": true,
      "showNavigationArrows": "desktopOnly",
      "blockClass": "shelf"
    }
  }
}
```

**Pattern:** `list-context.product-list` (data) → `product-summary.shelf` (card template via `blocks`) → `slider-layout` (display via `children`)

## Building a Carousel (Image)

Uses `list-context.image-list` + `slider-layout`:

```json
{
  "list-context.image-list#demo": {
    "children": ["slider-layout#demo-images"],
    "props": {
      "height": 650,
      "images": [
        {
          "image": "https://example.com/banner1.png",
          "mobileImage": "https://example.com/banner1-mobile.png",
          "description": "Banner 1",
          "link": { "url": "/sale" }
        },
        {
          "image": "https://example.com/banner2.png",
          "description": "Banner 2"
        }
      ]
    }
  },
  "slider-layout#demo-images": {
    "props": {
      "itemsPerPage": { "desktop": 1, "tablet": 1, "phone": 1 },
      "infinite": true
    }
  }
}
```

Image list item props: `image`, `mobileImage`, `description`, `link`

## Horizontal Product Summary

Use Container Layout to lay out product summary blocks horizontally:

```json
{
  "product-summary.shelf": {
    "children": ["container-layout#product-summary-mobile"]
  },
  "container-layout#product-summary-mobile": {
    "props": { "classes": "flex flex-row" },
    "children": [
      "container-layout#product-image",
      "container-layout#product-summary-details"
    ]
  },
  "container-layout#product-image": {
    "props": { "classes": "flex flex-column" },
    "children": ["product-summary-image#shelf"]
  },
  "product-summary-image#shelf": {
    "props": { "showBadge": false, "aspectRatio": "1:1", "maxHeight": 300 }
  },
  "container-layout#product-summary-details": {
    "props": { "classes": "flex flex-column ml4" },
    "children": [
      "product-summary-name",
      "product-list-price",
      "product-selling-price",
      "product-installments",
      "product-summary-sku-selector#buy-together"
    ]
  }
}
```

## Rendering a Badge on Products

Combine `stack-layout` + `product-highlights`:

```json
{
  "product-summary.shelf": {
    "children": ["stack-layout#prodsum", "product-summary-name", "product-summary-price"]
  },
  "stack-layout#prodsum": {
    "children": [
      "product-summary-image#shelf",
      "vtex.product-highlights@2.x:product-highlights#collection"
    ]
  },
  "vtex.product-highlights@2.x:product-highlights#collection": {
    "props": { "type": "collection" },
    "children": ["product-highlight-wrapper"]
  },
  "product-highlight-wrapper": {
    "props": { "blockClass": "collection" },
    "children": ["product-highlight-text"]
  },
  "product-highlight-text": {
    "props": { "message": "{highlightName}" }
  }
}
```

Dependencies: `"vtex.product-highlights": "2.x"`, `"vtex.stack-layout": "0.x"`

**Pattern:** `stack-layout` renders children stacked (first = base, last = overlay). `product-highlights` with `type: "collection"` pulls highlight names from VTEX Admin Collections.

## SKU Selector Custom Images

```json
"sku-selector": {
  "props": { "thumbnailImage": ["LabelId"] }
},
"product-images": {
  "props": {
    "displayThumbnailsArrows": true,
    "hiddenImages": ["LabelId"]
  }
}
```

1. Upload image to SKU in Catalog with a unique Label
2. Use that label in `thumbnailImage` to show as SKU selector
3. Use `hiddenImages` to hide it from the main gallery
