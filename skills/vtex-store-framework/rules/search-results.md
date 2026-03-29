---
title: Search Results
impact: HIGH
tags: vtex, store-framework, search, search-result, filters, gallery
---

# Search Results

## Custom Search Results Page

Uses `search-result-layout.customQuery` with a `querySchema` prop.

### Route + Template

```json
// store/routes.json
{
  "store.custom#landing": {
    "path": "/landing"
  }
}
```

### Block Declaration

```json
{
  "store.custom#landing": {
    "blocks": ["image#landing", "search-result-layout.customQuery"]
  },
  "search-result-layout.customQuery": {
    "props": {
      "querySchema": {
        "orderByField": "OrderByReleaseDateDESC",
        "hideUnavailableItems": true,
        "maxItemsPerPage": 8,
        "queryField": "Blue Top Retro Camera",
        "mapField": "ft"
      }
    },
    "blocks": [
      "search-result-layout.desktop",
      "search-result-layout.mobile",
      "search-not-found-layout"
    ]
  },
  "search-result-layout.desktop": {
    "children": [
      "breadcrumb.search",
      "search-title.v2",
      "container-layout#top",
      "search-fetch-previous",
      "container-layout#results",
      "search-fetch-more"
    ],
    "props": {
      "pagination": "show-more",
      "preventRouteChange": true
    }
  },
  "container-layout#top": {
    "props": { "classes": "flex flex-row" },
    "children": ["total-products.v2", "order-by.v2"]
  },
  "container-layout#results": {
    "props": { "classes": "flex flex-row" },
    "children": ["container-layout#filter", "container-layout#search"]
  },
  "container-layout#filter": {
    "props": { "classes": "flex flex-column w-20" },
    "children": ["filter-navigator.v3"]
  },
  "container-layout#search": {
    "props": { "classes": "flex flex-column w-80" },
    "children": ["search-content"]
  },
  "search-content": {
    "blocks": ["gallery", "not-found"]
  },
  "gallery": {
    "blocks": ["product-summary.shelf"]
  }
}
```

### `querySchema` Properties

| Property | Type | Description |
|---|---|---|
| `orderByField` | `string` | Sort order (e.g., `OrderByReleaseDateDESC`, `OrderByTopSaleDESC`) |
| `hideUnavailableItems` | `boolean` | Hide out-of-stock items |
| `maxItemsPerPage` | `number` | Items per page |
| `queryField` | `string` | Search query |
| `mapField` | `string` | Map type (`ft` = fulltext, `c` = category, `b` = brand) |

## Multiple Gallery Layouts (Grid + List)

### Step 1 — Configure `gallery` with `layouts`

```json
"gallery": {
  "props": {
    "layouts": [
      {
        "name": "grid",
        "component": "GridSummary",
        "itemsPerRow": {
          "desktop": 4,
          "tablet": 3,
          "phone": 2
        }
      },
      {
        "name": "list",
        "component": "ListSummary",
        "itemsPerRow": 1
      }
    ],
    "ListSummary": "product-summary.shelf#listLayout",
    "GridSummary": "product-summary.shelf"
  }
}
```

Responsive `itemsPerRow` with media queries:

```json
"itemsPerRow": {
  "(min-width:1008px)": 4,
  "(min-width:623px) and (max-width:1007px)": 3,
  "(max-width:622px)": 2
}
```

### Step 2 — Set default layout

```json
"search-result-layout.desktop": {
  "props": {
    "pagination": "show-more",
    "defaultGalleryLayout": "grid"
  }
}
```

### Step 3 — Layout switcher

```json
"gallery-layout-switcher": {
  "children": ["gallery-layout-option#grid", "gallery-layout-option#list"]
},
"gallery-layout-option#grid": {
  "props": { "name": "grid" },
  "children": ["icon-grid", "rich-text#option-grid"]
},
"gallery-layout-option#list": {
  "props": { "name": "list" },
  "children": ["icon-inline-grid", "rich-text#option-list"]
}
```

CSS Handle for selected state: `galleryLayoutOptionButton--selected`

## Delivery Promise Filters (Beta)

Dependency: `"vtex.shipping-option-components": "1.x"`

```json
"shipping-option-location-selector": {
  "props": {
    "compactMode": true,
    "callToAction": "modal",
    "dismissible": false,
    "shippingSelection": "delivery-and-pickup"
  }
}
```

| Prop | Values | Description |
|---|---|---|
| `compactMode` | `boolean` | Compact display |
| `callToAction` | `"modal"`, `"popover-input"`, `"popover-button"` | Trigger type |
| `dismissible` | `boolean` | Allow closing without postal code |
| `shippingSelection` | `"delivery-and-pickup"`, `"only-pickup"` | Delivery methods |
