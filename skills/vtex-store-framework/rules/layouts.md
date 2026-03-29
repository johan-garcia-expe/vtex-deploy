---
title: Advanced Layouts
impact: HIGH
tags: vtex, store-framework, layouts, flex-layout, slider-layout, modal-layout, tab-layout
---

# Advanced Layouts

## Available Layout Apps

| App | Dependency | Description |
|---|---|---|
| Container Layout | **skill: `vtex-patterns`** -> `rules/container-layout.md` | Shared wrapper with Tachyons `classes`, `active` toggle, `blockClass` |
| Slider Layout | `"vtex.slider-layout": "0.x"` | Sliders and carousels |
| Modal Layout | `"vtex.modal-layout": "0.x"` | Modals and popups |
| Stack Layout | `"vtex.stack-layout": "0.x"` | Blocks stacked on top of each other |
| Responsive Layout | `"vtex.responsive-layout": "0.x"` | Render blocks at specific breakpoints |
| Condition Layout | `"vtex.condition-layout": "2.x"` | Conditional rendering based on product, binding, category, telemarketing |
| Tab Layout | `"vtex.tab-layout": "0.x"` | Tabbed layouts |
| Sticky Layout | `"vtex.sticky-layout": "0.x"` | Fixed/sticky elements |
| Disclosure Layout | `"vtex.disclosure-layout": "1.x"` | Expand/collapse (accordion, FAQ) |
| Overlay Layout | `"vtex.overlay-layout": "0.x"` | Dropdown, popover, tooltip |

---

## Container Layout (Experimentality)

Primary layout block in all Experimentality projects. Uses Tachyons classes via the `classes` prop for all layout needs. Full reference -> **skill: `vtex-patterns`** -> `rules/container-layout.md`.

**Do not use `vtex.flex-layout`** -- use `container-layout` instead.

```json
"container-layout#product-main": {
  "props": {
    "classes": "flex flex-row mt4 mb7 pt7",
    "blockClass": "product-main"
  },
  "children": ["container-layout#left", "container-layout#right"]
},
"container-layout#left": {
  "props": { "classes": "flex flex-column w-60" },
  "children": ["product-images"]
},
"container-layout#right": {
  "props": { "classes": "flex flex-column" },
  "children": ["product-name", "product-price", "buy-button"]
}
```

Key props: `classes` (Tachyons: `flex`, `flex-row`, `flex-column`, `w-50`, `pa4`, `mt4`, `items-center`, `justify-between`), `active` (conditional rendering), `blockClass` (CSS Handle modifier)

---

## Condition Layout

Dependency: `"vtex.condition-layout": "2.x"`

Conditionally renders blocks based on runtime context (product data, binding, category, telemarketing session).

### Exported Blocks

| Block | Context |
|---|---|
| `condition-layout.product` | Product detail page context |
| `condition-layout.binding` | Store binding context |
| `condition-layout.category` | Category/department page context |
| `condition-layout.telemarketing` | Telemarketing session context |

**Never use `condition-layout` directly** -- always use a context-specific variant.

### Props (all condition-layout blocks)

| Prop | Type | Default | Description |
|---|---|---|---|
| `conditions` | `array of object` | `undefined` | List of conditions to evaluate |
| `matchType` | `enum` | `"all"` | Matching logic: `"all"` (AND), `"any"` (OR), `"none"` (NOR) |
| `Then` | `block` | `undefined` | Block to render when conditions are met |
| `Else` | `block` | `undefined` | Block to render when conditions are NOT met |

### Condition Object

| Prop | Type | Default | Description |
|---|---|---|---|
| `subject` | `string` | `undefined` | Data field to evaluate |
| `arguments` | `object` | `undefined` | Parameters for the condition |
| `toBe` | `boolean` | `true` | Whether data must match (`true`) or not match (`false`) |

### Subjects for `condition-layout.product`

| Subject | Arguments | Description |
|---|---|---|
| `productId` | `{ id: string }` | Current product ID |
| `categoryId` | `{ id: string }` | Current category ID |
| `brandId` | `{ id: string }` | Current brand ID |
| `selectedItemId` | `{ id: string }` | Selected SKU item ID |
| `productClusters` | `{ id: string }` | Product cluster (collection) IDs |
| `categoryTree` | `{ id: string }` | Category tree IDs (PDP only) |
| `specificationProperties` | `{ name: string, value?: string }` | Product specifications (`value` optional -- omit to check name only) |
| `areAllVariationsSelected` | none | Whether all SKU variations are selected |
| `isProductAvailable` | none | Whether product is available for purchase |
| `hasMoreSellersThan` | `{ quantity: number }` | If seller count exceeds given quantity |
| `hasBestPrice` | `{ value: boolean }` or none | If product has a discount/best price |
| `sellerId` | `{ ids: string[] }` | If current sellers match any in given ID list |

### Subjects for `condition-layout.binding`

| Subject | Arguments |
|---|---|
| `bindingId` | `{ id: string }` |

### Subjects for `condition-layout.category`

| Subject | Arguments |
|---|---|
| `category` | `{ ids: string[] }` |
| `department` | `{ ids: string[] }` |

### Subjects for `condition-layout.telemarketing`

| Subject | Arguments |
|---|---|
| `impersonable` | `{ value: boolean }` |

### Usage Examples

**Product condition -- show custom layout for specific product:**

```json
{
  "store.product": {
    "children": ["condition-layout.product#cond1"]
  },
  "condition-layout.product#cond1": {
    "props": {
      "conditions": [
        {
          "subject": "productId",
          "arguments": { "id": "12" }
        }
      ],
      "Then": "container-layout#custom-pdp-layout-12",
      "Else": "container-layout#default"
    }
  }
}
```

**Binding condition -- different content per store binding:**

```json
{
  "condition-layout.binding#cond42": {
    "props": {
      "conditions": [
        {
          "subject": "bindingId",
          "arguments": { "id": "13fb71d0-binding-code-here-87h9c28h9013" }
        }
      ],
      "Then": "container-layout#just-for-this-binding",
      "Else": "container-layout#for-other-bindings"
    }
  }
}
```

**Category condition with `matchType: "any"`:**

```json
{
  "condition-layout.category#cond42": {
    "props": {
      "conditions": [
        {
          "subject": "department",
          "arguments": { "ids": ["1", "42"] }
        },
        {
          "subject": "category",
          "arguments": { "ids": ["301", "304"] }
        }
      ],
      "matchType": "any",
      "Then": "container-layout#just-for-this-category-or-department",
      "Else": "container-layout#for-other-category-or-department"
    }
  }
}
```

**Telemarketing condition:**

```json
{
  "condition-layout.telemarketing#show-block": {
    "props": {
      "conditions": [
        {
          "subject": "impersonable",
          "arguments": { "value": true }
        }
      ],
      "Then": "container-layout#just-for-telemarketers",
      "Else": "container-layout#for-other-user-roles"
    }
  }
}
```

### Notes

- v1 is deprecated; always use v2 (`"vtex.condition-layout": "2.x"`)
- `categoryTree` subject is only available on the Product Detail Page
- No CSS handles on the app itself -- style the child blocks instead

---

## Disclosure Layout

Dependency: `"vtex.disclosure-layout": "1.x"`

Expand/collapse pattern for FAQs, accordions, and collapsible sections.

### Exported Blocks

| Block | Description |
|---|---|
| `disclosure-layout` | Parent wrapper (mandatory) |
| `disclosure-trigger` | Clickable trigger to toggle content |
| `disclosure-content` | Collapsible content area |
| `disclosure-state-indicator` | Shows icons/blocks based on open/closed state |
| `disclosure-layout-group` | Groups multiple disclosure-layouts (accordion) |
| `disclosure-trigger-group` | Shared trigger for all items in a group |

### Props

#### `disclosure-layout`

| Prop | Type | Default | Description |
|---|---|---|---|
| `initialVisibility` | `enum` | `"hidden"` | Initial state: `"visible"` or `"hidden"` |
| `animated` | `boolean` | `false` | Enables CSS animations; adds `data-*` attributes for CSS selectors |

#### `disclosure-trigger`

| Prop | Type | Default | Description |
|---|---|---|---|
| `Show` | `block` | `undefined` | Block rendered when content is hidden (click to show) |
| `Hide` | `block` | `undefined` | Block rendered when content is visible (click to hide) |
| `as` | `string` | `"button"` | HTML tag for the trigger element |
| `children` | `block` | `undefined` | Fallback block if Show/Hide not declared |
| `blockClass` | `string` | `undefined` | CSS customization identifier |

#### `disclosure-content`

| Prop | Type | Default | Description |
|---|---|---|---|
| `blockClass` | `string` | `undefined` | CSS customization identifier |

#### `disclosure-state-indicator`

| Prop | Type | Default | Description |
|---|---|---|---|
| `Show` | `block` | `undefined` | Block rendered when content is hidden |
| `Hide` | `block` | `undefined` | Block rendered when content is visible |

#### `disclosure-layout-group`

| Prop | Type | Default | Description |
|---|---|---|---|
| `maxVisible` | `enum` | `"one"` | Simultaneous open items: `"one"` (accordion) or `"many"` |

#### `disclosure-trigger-group`

| Prop | Type | Default | Description |
|---|---|---|---|
| `Show` | `block` | `undefined` | Block rendered when showing |
| `Hide` | `block` | `undefined` | Block rendered when hiding |
| `as` | `string` | `"button"` | HTML tag |
| `children` | `block` | `undefined` | Fallback block |
| `blockClass` | `string` | `undefined` | CSS customization identifier |

### CSS Handles

`content`, `content--visible`, `content--hidden`, `trigger`, `trigger--visible`, `trigger--hidden`, `triggerGroup`, `triggerGroup--visible`, `triggerGroup--hidden`

### Usage Examples

**Simple FAQ item:**

```json
{
  "disclosure-layout#simple": {
    "children": ["disclosure-trigger#simple", "disclosure-content#simple"]
  },
  "disclosure-trigger#simple": {
    "children": ["rich-text#question"]
  },
  "disclosure-content#simple": {
    "children": ["rich-text#answer"]
  },
  "rich-text#question": {
    "props": { "text": "How can I change my shipping address?" }
  },
  "rich-text#answer": {
    "props": { "text": "Call us at (212) 123-1234" }
  }
}
```

**Accordion group (only one open at a time):**

```json
{
  "disclosure-layout-group#group": {
    "children": ["disclosure-layout#first", "disclosure-layout#second"]
  },
  "disclosure-layout#first": {
    "children": ["disclosure-trigger#first", "disclosure-content#first"]
  },
  "disclosure-trigger#first": {
    "children": ["rich-text#question1"]
  },
  "disclosure-content#first": {
    "children": ["rich-text#answer1"]
  },
  "rich-text#question1": {
    "props": { "text": "How can I change my shipping address?" }
  },
  "rich-text#answer1": {
    "props": { "text": "Call us at (212) 123-1234." }
  },
  "disclosure-layout#second": {
    "children": ["disclosure-trigger#second", "disclosure-content#second"]
  },
  "disclosure-trigger#second": {
    "children": ["rich-text#question2"]
  },
  "disclosure-content#second": {
    "children": ["rich-text#answer2"]
  },
  "rich-text#question2": {
    "props": { "text": "How can I track my order?" }
  },
  "rich-text#answer2": {
    "props": { "text": "After logging in, find information in the Orders link." }
  }
}
```

**State indicator (arrow icons):**

```json
{
  "disclosure-state-indicator": {
    "props": {
      "Show": "icon-angle--down",
      "Hide": "icon-angle--up"
    }
  }
}
```

---

## Modal Layout

Dependency: `"vtex.modal-layout": "0.x"`

Renders content inside a modal dialog.

### Exported Blocks

| Block | Description |
|---|---|
| `modal-trigger` | Wraps the trigger element and the modal-layout |
| `modal-layout` | The modal container |
| `modal-header` | Optional header with close button |
| `modal-content` | Content area inside the modal |
| `modal-actions` | Footer actions area |
| `modal-actions.close` | Close/cancel button |

### Props

#### `modal-trigger`

| Prop | Type | Default | Description |
|---|---|---|---|
| `trigger` | `enum` | `"click"` | Activation method: `"click"`, `"load"`, `"load-session"` |
| `customPixelEventId` | `string` | `undefined` | Store event ID that triggers opening |
| `customPixelEventName` | `string` | `undefined` | Store event name that triggers opening (e.g. `"addToCart"`) |

#### `modal-layout`

| Prop | Type | Default | Description |
|---|---|---|---|
| `scroll` | `enum` | `"content"` | Scroll behavior: `"body"` or `"content"` |
| `blockClass` | `string` | `undefined` | CSS customization identifier |
| `disableEscapeKeyDown` | `boolean` | `false` | Disable closing with Escape key |
| `fullScreen` | `boolean` | `false` | Fill entire screen (responsive) |
| `backdrop` | `enum` | `"clickable"` | Backdrop behavior: `"clickable"` or `"none"` (responsive) |
| `customPixelEventId` | `string` | `undefined` | Store event ID that triggers closing |
| `customPixelEventName` | `string` | `undefined` | Store event name that triggers closing |

#### `modal-header`

| Prop | Type | Default | Description |
|---|---|---|---|
| `showCloseButton` | `boolean` | `true` | Whether to render the close button |
| `iconCloseSize` | `number` | `32` | Close icon size in pixels |

#### `modal-actions.close`

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | Language-dependent | Button text (defaults to "Cancel"/"Cancelar") |

### CSS Handles

`modal`, `backdropContainer`, `backdrop`, `closeButtonContainer`, `closeButton`, `container`, `contentContainer`, `headerContainer`, `headerContent`, `paper`, `topRow`, `triggerContainer`

### Usage Examples

**Basic modal:**

```json
{
  "modal-trigger#example": {
    "children": ["rich-text#trigger", "modal-layout#example"]
  },
  "rich-text#trigger": {
    "props": { "text": "Click me" }
  },
  "modal-layout#example": {
    "children": ["modal-header", "modal-content#example"]
  },
  "modal-content#example": {
    "children": ["rich-text#modal-content"]
  },
  "rich-text#modal-content": {
    "props": { "text": "Hello from modal" }
  }
}
```

**Quickview modal pattern:**

```json
{
  "modal-trigger#quickview": {
    "children": ["icon-expand", "modal-layout#quickview"],
    "props": { "blockClass": "quickview" }
  },
  "modal-layout#quickview": {
    "children": ["modal-header", "modal-content#quickview", "modal-actions"]
  }
}
```

**Confirmation modal pattern:**

```json
{
  "modal-trigger#confirmation": {
    "children": ["icon-delete", "modal-layout#confirmation"]
  },
  "modal-layout#confirmation": {
    "children": ["modal-actions#confirmation"]
  },
  "modal-actions#confirmation": {
    "children": ["modal-actions.close", "remove-button"]
  }
}
```

Pattern: `modal-trigger` -> `[icon, modal-layout]` -> `modal-actions` -> `[modal-actions.close, original-action]`

### Notes

- Structure: first child of `modal-trigger` is the trigger element; sibling `modal-layout` defines content
- Using `customPixelEventName` without `customPixelEventId` triggers on every matching event
- `fullScreen` and `backdrop` props are responsive (can differ per device breakpoint)
- `modal-header` must be explicitly declared as a child -- it does not auto-render

---

## Overlay Layout

Dependency: `"vtex.overlay-layout": "0.x"`

Renders a popover/dropdown/tooltip attached to a trigger element.

### Exported Blocks

| Block | Description |
|---|---|
| `overlay-trigger` | Wraps trigger element and overlay content |
| `overlay-layout` | The popover content container |

### Props

#### `overlay-trigger`

| Prop | Type | Default | Description |
|---|---|---|---|
| `trigger` | `enum` | `"click"` | Activation: `"click"` or `"hover"` |

#### `overlay-layout`

| Prop | Type | Default | Description |
|---|---|---|---|
| `placement` | `enum` | `"bottom"` | Popover position: `"bottom"`, `"left"`, `"right"`, `"top"` |
| `scrollBehavior` | `enum` | `"default"` | On scroll: `"lock-page-scroll"`, `"close-on-scroll"`, `"default"` |
| `backdrop` | `enum` | `"none"` | Backdrop: `"visible"` (click to close) or `"none"` |
| `showArrow` | `boolean` | `false` | Show arrow pointing to trigger |
| `offsets` | `object` | `{ skidding: 0, distance: 0 }` | Positioning offsets in pixels |

#### `offsets` object

| Prop | Type | Description |
|---|---|---|
| `skidding` | `number` | Lateral offset (side-by-side with trigger) |
| `distance` | `number` | Distance from trigger element |

### CSS Handles

`arrow`, `container`, `outsideClickHandler`, `paper`, `popper`, `popperArrow`, `trigger`

### Usage Example

```json
{
  "overlay-trigger": {
    "children": ["rich-text#question", "overlay-layout"]
  },
  "rich-text#question": {
    "props": {
      "text": "**Click to open the Overlay Layout**",
      "blockClass": "question"
    }
  },
  "overlay-layout": {
    "props": { "placement": "left" },
    "children": ["rich-text#link"]
  },
  "rich-text#link": {
    "props": {
      "text": "\n**Reach us at**\nwww.vtex.com.br",
      "blockClass": "link"
    }
  }
}
```

### Notes

- If the chosen placement lacks space, the component auto-repositions to a fallback
- When `backdrop` is `"visible"`, clicking the backdrop closes the overlay
- The `overlay-trigger` block itself is not rendered -- its first child acts as the visible trigger

---

## Responsive Layout

Dependency: `"vtex.responsive-layout": "0.x"`

Renders children only at specific device breakpoints. No props beyond `children`.

### Exported Blocks

| Block | Breakpoint |
|---|---|
| `responsive-layout.desktop` | Desktop screens |
| `responsive-layout.mobile` | All mobile (tablet + phone) |
| `responsive-layout.tablet` | Tablet only |
| `responsive-layout.phone` | Phone only |

### Usage Example

```json
{
  "responsive-layout.desktop#textGrid": {
    "children": ["rich-text#desktop"]
  },
  "responsive-layout.tablet#textGrid": {
    "children": ["rich-text#tablet"]
  },
  "responsive-layout.phone#textGrid": {
    "children": ["rich-text#phone"]
  },
  "rich-text#desktop": {
    "props": { "text": "# This will only show up on desktop." }
  },
  "rich-text#tablet": {
    "props": { "text": "# This will only show up on tablet." }
  },
  "rich-text#phone": {
    "props": { "text": "# This will only show up on phone." }
  }
}
```

### Notes

- Each block uses `composition: children` -- simply pass child blocks
- Content is rendered ONLY when screen size matches the breakpoint
- `responsive-layout.mobile` covers both tablet and phone

---

## Slider Layout

Dependency: `"vtex.slider-layout": "0.x"`

Renders children as slides in a carousel/slider.

### Exported Blocks

| Block | Description |
|---|---|
| `slider-layout` | Main slider block (mandatory) |
| `slider-layout-group` | Groups multiple slider-layouts for synchronized control |

### Props (`slider-layout`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `"slider"` | ARIA label describing the slider purpose |
| `showNavigationArrows` | `enum` | `"always"` | Arrow visibility: `"mobileOnly"`, `"desktopOnly"`, `"always"`, `"never"` |
| `showPaginationDots` | `enum` | `"always"` | Dot visibility: `"mobileOnly"`, `"desktopOnly"`, `"always"`, `"never"` |
| `infinite` | `boolean` | `false` | Enable infinite/circular scrolling |
| `usePagination` | `boolean` | `true` | Page-based navigation vs. smooth scrolling |
| `itemsPerPage` | `object` | `{ desktop: 5, tablet: 3, phone: 1 }` | Visible items per breakpoint |
| `navigationStep` | `number/enum` | `"page"` | Items to advance per arrow click; number or `"page"` |
| `slideTransition` | `object` | `{ speed: 400, delay: 0, timing: "" }` | CSS transition settings |
| `autoplay` | `object` | `undefined` | Autoplay configuration |
| `fullWidth` | `boolean` | `true` | Slides fill container width; arrows overlay slides |
| `arrowSize` | `number/object` | `25` | Arrow size in px (can be responsive object) |
| `centerMode` | `enum/object` | `"disabled"` | Slide centering: `"center"`, `"to-the-left"`, `"disabled"` |
| `centerModeSlidesGap` | `number` | `undefined` | Gap between slides in center mode (px) |

#### `itemsPerPage` object

| Prop | Type | Default |
|---|---|---|
| `desktop` | `number` | `5` |
| `tablet` | `number` | `3` |
| `phone` | `number` | `1` |

#### `slideTransition` object

| Prop | Type | Default | Description |
|---|---|---|---|
| `speed` | `number` | `400` | Transition speed in ms |
| `delay` | `number` | `0` | Delay between transitions in ms |
| `timing` | `string` | `""` | CSS timing function (e.g. `"ease-in-out"`) |

#### `autoplay` object

| Prop | Type | Default | Description |
|---|---|---|---|
| `timeout` | `number` | `undefined` | Milliseconds between auto-advances |
| `stopOnHover` | `boolean` | `undefined` | Pause autoplay on mouse hover |

### CSS Handles

`paginationDot`, `paginationDot--isActive`, `paginationDotsContainer`, `slide`, `slide--firstVisible`, `slide--hidden`, `slide--lastVisible`, `slide--visible`, `slideChildrenContainer`, `sliderArrows`, `sliderLayoutContainer`, `sliderLeftArrow`, `sliderRightArrow`, `sliderTrack`, `sliderTrackContainer`

### Usage Examples

**Carousel with autoplay:**

```json
{
  "slider-layout#text-test": {
    "props": {
      "itemsPerPage": { "desktop": 1, "tablet": 1, "phone": 1 },
      "infinite": true,
      "showNavigationArrows": "desktopOnly",
      "blockClass": "carousel"
    },
    "children": ["rich-text#1", "rich-text#2", "rich-text#3"]
  },
  "rich-text#1": { "props": { "text": "Test1" } },
  "rich-text#2": { "props": { "text": "Test2" } },
  "rich-text#3": { "props": { "text": "Test3" } }
}
```

**Slider layout group:**

```json
{
  "slider-layout-group#test": {
    "children": ["slider-layout#1", "slider-layout#2", "slider-layout#3"]
  }
}
```

### Notes

- All `slider-layout` blocks in a `slider-layout-group` **must have identical props/configuration**; only `children` may differ. Mismatched configs cause unsupported errors.
- Integrates with Google Analytics 4 via `view_promotion` events for promotion tracking
- Can be used as a replacement for the legacy Carousel app

---

## Sticky Layout

Dependency: `"vtex.sticky-layout": "0.x"`

Makes elements stick to the top or bottom of the viewport when scrolling past them.

### Exported Blocks

| Block | Description |
|---|---|
| `sticky-layout` | Makes its children stick on scroll |
| `sticky-layout.stack-container` | Stacks multiple sticky-layouts to prevent overlapping |

### Props

#### `sticky-layout`

| Prop | Type | Default | Description |
|---|---|---|---|
| `blockClass` | `string` | `""` | CSS customization identifier |
| `position` | `enum` | -- | Stick position: `"top"` or `"bottom"` |
| `verticalSpacing` | `number` | `0` | Distance in px from the stick position |

#### `sticky-layout.stack-container`

| Prop | Type | Default | Description |
|---|---|---|---|
| `position` | `enum` | -- | Stick position: `"top"` or `"bottom"`. Overrides children positions. |

### CSS Handles

`container`, `wrapper`, `wrapper--stuck` (applied when element is stuck to screen)

### Usage Examples

**Sticky buy button at bottom:**

```json
{
  "sticky-layout#buy-button": {
    "props": { "position": "bottom" },
    "children": ["container-layout#buy-button"]
  }
}
```

**Stacked sticky header (prevents overlap):**

```json
{
  "sticky-layout.stack-container#header": {
    "props": { "position": "top" },
    "children": [
      "sticky-layout#links-menu",
      "notification.bar#home",
      "sticky-layout#main-menu"
    ]
  }
}
```

### Notes

- Element is positioned `relative` until it crosses the scroll threshold, then becomes `fixed`
- Use `sticky-layout.stack-container` when you have multiple sticky elements to prevent them from overlapping -- children stack instead of overlap

---

## Tab Layout

Dependency: `"vtex.tab-layout": "0.x"`

Renders content in a tabbed interface.

### Exported Blocks

| Block | Description |
|---|---|
| `tab-layout` | Root container (mandatory) |
| `tab-list` | Container for tab buttons (mandatory) |
| `tab-list.item` | Individual tab button |
| `tab-list.item.children` | Tab button with custom children (instead of label) |
| `tab-content` | Container for tab content panels (mandatory) |
| `tab-content.item` | Individual content panel |

### Props

#### `tab-layout`

| Prop | Type | Default | Description |
|---|---|---|---|
| `defaultActiveTabId` | `string` | `undefined` | Tab ID to show initially; defaults to first tab |
| `blockClass` | `string` | `undefined` | CSS customization identifier |

#### `tab-list`

| Prop | Type | Default | Description |
|---|---|---|---|
| `blockClass` | `string` | `undefined` | CSS customization identifier |

#### `tab-list.item`

| Prop | Type | Default | Description |
|---|---|---|---|
| `tabId` | `string` | `undefined` | Unique ID linking this tab to its `tab-content.item` |
| `label` | `string` | `undefined` | Text displayed on the tab button |
| `defaultActiveTab` | `boolean` | `false` | Mark this tab as initially active |
| `blockClass` | `string` | `undefined` | CSS customization identifier |

#### `tab-list.item.children`

| Prop | Type | Default | Description |
|---|---|---|---|
| `tabId` | `string` | `undefined` | Unique ID linking this tab to its `tab-content.item` |
| `blockClass` | `string` | `undefined` | CSS customization identifier |

#### `tab-content`

| Prop | Type | Default | Description |
|---|---|---|---|
| `blockClass` | `string` | `undefined` | CSS customization identifier |

#### `tab-content.item`

| Prop | Type | Default | Description |
|---|---|---|---|
| `tabId` | `string` | `undefined` | Unique ID linking content to its `tab-list.item` |
| `blockClass` | `string` | `undefined` | CSS customization identifier |

### CSS Handles

`container`, `contentContainer`, `contentItem`, `listContainer`, `listItem`, `listItemActive`, `listItemChildren`, `listItemChildrenActive`

### Usage Example

```json
{
  "tab-layout#home": {
    "children": ["tab-list#home", "tab-content#home"],
    "props": {
      "blockClass": "home",
      "defaultActiveTabId": "home1"
    }
  },
  "tab-list#home": {
    "children": ["tab-list.item#home1", "tab-list.item#home2"]
  },
  "tab-list.item#home1": {
    "props": {
      "tabId": "home1",
      "label": "Home 1",
      "defaultActiveTab": true
    }
  },
  "tab-list.item#home2": {
    "props": {
      "tabId": "home2",
      "label": "Home 2"
    }
  },
  "tab-content#home": {
    "children": ["tab-content.item#home1", "tab-content.item#home2"]
  },
  "tab-content.item#home1": {
    "props": { "tabId": "home1" },
    "children": ["carousel#home"]
  },
  "tab-content.item#home2": {
    "props": { "tabId": "home2" },
    "children": ["shelf#home", "info-card#home", "rich-text#question", "rich-text#link", "newsletter"]
  }
}
```

### Notes

- `tab-layout`, `tab-list`, and `tab-content` are all mandatory parent blocks
- The `tabId` prop **must match** between `tab-list.item` and `tab-content.item` to link a tab to its content panel
- Declare `tab-content.item` children blocks explicitly to render content
- Use `tab-list.item.children` instead of `tab-list.item` when you need custom content (icons, images) inside a tab button instead of a plain text label
