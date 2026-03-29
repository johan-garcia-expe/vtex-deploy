---
title: Builders — Purpose of Each
impact: CRITICAL
tags: vtex-io, builders, react, node, store, graphql, styles, messages, admin, pixel, masterdata
---

## Builders in VTEX IO

Builders are the orchestrators of VTEX IO apps. Each builder is responsible for processing, validating, and forwarding a specific block of code to the appropriate runtime or framework. They act as intermediaries that connect different components of an app to the platform services.

**How builders work:**
1. Declare builders in `manifest.json` under the `builders` key
2. Create a folder with the exact same name as the builder in the app root
3. Place the relevant source files inside that folder
4. At build time, each builder transforms its folder's contents into platform-ready configurations

**Prerequisite:** The account must have `vtex.builder-hub@0.293.4` or later installed.

### Builder Declarations

```json
"builders": {
  "react": "3.x",
  "node": "7.x",
  "graphql": "2.x",
  "store": "0.x",
  "styles": "2.x",
  "messages": "1.x",
  "admin": "0.x",
  "pixel": "0.x",
  "masterdata": "1.x",
  "docs": "0.x",
  "assets": "0.x",
  "checkout-ui-custom":"0.x",
}
```

Only declare builders that the app actually uses. Each declared builder requires a matching directory.

---

### `react` — `3.x`

**Purpose:** Develops React components using TypeScript from the `/react` directory.

**Use when:** Building UI components for storefronts or Admin extensions.

**Folder structure:**
```
react/
├── MyComponent.tsx
├── typings/
│   └── vtex.styleguide.d.ts
└── package.json  (optional, for npm dependencies)
```

**Typical use cases:**
- Storefront block components
- Admin pages
- Hooks and context providers

---

### `node` — `7.x`

**Purpose:** Enables backend service development using TypeScript on Node.js 20. Handles REST routes, GraphQL resolvers, and event handlers.

**Use when:** The app needs server-side logic, external API integrations, or GraphQL resolvers.

**Folder structure:**
```
node/
├── index.ts           (service entry point)
├── service.json       (routes and event definitions)
├── package.json
├── tsconfig.json
├── clients/           (HTTP/GraphQL clients)
├── middlewares/       (Koa-style middleware functions)
├── resolvers/         (GraphQL resolvers)
└── typings/
```

**Key notes:**
- Runtime: Node.js 20 with TypeScript 5.5.3
- Uses Koa-style middleware pipeline
- Must expose routes in `node/service.json`

---

### `store` — `0.x`

**Purpose:** Validates blocks, interfaces, routes, and content schemas for Store Framework storefronts.

**Use when:** Creating storefront blocks that extend or compose with Store Framework (the VTEX default storefront system).

**Folder structure:**
```
store/
├── interfaces.json       (block interface declarations)
├── contentSchemas.json   (CMS content type schemas)
└── routes.json           (custom URL routes)
```

---

### `graphql` — `2.x`

**Purpose:** Processes GraphQL API schemas and type definitions. Connects the schema to resolvers in the `node` builder.

**Use when:** The app exposes a GraphQL API or consumes/extends existing VTEX GraphQL APIs.

**Folder structure:**
```
graphql/
├── schema.graphql     (type definitions, queries, mutations)
└── types/
    └── custom.graphql
```

**Important:** All resolvers defined in the schema must be implemented in `node/resolvers/`.

---

### `styles` — `2.x`

**Purpose:** Exports CSS configurations using the Tachyons generator. Allows customizing the design system (colors, spacing, typography) for Store Framework themes.

**Use when:** Creating a Store Theme or customizing visual design tokens.

**Folder structure:**
```
styles/
├── css/
│   └── vtex.vendor.app-name.css   (custom CSS overrides)
└── config/
    └── style.json                 (Tachyons design tokens)
```

---

### `messages` — `1.x`

**Purpose:** Exports localized strings for internationalization (i18n). Enables apps to support multiple languages.

**Use when:** The app displays any user-facing text that must be translated.

**Folder structure:**
```
messages/
├── en.json    (English — default, required)
├── es.json    (Spanish)
└── pt.json    (Portuguese)
```

**Format:**
```json
{
  "store/my-component.title": "My Component Title",
  "store/my-component.button.label": "Click here"
}
```

---

### `admin` — `0.x`

**Purpose:** Exports navigation items, blocks, and routes to the VTEX Admin panel.

**Use when:** Creating extensions, custom pages, or navigation entries in the VTEX Admin.

**Folder structure:**
```
admin/
├── navigation.json    (sidebar menu entries)
└── routes/
```

---

### `pixel` — `0.x`

**Purpose:** Processes Pixel App source code and configuration. Pixel apps inject scripts into storefronts for tracking, analytics, and marketing tools.

**Use when:** Integrating third-party analytics (Google Analytics, Facebook Pixel, etc.) or any client-side tracking script.

**Folder structure:**
```
pixel/
├── pixel.json    (pixel configuration)
└── index.ts      (script logic)
```

---

### `masterdata` — `1.x`

**Purpose:** Declares data entities and their schemas using JSON Schema format. Used to define MasterData v2 data structures.

**Use when:** The app needs to store and retrieve structured data using VTEX MasterData.

**Folder structure:**
```
masterdata/
└── myEntity.json    (JSON Schema for the data entity)
```

---

### `assets` — `0.x`

**Purpose:** Manages and uploads static assets (images, fonts) used by Store Framework blocks.

**Use when:** The storefront or blocks need to serve static media assets through VTEX's CDN.

**Folder structure:**
```
assets/
├── images/
└── fonts/
```

---

### `docs` — `0.x`

**Purpose:** Publishes app documentation to the VTEX Developer Portal automatically.

**Use when:** Publishing an open or installable app that requires end-user documentation.

**Folder structure:**
```
docs/
└── README.md    (app documentation in Markdown)
```

---

### `configuration` — `0.x`

**Purpose:** Manages platform service configurations independently of the app lifecycle. Used for configurations that should persist across app versions.

**Use when:** The app manages infrastructure or service-level configurations.

---

### `paymentProvider` — `1.x`

**Purpose:** Implements payment connectors via the VTEX Payment Provider Framework.

**Use when:** Integrating a payment method or payment gateway into the VTEX checkout.

---

### `checkout-ui-custom` — `0.x`

**Purpose:** Injects custom JavaScript and CSS directly into the native VTEX checkout pages. This builder does not use React — it works with vanilla JS and CSS files that are loaded into the checkout iframe.

**Use when:** Customizing the appearance or behavior of the VTEX native checkout (order form, order placed, cart) without replacing it entirely.

**Folder structure:**
```
checkout-ui-custom/
├── checkout6-custom.js      (custom JS injected into checkout)
├── checkout6-custom.css     (custom CSS for checkout)
```

**Real manifest example:**

```json
{
  "vendor": "account",
  "name": "store-checkout",
  "version": "1.0.48",
  "builders": {
    "checkout-ui-custom": "0.x",
    "store": "0.x",
    "react": "3.x",
    "messages": "1.x"
  },
  "dependencies": {
    "vtex.store": "2.x",
    "vtex.render-runtime": "8.x",
    "vtex.order-manager": "0.x",
    "vtex.order-items": "0.x",
    "vtex.styleguide": "9.x",
    "vtex.css-handles": "1.x",
    "vtex.formatted-price": "0.x",
    "vtex.format-currency": "0.x",
    "vtex.store-icons": "0.x",
    "vtex.checkout-graphql": "0.x",
    "vtex.pixel-manager": "1.x",
    "vtex.order-placed": "2.x",
    "vtex.product-list": "0.x",
    "vtex.rich-text": "0.x",
    "vtex.order-placed-graphql": "1.x"
  },
  "scripts": {
    "prelink": "npm install",
    "postreleasy": "vtex publish --verbose",
    "prereleasy": "npm install && npm run build"
  },
  "credentialType": "absolute",
  "policies": [
    {
      "name": "outbound-access",
      "attrs": {
        "host": "{{account}}.vtexcommercestable.com.br",
        "path": "/api/checkout/pub/orders/*"
      }
    }
  ],
  "$schema": "https://raw.githubusercontent.com/vtex/node-vtex-api/master/gen/manifest.schema"
}
```

**Key notes:**
- `credentialType: "absolute"` — required for checkout apps to have full credential scope
- `{{account}}` in `outbound-access` — the platform substitutes the actual account name at runtime
- `scripts.prelink` / `prereleasy` — use lifecycle hooks to run `npm install` and `npm run build` before linking or releasing, since this builder may require a local build step
- Combine with `react` and `store` builders when the app also provides storefront blocks alongside checkout customization

---

### Builder-to-App-Type Matrix

| App Type | Required Builders | Optional Builders |
|----------|------------------|-------------------|
| Storefront Component | `react`, `store` , `styles`, `messages` |
| Store Theme | `store`, `styles`, `assets` |
| Backend Service | `node` | `graphql`|
| Full-Stack App | `react`, `node`, `graphql`, `store` | `styles`, `messages`, `admin`, `masterdata` |
| Admin Extension | `admin`, `react` | `messages`, `node` |
| Pixel / Analytics | `pixel`, `store` | — |
| Checkout Customization | `checkout-ui-custom` | `react`, `store`, `messages` |
