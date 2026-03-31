# Checkpoint — Guardar estado del deploy

Guarda el estado actual del deploy en `.vtex-deploy/session-state.md` para poder retomar en una nueva sesión después de ejecutar `/clear`.

## Pasos

1. Lee `.vtex-deploy.yaml` → obtener `deploy_state` actual
2. Ejecuta `git branch --show-current` → obtener rama activa
3. Pregunta al usuario: "¿En qué paso exacto del deploy te encuentras?"
4. Crea o actualiza `.vtex-deploy/session-state.md` con el formato de abajo
5. Muestra el contenido guardado
6. Instrucción final: "Estado guardado. Ejecuta `/clear` y cuando retomes di: 'Lee `.vtex-deploy/session-state.md` y retoma el deploy'"

## Formato de session-state.md

```markdown
# Checkpoint de Deploy
**Fecha:** {fecha y hora}
**Rama:** {rama actual}
**Estado (deploy_state.phase):** {phase o "ninguno"}
**Workspace activo:** {workspace o "desconocido"}

## Paso actual
{descripción del usuario}

## Próximos pasos pendientes
{lista de comandos o acciones que faltan}

## Cómo retomar
1. Lee este archivo
2. Lee `.vtex-deploy.yaml` para el estado completo
3. Continúa desde el paso indicado arriba
```
