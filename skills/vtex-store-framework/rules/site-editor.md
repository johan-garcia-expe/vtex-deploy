---
title: Site Editor Integration
impact: HIGH
tags: vtex, store-framework, site-editor, schema, cms
---

# Site Editor Integration

## Making Components Available in Site Editor

Components become editable in Site Editor by attaching a `schema` static property using JSON Schema format.

### Step 1 — Create component with props interface

```tsx
interface CustomComponentProps {
  title: string
  subtitle: string
}

const CustomComponent = ({ title, subtitle }: CustomComponentProps) => {
  return (
    <>
      <p>{title}</p>
      <p>{subtitle}</p>
    </>
  )
}
```

### Step 2 — Set default props

```tsx
CustomComponent.defaultProps = {
  title: "VTEX",
  subtitle: "The Composable and Complete Commerce Platform.",
}
```

### Step 3 — Define the schema

```tsx
CustomComponent.schema = {
  title: 'Custom Component',
  type: 'object',
  properties: {
    title: {
      type: 'string',
      title: 'Title',
    },
    subtitle: {
      type: 'string',
      title: 'Subtitle',
    },
  },
}

export default CustomComponent
```

### Step 4 — Declare interface

```json
// store/interfaces.json
{
  "custom-component": {
    "component": "CustomComponent"
  }
}
```

### Step 5 — Use in store theme

Add your app to the Store Theme's `manifest.json` dependencies, then use the block:

```json
{
  "store.home": {
    "blocks": ["custom-component"]
  }
}
```

## Schema Types

### String

```tsx
ComponentName.schema = {
  title: 'Component',
  type: 'object',
  properties: {
    text: { type: 'string', title: 'Text' },
  },
}
```

### Boolean

```tsx
properties: {
  active: { type: 'boolean', title: 'Active', default: true },
}
```

### Object (nested)

```tsx
properties: {
  image: {
    title: 'Image',
    type: 'object',
    properties: {
      src: { type: 'string', title: 'URL' },
      alt: { type: 'string', title: 'Alt text' },
    },
  },
}
```

### Array

```tsx
properties: {
  images: {
    type: 'array',
    title: 'Images',
    items: {
      type: 'object',
      title: 'Image',
      properties: {
        __editorItemTitle: { default: 'Image', title: 'Item name', type: 'string' },
        src: { type: 'string', title: 'Desktop URL' },
        mobileSrc: { type: 'string', title: 'Mobile URL' },
        alt: { type: 'string', title: 'Alt text' },
      },
    },
  },
}
```

`__editorItemTitle` makes array item names editable in Site Editor.

### Enum (dropdown)

```tsx
properties: {
  color: {
    type: 'string',
    title: 'Color',
    default: 'red',
    enum: ['red', 'blue', 'black'],
  },
}
```

### EnumNames (human-readable labels)

```tsx
properties: {
  color: {
    type: 'string',
    title: 'Color',
    default: '#0ff102',
    enumNames: ['Green', 'Blue', 'Black'],
    enum: ['#0ff102', '#1038c9', '#000000'],
  },
}
```

## Special Widgets

### Image uploader

```tsx
imageMobile: {
  type: 'string',
  title: 'Mobile Image',
  widget: { "ui:widget": "image-uploader" },
}
```

### Date-time picker

```tsx
date: {
  type: 'string',
  title: 'Date',
  format: 'date-time',
  widget: { "ui:widget": "datetime" },
}
```
