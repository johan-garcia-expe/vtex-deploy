---
title: Dependencies vs peerDependencies
impact: CRITICAL
tags: vtex-io, manifest, dependencies, peerDependencies, versions, semver
---

## Dependencies vs peerDependencies

VTEX IO provides two mechanisms for declaring app dependencies in `manifest.json`. Understanding the difference is critical to building apps that install and function correctly.

---

### `dependencies` — Auto-Installed

Apps listed under `dependencies` are **automatically installed** in the account when your app is installed. The platform handles version resolution and installation transparently.

```json
"dependencies": {
  "vtex.store": "2.x",
  "vtex.styleguide": "9.x",
  "vtex.store-graphql": "2.x",
  "vtex.render-runtime": "8.x"
}
```

**Use `dependencies` when:**
- Your code directly imports components, types, or hooks from another app
- Your app uses blocks or interfaces defined by another app
- You consume GraphQL schemas or REST definitions from another app
- The dependency is free and open to install

**Important limitation:** Apps installed as indirect dependencies (via another app's `dependencies`) cannot declare public routes or receive public HTTP traffic directly. They function only as supporting libraries.

---

### `peerDependencies` — Manual Installation Required

Apps listed under `peerDependencies` are **NOT automatically installed**. The user or account admin must install them manually before your app can function.

```json
"peerDependencies": {
  "vtex.store": "2.x",
  "vtex.paid-app-example": "1.x"
}
```

**Use `peerDependencies` when:**
- The dependency is a **paid/commercial app** — auto-installing would create unexpected billing
- You need to enforce a **specific major version** that may have breaking differences from other installed versions
- The dependency must be explicitly present in the workspace (not just transitively)

**Development note:** When developing an app that has peer dependencies, you must manually install all peer dependencies in your development workspace before linking:

```bash
vtex install vtex.store@2.x
vtex install vtex.paid-app-example@1.x
vtex link
```

---

### Comparison Table

| Aspect | `dependencies` | `peerDependencies` |
|--------|---------------|-------------------|
| Installation | Automatic | Manual (by account admin) |
| Billing | Transparent | User decides to accept |
| Version enforcement | Platform resolves | Exact major required |
| Typical use | Free VTEX apps, utilities | Paid apps, critical version constraints |
| Dev workflow | Installed automatically | Must `vtex install` before `vtex link` |

---

### Declaration Format

Both fields use the same format:

```json
"{account}.{appName}": "{major}.x"
```

- `account` — the VTEX account that owns/publishes the app (e.g., `vtex`)
- `appName` — the app name in kebab-case
- `{major}.x` — locks to a specific major version, allowing any compatible minor/patch

**Examples:**

```json
"dependencies": {
  "vtex.store": "2.x",
  "vtex.styleguide": "9.x",
  "vtex.store-graphql": "2.x",
  "vtex.checkout-ui-custom": "0.x",
  "vtex.product-context": "0.x",
  "vtex.search-result": "3.x",
  "vtex.shelf": "1.x"
},
"peerDependencies": {
  "vtex.b2b-organizations": "1.x"
}
```

---

### Minimum Required Dependencies by App Type

#### Storefront / Store Theme
```json
"dependencies": {
  "vtex.store": "2.x",
  "vtex.styleguide": "9.x"
}
```

#### Storefront with React Components
```json
"dependencies": {
  "vtex.store": "2.x",
  "vtex.styleguide": "9.x",
  "vtex.render-runtime": "8.x"
}
```

#### Backend Service (Node)
```json
"dependencies": {}
```
Node-only services typically don't depend on other VTEX IO apps unless they need specific GraphQL schemas or type definitions.

#### Admin Extension
```json
"dependencies": {
  "vtex.admin": "0.x",
  "vtex.styleguide": "9.x"
}
```

---

### Common VTEX IO App Dependencies

| App | Version | Purpose |
|-----|---------|---------|
| `vtex.store` | `2.x` | Store Framework core — required for all storefronts |
| `vtex.styleguide` | `9.x` | VTEX design system UI components |
| `vtex.render-runtime` | `8.x` | React rendering runtime |
| `vtex.store-graphql` | `2.x` | Store Framework GraphQL API types |
| `vtex.product-context` | `0.x` | Product data context provider |
| `vtex.search-result` | `3.x` | Search result blocks |
| `vtex.shelf` | `1.x` | Product shelf block |
| `vtex.checkout-ui-custom` | `0.x` | Checkout customization |
| `vtex.admin` | `0.x` | Admin panel framework |
| `vtex.messages` | `1.x` | i18n messages access |
