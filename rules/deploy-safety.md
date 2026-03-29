---
name: "deploy-safety"
description: "Reglas de seguridad globales para el proceso de deploy VTEX IO. Aplican en todos los flujos."
---

# Reglas de Seguridad — Deploy VTEX IO

<vtex-rules>
## Gates obligatorios

- NUNCA ejecutar `vtex deploy` sin aprobación explícita del usuario
- NUNCA ejecutar `vtex promote` sin confirmar primero si hay cambios de Site Editor
- NUNCA omitir la validación del workspace (`vtex browse` + confirmación humana)
- NUNCA continuar si `vtex publish` falla — mostrar el error completo y PARAR
- NUNCA usar `vtex link` en workspaces de producción — no está permitido por VTEX

## Orden obligatorio

- SIEMPRE leer `manifest.json` antes de cualquier operación
- SIEMPRE preguntar patch/minor/major y stable/beta antes de `vtex release`
- SIEMPRE crear workspace de producción (`vtex use {nombre} -p`) — nunca deployar directamente a master
- SIEMPRE validar que el publish compiló correctamente antes de ejecutar `vtex install`

## Manejo de errores de VTEX CLI

- Error de autenticación → pedir al usuario: "Ejecuta `vtex login` y vuelve a intentarlo"
- Error de account → pedir al usuario: "Ejecuta `vtex switch {cuenta}` y vuelve a intentarlo"
- Error de permisos → PARAR y reportar al usuario con el mensaje completo del CLI

## Responsabilidades del agente

- El agente NO valida si la app funciona — eso es responsabilidad del usuario
- El agente solo valida que `vtex publish` compiló correctamente — nada más
- El agente NO crea el PR de develop → main — es una acción separada del usuario
</vtex-rules>
