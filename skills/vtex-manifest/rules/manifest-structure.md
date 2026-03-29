---
title: Manifest Structure & All Fields
impact: CRITICAL
tags: vtex-io, manifest, json, vendor, version, semver, policies, settingsSchema
---

## manifest.json — Structure & Fields

### CRITICAL — Set Vendor from Current Account

**Always** run `vtex ls` before creating any app. The `vendor` field must match the account you are currently logged into.

```bash
vtex ls
# Output example:
# Account: mystore
# Use "mystore" as the vendor
```

### Complete Field Reference

```json
{
  "vendor": "mystore",
  "name": "my-app-name",
  "version": "0.1.0",
  "title": "My App Display Name",
  "description": "Brief description of what this app does",
  "builders": {
    "node": "7.x",
    "react": "3.x",
    "graphql": "2.x",
    "store": "0.x",
    "styles": "2.x",
    "messages": "1.x"
  },
  "dependencies": {
    "vtex.store": "2.x",
    "vtex.styleguide": "9.x"
  },
  "peerDependencies": {
    "vtex.paid-app-example": "1.x"
  },
  "policies": [
    {
      "name": "outbound-access",
      "attrs": {
        "host": "*",
        "path": "*"
      }
    },
    { "name": "LogisticsViewer" },
    { "name": "ADMIN_DS" },
    { "name": "POWER_USER_DS" },
    { "name": "vbase-read-write" },
    { "name": "read-workspace-apps" },
    { "name": "read-write-apps-settings" },
    { "name": "update-app-settings" },
    { "name": "vtex.graphql-server:resolve-graphiql" },
    { "name": "vtex.graphql-server:resolve-graphql" },
    { "name": "vtex.search-resolver:resolve-graphql" }
  ],
  "settingsSchema": {
    "title": "App Settings",
    "type": "object",
    "properties": {
      "apiKey": {
        "title": "API Key",
        "type": "string"
      }
    }
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `vendor` | string | YES | VTEX account responsible for the app. Must match the logged-in account (`vtex ls`). |
| `name` | kebab-case | YES | Unique app identifier. Lowercase letters and hyphens only. No numbers at start. |
| `version` | SemVer | YES | `MAJOR.MINOR.PATCH` following Semantic Versioning 2.0.0. |
| `title` | string | YES | Display name shown in the VTEX Admin and App Store. |
| `description` | string | YES | Brief explanation of the app's purpose. |
| `builders` | object | YES | Builders used by the app. Each builder must have a corresponding folder. |
| `dependencies` | object | NO | VTEX IO apps required and auto-installed with this app. |
| `peerDependencies` | object | NO | Required apps that are NOT auto-installed — user must install them manually. |
| `policies` | array | NO | Permissions for external service access and platform operations. |
| `settingsSchema` | JSON Schema | NO | Defines configuration fields shown as a form in the VTEX Admin. |
| `scripts` | object | NO | Scripts the app can run (e.g., publication hooks). |

### Semantic Versioning Rules

```
MAJOR . MINOR . PATCH
  │       │       └── Bug fixes — backward compatible
  │       └────────── New features — backward compatible
  └────────────────── Breaking changes — NOT backward compatible
```

- Start development at `0.1.0`
- Increment `MAJOR` only when making breaking API changes
- Never modify a published version — always bump the version before publishing

### Naming Rules for `name` Field

- Use **kebab-case**: lowercase letters separated by hyphens
- No special characters (`@`, `_`, `.`)
- No numbers at the start
- Examples: `store-header`, `checkout-custom`, `my-integration-app`

### Policies — Permissions

Policies follow an AWS IAM-style pattern. Declare only what the app actually needs.

```json
"policies": [
  {
    "name": "outbound-access",
    "attrs": {
      "host": "*",
      "path": "*"
    }
  },
  { "name": "LogisticsViewer" },
  { "name": "ADMIN_DS" },
  { "name": "POWER_USER_DS" },
  { "name": "vbase-read-write" },
  { "name": "read-workspace-apps" },
  { "name": "read-write-apps-settings" },
  { "name": "update-app-settings" },
  { "name": "vtex.graphql-server:resolve-graphiql" },
  { "name": "vtex.graphql-server:resolve-graphql" },
  { "name": "vtex.search-resolver:resolve-graphql" }
]
```

| Policy | Purpose |
|--------|---------|
| `outbound-access` | Access an external HTTP API. Use `host: "*", path: "*"` for unrestricted access, or scope to a specific host/path |
| `LogisticsViewer` | Read logistics data (inventory, shipping, warehouses) |
| `ADMIN_DS` | Access VTEX Admin DataSource APIs |
| `POWER_USER_DS` | Access advanced Admin DataSource APIs with elevated privileges |
| `vbase-read-write` | Read/write to VBase (VTEX key-value store) |
| `read-workspace-apps` | Read the list of apps installed in the workspace |
| `read-write-apps-settings` | Read and write app settings in the workspace |
| `update-app-settings` | Update settings of installed apps |
| `vtex.graphql-server:resolve-graphiql` | Access the GraphiQL interactive explorer |
| `vtex.graphql-server:resolve-graphql` | Execute GraphQL queries and mutations via the VTEX GraphQL server |
| `vtex.search-resolver:resolve-graphql` | Execute GraphQL queries via the VTEX Search resolver |

### settingsSchema — Admin Configuration Form

When declared, VTEX auto-generates a settings form in the Admin UI.

```json
"settingsSchema": {
  "title": "My App Settings",
  "type": "object",
  "properties": {
    "apiKey": {
      "title": "API Key",
      "description": "Your external service API key",
      "type": "string"
    },
    "isEnabled": {
      "title": "Enable Feature",
      "type": "boolean",
      "default": true
    },
    "maxItems": {
      "title": "Maximum Items",
      "type": "integer",
      "default": 10
    }
  }
}
```

Supported types: `string`, `boolean`, `integer`, `number`, `object`, `array`.
