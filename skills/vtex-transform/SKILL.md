---
name: "vtex-transform"
trigger: "transforma a QA, transforma a prod, vendor swap, transform files, cambiar vendor"
description: "Transformación de archivos para cambio de vendor entre QA y Producción. Soporta App Custom (solo manifest.json) y Store Theme (manifest + estilos CSS/SCSS + store blocks JSON)."
related: [vtex-deploy-qa, vtex-deploy-prod]
---

# Transformación de archivos — Vendor Swap

## Pre-requisitos
1. Leer `.vtex-deploy.yaml` → vendor_prod, vendor_qa, dependencies_to_switch
2. Leer `manifest.json` → detectar tipo de app via campo `builders`

## Detección de tipo de app

- `manifest.json` → `builders` contiene `"styles"` → **Store Theme** → transformación completa
- `manifest.json` → `builders` NO contiene `"styles"` → **App Custom** → solo manifest.json

---

## Transformación: App Custom

Modificar solo `manifest.json`:
1. Campo `vendor`: `{vendor_old}` → `{vendor_new}`
2. En `dependencies`: `{vendor_old}.{app}` → `{vendor_new}.{app}`
   - Solo para apps que estén en `dependencies_to_switch`
3. En `peerDependencies`: mismo tratamiento

---

## Transformación: Store Theme

Todo lo de App Custom, más:

### Archivos de estilos

4. Detectar formato:
   - Existe `styles/scss/` → formato SCSS (operar sobre archivos `.scss` fuente)
   - Solo existe `styles/css/` → formato CSS (operar sobre archivos `.css`)
5. Renombrar archivos cuyo nombre contenga el vendor + alguna app de `dependencies_to_switch`:
   - Patrón: `{vendor_old}.{app-name}.*` → `{vendor_new}.{app-name}.*`
   - Buscar archivos a renombrar usando glob por nombre: `**/styles/**/{vendor_old}.{app-name}*.css` (o `.scss`) — NO usar grep por contenido; grep encuentra referencias internas, no los archivos a renombrar
   - Ignorar archivos parciales o fragmentos (`_*.*`) — cualquier archivo cuyo nombre empiece con `_`, aplica para `.css` y `.scss` — ej: `_papajohns.components.css` NO se renombra porque es importado internamente con `@import url(./_papajohns.components.css)`
   - Detectar carpetas especiales que compilan a destinos distintos (ej: `extra/` → `assets/css/`)
   - Si es SCSS: renombrar en `styles/scss/` — NO tocar los `.css` compilados

### Archivos JSON del store

6. Buscar y reemplazar vendor en:
   - `store/blocks.json`
   - `store/blocks/**/*.json` y `store/blocks/**/*.jsonc`
   - `store/contentSchemas.json`
   - Patrón de búsqueda: `"{vendor_old}.{app-name}"` donde `{app-name}` esté en `dependencies_to_switch`
   - Reemplazar por: `"{vendor_new}.{app-name}"`

---

## Verificación post-transformación

7. Mostrar resumen completo de archivos modificados (listado)
8. Preguntar: "¿Los cambios son correctos? (s/n)"
   - No → revertir cambios y PARAR
9. Actualizar `deploy_state.phase` en `.vtex-deploy.yaml`:
   - Dirección `to_qa` → `phase: transformed`
   - Dirección `to_prod` → `phase: prod_transformed`

<vtex-rules>
## Reglas del skill

- SIEMPRE confirmar la dirección antes de transformar: "Voy a transformar a {QA/Prod}. ¿Correcto?"
- NUNCA tocar prefijos `vtex.` — solo el vendor custom del proyecto
- NUNCA renombrar archivos parciales o fragmentos — cualquier archivo cuyo nombre empiece con `_` (`_*.*`), independientemente de la extensión
- NUNCA modificar archivos CSS compilados si existen fuentes SCSS — operar siempre en los fuente
- NUNCA asumir qué dependencias transformar — usar exclusivamente las de `dependencies_to_switch`
- SOLO transformar archivos JSON del store si la app es un Store Theme (tiene builder `styles`)
- SOLO renombrar archivos de estilos cuyo nombre contenga una app de `dependencies_to_switch`
- SIEMPRE mostrar resumen completo de archivos modificados y pedir confirmación
- SIEMPRE actualizar deploy_state.phase en .vtex-deploy.yaml después de una transformación exitosa
</vtex-rules>
