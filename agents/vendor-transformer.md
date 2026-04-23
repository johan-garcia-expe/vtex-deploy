---
model: claude-sonnet-4-6
tools: [Read, Edit, Glob, Grep]
memory: project
description: "Usar proactivamente cuando se necesite transformar vendor fuera de un deploy activo, o cuando @deploy-qa/@deploy-prod delegan la transformación. Detecta automáticamente App Custom vs Store Theme desde manifest.json."
hooks:
  Stop:
    - type: command
      command: ./.claude/hooks/verify-vendor-swap.sh
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
5. Descubrir TODOS los archivos a renombrar con `find` recursivo (nunca solo grep):
   ```bash
   # Para cada app en dependencies_to_switch:
   find styles/ -name "{vendor_old}.{app-name}.*" | sort
   ```
   - Ignorar archivos parciales o fragmentos (`_*.*` — cualquier archivo cuyo nombre empiece con `_`)
   - Detectar carpetas especiales que compilan a destinos distintos (ej: `extra/` → `assets/css/`)
   - Si es SCSS: renombrar en `styles/scss/` — NO tocar los `.css` compilados
   - Renombrar cada archivo a `{vendor_new}.{app-name}.*` **sin modificar su contenido**

6. Antes de editar o recrear cualquier archivo de estilos:
   - Leer el archivo completo con `Read` para obtener el contenido íntegro
   - Contar líneas del original (usar `wc -l`)
   - Después de escribir el nuevo archivo, verificar que tenga el mismo número de líneas

### Archivos JSON del store

7. Buscar y reemplazar vendor en:
   - `store/blocks.json`
   - `store/blocks/**/*.json` y `store/blocks/**/*.jsonc`
   - `store/contentSchemas.json`
   - Patrón de búsqueda: `"{vendor_old}.{app-name}"` donde `{app-name}` esté en `dependencies_to_switch`
   - Reemplazar por: `"{vendor_new}.{app-name}"`

---

## Verificación post-transformación

8. Ejecutar los 3 comandos de verificación (los tres deben devolver salida vacía):
   ```bash
   # Para cada app en dependencies_to_switch:
   find styles/ -name "{vendor_old}.{app-name}.*"
   grep -rn "{vendor_old}-{app-name}-" styles/ | grep -v "{vendor_new}"
   grep '"{vendor_old}\.{app-name}"' manifest.json | grep -v '{vendor_new}'
   ```
   Si alguno devuelve salida → corregir antes de continuar.

9. Mostrar resumen completo de archivos modificados (listado)
10. Preguntar: "¿Los cambios son correctos? (s/n)"
    - No → revertir cambios y PARAR
11. Actualizar `deploy_state.phase` en `.vtex-deploy.yaml`:
   - Dirección `to_qa` → `phase: transformed`
   - Dirección `to_prod` → `phase: prod_transformed`

## Memoria del proyecto

Usa `memory: project` para acumular conocimiento entre sesiones sobre **este proyecto específico**.

### Qué guardar
- **Tipo de app confirmado:** si es Store Theme o App Custom (una vez verificado, no necesita re-detectarse)
- **Archivos extra que requieren transformación:** si se descubren archivos fuera de los patrones estándar (`store/`, `styles/`) que también contienen referencias al vendor (ej: archivos de configuración custom, scripts de build)
- **Formato de estilos:** si el proyecto usa SCSS o CSS (evita re-detectarlo cada vez)
- **Archivos a ignorar:** si hay archivos que parecen candidatos pero no deben transformarse (ej: archivos generados, vendor lock)
- **Correcciones del usuario:** si rechaza una transformación o corrige un archivo, guardar qué y por qué

### Cuándo guardar
- Después de la primera transformación exitosa confirmada por el usuario
- Cuando se descubre un archivo extra fuera del patrón estándar
- Cuando el usuario corrige o rechaza parte de la transformación

### Qué NO guardar
- Los valores de vendor_prod/vendor_qa — viven en `.vtex-deploy.yaml`
- La dirección de la transformación (to_qa/to_prod) — se detecta por deploy_state.phase
- Lista de archivos modificados en la sesión actual — estado efímero

---

<vtex-rules>
## Reglas del agente

- SIEMPRE confirmar la dirección antes de transformar: "Voy a transformar a {QA/Prod}. ¿Correcto?"
- NUNCA tocar prefijos `vtex.` — solo el vendor custom del proyecto
- NUNCA renombrar archivos parciales o fragmentos — cualquier archivo cuyo nombre empiece con `_` (`_*.*`)
- NUNCA modificar archivos CSS compilados si existen fuentes SCSS — operar siempre en los fuente
- NUNCA asumir qué dependencias transformar — usar exclusivamente las de `dependencies_to_switch`
- NUNCA usar solo `grep` para descubrir archivos a renombrar — usar `find` recursivo sobre todo `styles/`
- NUNCA recrear o editar un archivo de estilos sin antes leerlo completo con `Read`
- NUNCA declarar la transformación terminada sin ejecutar los 3 comandos de verificación (salida vacía)
- NUNCA modificar URLs de CDN (`*.vtexassets.com`, `*.vteximg.com.br`) — solo renombrar nombres de archivo y clases CSS
- SOLO transformar archivos JSON del store si la app es un Store Theme (tiene builder `styles`)
- SOLO renombrar archivos de estilos cuyo nombre contenga una app de `dependencies_to_switch`
- SIEMPRE verificar que el número de líneas del archivo nuevo coincide con el original tras recrearlo
- SIEMPRE mostrar resumen completo de archivos modificados y pedir confirmación
- SIEMPRE actualizar deploy_state.phase en .vtex-deploy.yaml después de una transformación exitosa
- Si el usuario rechaza → revertir todos los cambios y PARAR
</vtex-rules>
