---
name: "vendor-transform"
description: "Reglas para la transformación de archivos al cambiar de vendor entre QA y Producción."
---

# Reglas de Transformación — Vendor Swap

<vtex-rules>
## Antes de transformar

- SIEMPRE confirmar la dirección con el usuario: "Voy a transformar a {QA/Prod}. ¿Correcto?"
- SIEMPRE leer `.vtex-deploy.yaml` para obtener vendor_prod, vendor_qa y dependencies_to_switch
- NUNCA asumir qué dependencias transformar — usar exclusivamente las de `dependencies_to_switch`

## Durante la transformación

- NUNCA tocar prefijos `vtex.` — solo el vendor custom del proyecto
- NUNCA renombrar archivos parciales SCSS (`_*.scss`)
- NUNCA modificar archivos CSS compilados si existen fuentes SCSS — siempre operar en los archivos fuente
- SOLO transformar archivos JSON del store si la app es un Store Theme (builder `styles` en manifest.json)
- SOLO renombrar archivos de estilos cuyo nombre contenga una app de `dependencies_to_switch`

## Después de transformar

- SIEMPRE mostrar listado completo de archivos modificados
- SIEMPRE pedir confirmación del usuario antes de continuar con el deploy
- Si el usuario rechaza → revertir todos los cambios y PARAR
</vtex-rules>
