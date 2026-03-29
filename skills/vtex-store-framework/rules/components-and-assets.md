---
title: Components & Assets
impact: MEDIUM
tags: vtex, store-framework, assets, images, static-files
---

# Components & Assets

## Assets Builder

Handles images and static files within Store Theme. Automatically uploads to VTEX File Manager with immutable URLs.

### Setup

1. Add builder to `manifest.json`:

```json
"builders": {
  "assets": "0.x"
}
```

2. Create `assets/` folder in project root
3. Add image files (`.jpeg`, `.png`, `.gif` — no video)
4. Reference in blocks:

```json
"image#banner": {
  "props": {
    "src": "assets/myimage.png"
  }
}
```

Subfolders supported: `assets/events/vtex-day.jpg`

**Limitations:** Can only reference assets from theme's blocks and CSS — not from React components in other apps.

## Sandbox Blocks

Supports iFrames with custom HTML/CSS/JS. Use only when native components cannot handle the scenario.

```json
"sandbox#h1": {
  "props": {
    "width": "100%",
    "height": "auto",
    "initialContent": "<h1 style=\"text-align:center;\">Hello World</h1>",
    "allowCookies": false
  }
}
```

| Prop | Type | Description |
|---|---|---|
| `width` | `string` | iFrame width |
| `height` | `string` | iFrame height |
| `initialContent` | `string` | HTML content |
| `allowCookies` | `boolean` | Allow cookie access |

**Warning:** Avoid for complex data needs. Performance impact. Use native components first.

## Overriding Native App Blocks

Replace blocks from native VTEX IO apps using `store/plugins.json`:

### Step 1 — Declare native app as dependency

```json
"dependencies": {
  "vtex.original-app": "1.x"
}
```

### Step 2 — Define interface

```json
// store/interfaces.json
{
  "new-block": {
    "component": "NewBlock",
    "required": ["example-child"]
  }
}
```

### Step 3 — Map in plugins.json

```json
// store/plugins.json
{
  "original-block": "new-block"
}
```

### Step 4 — Create React component

```tsx
const NewBlock: React.FC = () => {
  return <h1>HELLO WORLD</h1>
}
export default NewBlock
```

Must replicate the original block's interface schema (e.g., `required` children).

## Native Forms (Master Data v2)

Integrates Store Form app with Master Data v2 JSON schemas for user-facing forms.

### Process

1. Create JSON Schema in Master Data v2 via API (PUT `/api/dataentities/{entity}/schemas/{schemaName}`)
2. Configure the Store Form app block to consume the schema

### JSON Schema Example

```json
{
  "title": "Contact",
  "type": "object",
  "properties": {
    "firstName": { "type": "string", "title": "First Name" },
    "email": { "type": "string", "format": "email", "title": "Email" },
    "agreement": { "type": "boolean", "title": "Agree to terms?" }
  },
  "required": ["firstName", "email", "agreement"],
  "v-security": {
    "publicJsonSchema": true,
    "allowGetAll": false,
    "publicWrite": ["firstName", "email", "agreement"]
  }
}
```

The `v-security` object controls public access. Data is saved to Master Data v2 automatically.

## Product Availability Form

Uses Master Data entity `AS` with the Availability Subscriber block:

| Field | Type |
|---|---|
| `skuId` | Integer |
| `name` | Text |
| `email` | Email |
| `notificationSend` | Boolean |
| `createdAt` | Varchar 100 |
| `sendAt` | Varchar 100 |

App: [Availability Subscriber](https://developers.vtex.com/docs/guides/vtex-store-components-availabilitysubscriber)

> Does NOT include automatic email sending — only stores user interest data.
