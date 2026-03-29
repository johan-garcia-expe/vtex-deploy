---
name: vtex-manifest
description: Use when creating a new VTEX IO app or project, configuring manifest.json, selecting builders, declaring dependencies or peerDependencies, setting up policies, or understanding the structure and fields of VTEX IO manifest.
related: vtex-react, vtex-service, vtex-store-framework, vtex-scheduler
---

# VTEX IO Manifest

## Overview

Every VTEX IO app requires a `manifest.json` in its root directory. This file is the entry point for the platform — it defines the app's identity, which builders process its code, which other apps it depends on, and which external permissions it needs.

**CRITICAL — Vendor Account:**
Before creating any new VTEX IO project, always run `vtex ls` to identify the currently logged-in account. The `vendor` field in `manifest.json` MUST match that account. Using the wrong vendor will prevent the app from being published or deployed to the correct account.

```bash
vtex ls   # shows current account — use it as the vendor value
```

## Related Skills — MUST load before writing code

> **INSTRUCTION:** Before generating or modifying manifest.json, you MUST load and apply the rules from the skills listed below when the context applies. These are not optional references — they contain mandatory patterns and conventions. Load each relevant skill and follow its rules directly.

| Skill | When to load | What it provides |
|-------|-------------|-----------------|
| **`vtex-react`** | When the app uses the `react` builder | React component conventions, interfaces, CSS handles |
| **`vtex-service`** | When the app uses the `node` builder | Service infrastructure, clients, routes, `service.json` config |
| **`vtex-store-framework`** | When the app uses the `store` builder | Block declarations, templates, store theme structure |
| **`vtex-styleguide`** | When declaring `vtex.styleguide` as a dependency | Component catalog — ensures correct version (`9.x`) |
| **`vtex-scheduler`** | When the app needs outbound-access for scheduled jobs | Scheduler API, CRON job management |

## Rule Categories

| Priority | Rule                             | File                          |
| -------- | -------------------------------- | ----------------------------- |
| 1        | Manifest Structure & All Fields  | `rules/manifest-structure.md` |
| 2        | Builders — Purpose of Each       | `rules/builders-reference.md` |
| 3        | Dependencies vs peerDependencies | `rules/dependencies-guide.md` |

## Minimal manifest.json

Every new VTEX IO app must include at minimum:

```json
{
  "vendor": "<current-account-from-vtex-ls>",
  "name": "my-app-name",
  "version": "0.1.0",
  "title": "My App",
  "description": "What the app does",
  "builders": {
    "node": "7.x"
  },
  "dependencies": {
    "vtex.store": "2.x",
    "vtex.styleguide": "9.x"
  },
  "policies": [],
  "$schema": "https://raw.githubusercontent.com/vtex/node-vtex-api/master/gen/manifest.schema"
}
```

## Real-World Example — Full-Stack Service App

Example from a production app using most available builders (`admin`, `store`, `react`, `messages`, `node`, `graphql`, `masterdata`):

```json
{
  "vendor": "youraccount",
  "name": "sanity-vtex-client",
  "version": "3.0.11",
  "title": "Sanity VTEX Client",
  "description": "Sanity VTEX Client",
  "builders": {
    "admin": "0.x",
    "store": "0.x",
    "react": "3.x",
    "messages": "1.x",
    "node": "7.x",
    "graphql": "2.x",
    "masterdata": "1.x"
  },
  "dependencies": {
    "vtex.breadcrumb": "1.x",
    "vtex.render-runtime": "8.x",
    "vtex.css-handles": "1.x",
    "vtex.store": "2.x",
    "vtex.styleguide": "9.x",
    "vtex.rewriter": "1.x",
    "vtex.product-context": "0.x",
    "vtex.product-summary-context": "0.x",
    "vtex.product-list-context": "0.x",
    "vtex.search-graphql": "0.x",
    "vtex.product-summary": "2.x",
    "vtex.graphql-server": "1.x",
    "vtex.pages-graphql": "2.x",
    "vtex.store-icons": "0.x",
    "vtex.store-sitemap": "2.x",
    "vtex.rich-text": "0.x",
    "vtex.list-context": "0.x",
    "vtex.slider-layout": "0.x",
    "vtex.pixel-manager": "1.x",
    "vtex.structured-data": "0.x",
    "vtex.formatted-price": "0.x",
    "vtex.format-currency": "0.x",
    "vtex.order-manager": "0.x",
    "vtex.add-to-cart-button": "0.x",
    "youraccount.commons-components": "1.x"
  },
  "registries": ["smartcheckout"],
  "scripts": {
    "postreleasy": "vtex publish --verbose"
  },
  "policies": [
    { "name": "outbound-access", "attrs": { "host": "*", "path": "*" } },
    { "name": "ADMIN_DS" },
    { "name": "POWER_USER_DS" },
    { "name": "vbase-read-write" },
    { "name": "read-workspace-apps" },
    { "name": "read-write-apps-settings" },
    { "name": "update-app-settings" },
    { "name": "AdminPortal" },
    { "name": "colossus-fire-event" },
    { "name": "colossus-write-logs" },
    { "name": "cms_settings" },
    { "name": "access-cms-graphql-api" },
    { "name": "vtex.pages-graphql:resolve-graphql" },
    { "name": "vtex.rewriter:route-evaluation" },
    { "name": "vtex.rewriter:resolve-graphql" },
    { "name": "vtex.graphql-server:resolve-graphiql" },
    { "name": "vtex.graphql-server:resolve-graphql" },
    { "name": "vtex.store-sitemap:resolve-graphql" }
  ],
  "settingsSchema": {
    "title": "Settings",
    "type": "object",
    "properties": {
      "sanity": {
        "title": "Sanity Settings",
        "type": "object",
        "properties": {
          "projectId": { "title": "Project ID", "type": "string" },
          "dataset": {
            "title": "Dataset",
            "type": "string",
            "default": "production"
          },
          "apiVersion": {
            "title": "API Version",
            "type": "string",
            "default": "2025-12-05"
          },
          "secret": { "title": "Webhook Secret", "type": "string" },
          "validateIp": {
            "title": "Validate IPs",
            "type": "boolean",
            "default": true
          },
          "validateSignature": {
            "title": "Validate Signature",
            "type": "boolean",
            "default": true
          },
          "studioUrlPrefix": {
            "title": "Sanity Studio URL Prefix",
            "type": "string",
            "default": "yourprefix"
          }
        }
      },
      "vtex": {
        "title": "VTEX Settings",
        "type": "object",
        "properties": {
          "bindingId": { "title": "BindingId", "type": "string" },
          "locale": { "title": "Locale", "type": "string", "default": "es-CO" },
          "appKey": { "title": "App Key", "type": "string" },
          "appToken": { "title": "App Token", "type": "string" }
        }
      },
      "hasSiteMap": {
        "title": "Has Sitemap",
        "description": "Indicates whether the sitemap index has been created",
        "type": "boolean"
      }
    }
  },
  "settingsUiSchema": {
    "sanity": { "secret": { "ui:widget": "password" } },
    "vtex": { "appToken": { "ui:widget": "password" } }
  },
  "$schema": "https://raw.githubusercontent.com/vtex/node-vtex-api/master/gen/manifest.schema"
}
```

**Notes from this example:**

- `registries` — declares custom registries (e.g. `smartcheckout`) beyond the default VTEX registry
- `scripts.postreleasy` — runs `vtex publish` automatically after `vtex releasy`
- `settingsUiSchema` — controls the UI widget type for fields (e.g. `"ui:widget": "password"` to mask sensitive values)
- `youraccount.commons-components` — own-account app as a dependency (same vendor prefix)
- `$schema` — always include for IDE validation and autocomplete

## Real-World Example — Checkout UI Custom

Example of an app using the `checkout-ui-custom` builder to customize the checkout experience:

```json
{
  "vendor": "youraccount",
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
    "vtex.order-placed-graphql": "1.x",
    "youraccount.commons-components": "1.x"
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

**Notes from this example:**

- `checkout-ui-custom: 0.x` — specific builder for injecting JS/CSS into the native VTEX checkout
- `credentialType: "absolute"` — grants the app absolute credential scope for checkout operations
- `outbound-access` with `{{account}}` — the platform replaces `{{account}}` with the actual account name at runtime
- `scripts.prereleasy` / `prelink` — lifecycle hooks to run `npm install` and `npm run build` before linking or releasing

## Quick Builder Reference

| Builder              | Version | Use When                                    |
| -------------------- | ------- | ------------------------------------------- |
| `react`              | `3.x`   | Building React UI components                |
| `node`               | `7.x`   | Backend services, REST/GraphQL APIs         |
| `store`              | `0.x`   | Store Framework storefront blocks           |
| `styles`             | `2.x`   | CSS/Tachyons customization                  |
| `graphql`            | `2.x`   | GraphQL schemas and resolvers               |
| `messages`           | `1.x`   | i18n / translations                         |
| `admin`              | `0.x`   | VTEX Admin extensions                       |
| `pixel`              | `0.x`   | Tracking and analytics scripts              |
| `masterdata`         | `1.x`   | Data entity schemas (MasterData)            |
| `checkout-ui-custom` | `0.x`   | Checkout JS/CSS injection and customization |
| `docs`               | `0.x`   | Developer Portal documentation              |

## Dependency Format

```json
"dependencies": {
  "{account}.{appName}": "{major}.x"
}
```

- `dependencies` → installed automatically by the platform
- `peerDependencies` → must be manually installed by the user/account
