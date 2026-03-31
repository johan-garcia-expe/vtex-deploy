---
name: "vtex-deploy-safety"
description: "Reglas de seguridad para deploy VTEX IO. Se carga al trabajar con manifest.json, .vtex-deploy.yaml o store/."
globs: manifest.json, .vtex-deploy.yaml, store/**
---

<vtex-rules>
## Gates obligatorios de deploy

- NUNCA ejecutar comandos de deploy sin aprobación explícita del usuario en cada gate
- NUNCA ejecutar `vtex deploy` sin aprobación explícita del usuario
- NUNCA ejecutar `vtex promote` sin confirmar primero si hay cambios de Site Editor
- NUNCA continuar si `vtex publish` falla — mostrar el error completo y PARAR
- NUNCA usar `vtex link` en workspaces de producción — no está permitido
- NUNCA ejecutar `vtex link` automáticamente — el usuario lo hace manualmente
- NUNCA crear un workspace sin antes verificar la cuenta con `vtex whoami`
- NUNCA omitir la validación del workspace (`vtex browse` + confirmación humana)

## Orden obligatorio

- SIEMPRE leer `manifest.json` antes de cualquier operación
- SIEMPRE leer `.vtex-deploy.yaml` antes de transformar o deployar
- SIEMPRE preguntar patch/minor/major y stable/beta antes de `vtex release`
- SIEMPRE crear workspace de producción (`vtex use {nombre} -p`) — nunca deployar directamente a master
- SIEMPRE mostrar `vtex browse` y esperar validación humana del workspace
- SIEMPRE preguntar por Site Editor antes de `vtex deploy -f`
- SIEMPRE usar `yes | vtex deploy -f` — nunca sin el flag -f ni sin el `yes |`
- SIEMPRE leer y actualizar deploy_state en .vtex-deploy.yaml para rastrear el progreso
- SIEMPRE eliminar workspaces de dev y producción al finalizar si no se ejecutó `vtex promote`

## Reglas de transformación

- NUNCA transformar archivos directamente en `qa`, `develop` o `main` — siempre en una rama efímera `deploy/*`
- NUNCA tocar prefijos `vtex.` — solo el vendor custom del proyecto
- NUNCA renombrar archivos parciales o fragmentos (`_*.*`)
- NUNCA modificar archivos CSS compilados si existen fuentes SCSS
- NUNCA asumir qué dependencias transformar — usar exclusivamente las de `dependencies_to_switch`
- SIEMPRE confirmar la dirección de transformación con el usuario antes de ejecutar

## Reglas de ramas Git

- NUNCA hacer push directo a main/master — siempre via PR desde develop
- NUNCA mergear `qa` hacia `develop` o `main` — es una rama one-way
- NUNCA crear el PR a `qa` antes del deploy — se crea al final como registro
- SIEMPRE validar el diff del PR y alertar si hay archivos inesperados
- NUNCA advertir si se detecta vendor_qa en una feature branch — es intencional en este proyecto
- El PR de develop → main es decisión exclusiva del usuario — el agente jamás lo crea automáticamente

## Manejo de errores de VTEX CLI

- Si hay sesión activa en otra cuenta → usar `vtex switch {cuenta}`
- Si no hay sesión activa → usar `vtex login {cuenta}`
- Error de autenticación → "Ejecuta `vtex login` y vuelve a intentarlo"
- Error de account → "Ejecuta `vtex switch {cuenta}` y vuelve a intentarlo"
- Error de permisos → PARAR y reportar al usuario con el mensaje completo

## Responsabilidades del agente

- El agente NO valida si la app funciona — eso es responsabilidad del usuario
- El agente NO crea el PR de develop → main automáticamente — es una acción separada del usuario
- El agente solo valida que `vtex publish` compiló correctamente — no más
</vtex-rules>
