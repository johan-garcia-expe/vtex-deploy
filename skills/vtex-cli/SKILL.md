---
name: "vtex-cli"
trigger: "vtex cli, comando vtex, toolbelt, vtex workspace, vtex use, vtex deploy, vtex publish, vtex release, vtex install, vtex link, vtex switch, vtex login"
description: "Referencia completa de comandos del VTEX Toolbelt CLI. Cubre workspaces, deploy, publish, release, install, link, switch y login. Incluye flags, comportamiento esperado y reglas de uso en cada fase del flujo de deploy."
related: [vtex-deploy-qa, vtex-deploy-prod]
---

# VTEX Toolbelt CLI — Referencia de comandos

Fuente oficial: https://github.com/vtex/toolbelt/tree/main/docs

---

## Autenticación

### `vtex login [ACCOUNT]`
Inicia sesión en una cuenta VTEX.
```
OPTIONS
  -w, --workspace=workspace  Workspace al que acceder tras login

EJEMPLOS
  vtex login
  vtex login papajohns
```

### `vtex logout`
Cierra la sesión actual.

### `vtex whoami`
Muestra la cuenta, el usuario y el workspace activos.
```
SALIDA ESPERADA
  Logged into {account} as {email} at {type} workspace {workspace}
```
**Usar siempre antes de `vtex switch` para verificar la cuenta actual.**

### `vtex switch ACCOUNT`
Cambia a otra cuenta VTEX.
```
OPTIONS
  -w, --workspace=workspace  Workspace al que cambiar

EJEMPLO
  vtex switch papajohnspruebas
```
**Nunca ejecutar sin antes verificar con `vtex whoami`.**
**Usar `vtex switch` si hay sesión activa en otra cuenta. Usar `vtex login` si no hay sesión.**

---

## Workspaces

### Tipos de workspace
| Tipo | Flag | Uso |
|------|------|-----|
| Desarrollo | (ninguno) | `vtex link`, desarrollo activo, pruebas con hot-reload |
| Producción | `-p` | `vtex deploy`, install de versiones publicadas, validación previa a producción |

### `vtex use WORKSPACE` (alias: `vtex workspace use`)
Cambia al workspace indicado. Si no existe, ofrece crearlo.
```
OPTIONS
  -p, --production  Crear como workspace de producción si no existe
  -r, --reset       Resetear el workspace antes de usarlo
  -v, --verbose     Mostrar logs de debug

EJEMPLOS
  vtex use checkout300326          # workspace de desarrollo
  vtex use deploy20260330 -p       # workspace de producción para deploy
```

**Convención de nombres:**
- Desarrollo: nombre descriptivo del feature (ej: `checkout300326`, `feat-header`)
- Deploy/validación: `deploy{YYYYMMDD}` con flag `-p`

### `vtex workspace create [WORKSPACENAME]`
Crea un workspace sin cambiar al mismo.
```
OPTIONS
  -p, --production  Crear como workspace de producción
```

### `vtex workspace list` (alias: `vtex workspace ls`)
Lista todos los workspaces de la cuenta.

### `vtex workspace promote` (alias: `vtex promote`)
Promueve el workspace actual a master.
**Solo disponible en workspaces de producción.**

### `vtex workspace delete WORKSPACE`
Elimina uno o más workspaces.
```
OPTIONS
  -f, --force  Ignorar si el workspace está activo
  -y, --yes    Confirmar automáticamente
```
**Debe cambiar a `master` antes de eliminar el workspace activo.**

### `vtex workspace reset [WORKSPACENAME]`
Elimina y recrea el workspace.
```
OPTIONS
  -p, --production  Recrear como workspace de producción
  -y, --yes         Confirmar automáticamente
```

### `vtex workspace info`
Muestra información del workspace actual.

### `vtex workspace status [WORKSPACENAME]`
Muestra información de un workspace específico.

---

## Ciclo de vida de una app

### `vtex link`
Inicia una sesión de desarrollo con hot-reload.
```
OPTIONS
  -a, --account=account      Cuenta destino
  -c, --clean                Limpiar caché del builder
  -s, --setup                Instalar typings antes de linkear
  -u, --unsafe               Permitir links con errores TypeScript
  -w, --workspace=workspace  Workspace destino

EJEMPLO
  vtex link -w checkout300326
```
**Solo disponible en workspaces de desarrollo. No usar en workspaces de producción.**
**NUNCA ejecutar automáticamente — el usuario lo hace manualmente.**

### `vtex release [RELEASETYPE] [TAGNAME]`
Bump de versión en `manifest.json`, commit, tag y push al remoto.
```
RELEASETYPE: patch | minor | major | pre
TAGNAME:     stable | beta

EJEMPLOS
  vtex release patch stable
  vtex release minor beta
  vtex release patch
```
**Requiere working tree limpio (sin cambios sin commitear, incluyendo untracked files).**
**Usar `yes | vtex release {tipo} {canal}` para auto-confirmar.**

### `vtex publish`
Compila y publica la versión actual de la app en el registry de VTEX.
```
OPTIONS
  -f, --force                Publicar sin validar semver
  -t, --tag=tag              Tag de la release (stable, beta)
  -v, --verbose              Mostrar logs del builder
  -w, --workspace=workspace  Workspace del registry
  -y, --yes                  Confirmar automáticamente

EJEMPLO
  vtex publish --verbose
```
**Si falla la compilación → PARAR. Mostrar el error completo al usuario.**

### `vtex install [APPID]`
Instala una app en el workspace activo.
```
OPTIONS
  -f, --force  Ignorar conflictos de rutas

EJEMPLOS
  vtex install
  vtex install papajohnspruebas.storetheme@3.8.6
  vtex install vtex.service-example@0.x
```
**Debe ejecutarse en el workspace de producción (`deploy{YYYYMMDD}` con `-p`) — no en el workspace de desarrollo.**

### `vtex deploy [APPID]`
Despliega una versión publicada al workspace master.
```
OPTIONS
  -y, --yes  Confirmar automáticamente (equivale a aceptar las 2 confirmaciones)

EJEMPLOS
  vtex deploy
  vtex deploy papajohnspruebas.storetheme@3.8.6
```
**Debe ejecutarse en un workspace de producción. Requiere validación humana previa (`vtex browse`).**
**SIEMPRE usar: `yes | vtex deploy {app} -f` — auto-confirma las 2 preguntas (deploy + skip 7min wait).**

### `vtex browse [PATH]`
Abre el workspace activo en el navegador.
```
OPTIONS
  -q, --qr  Mostrar QR code en la terminal

EJEMPLOS
  vtex browse
  vtex browse admin
```

---

## Flujo de deploy — resumen de comandos por fase

```
[Verificación]
  vtex whoami
  → si cuenta incorrecta y hay sesión: vtex switch {vendor}
  → si no hay sesión: vtex login {vendor}

[Workspace]
  vtex use deploy{YYYYMMDD} -p
  → crea workspace de producción para validación y deploy

[Release]
  yes | vtex release patch|minor|major stable|beta
  → bump versión + commit + tag + push + vtex publish automático

[Publicación manual (si release no publicó)]
  yes | vtex publish --verbose

[Instalación]
  vtex install {vendor}.{app}@{version}
  → instalar en workspace de producción (deploy{YYYYMMDD})

[Validación]
  vtex browse
  → validación humana obligatoria antes de deploy

[Deploy]
  yes | vtex deploy {vendor}.{app}@{version} -f
  → despliega al master, auto-confirma las 2 preguntas

[Promote — solo si Site Editor]
  vtex workspace promote

[Limpieza — si no se ejecutó promote]
  yes | vtex use master
  yes | vtex workspace delete deploy{YYYYMMDD}
```

---

## Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `Please commit your changes before proceeding` | Working tree sucio (staged, unstaged o untracked) | `git status` → commitear o gitignorear todos los archivos |
| `Command 'git push' exited with error code: 128` | Rama sin upstream | `git push --set-upstream origin {rama}` |
| `Failed pushing to remote` | Sin upstream configurado | Ver arriba |
| `You need to be logged in` | Sesión expirada | `vtex login {account}` |
| `This workspace is a dev workspace` | Intentando `vtex deploy` en workspace de desarrollo | Cambiar a workspace de producción con `vtex use {ws} -p` |
| `Not logged in` | Sesión no iniciada | `vtex login {account}` (no `vtex switch`) |
| `please change your workspace before deleting` | Intentando eliminar el workspace activo | `vtex use master` primero, luego eliminar |

<vtex-rules>
## Reglas del skill

- SIEMPRE ejecutar `vtex whoami` antes de cualquier `vtex switch` o `vtex use`
- NUNCA ejecutar `vtex switch` si la cuenta ya es la correcta
- Usar `vtex switch` si hay sesión activa en otra cuenta, `vtex login` si no hay sesión
- NUNCA ejecutar `vtex link` en un workspace de producción
- NUNCA ejecutar `vtex link` automáticamente — el usuario lo hace manualmente
- NUNCA ejecutar `vtex release` con cambios sin commitear (incluyendo untracked files)
- NUNCA asumir el workspace activo — verificar con `vtex whoami`
- SIEMPRE crear el workspace de deploy como producción: `vtex use deploy{YYYYMMDD} -p`
- SIEMPRE instalar (`vtex install`) en el workspace de producción `deploy{YYYYMMDD}`, no en el workspace de desarrollo
- SIEMPRE mostrar `vtex browse` y esperar validación humana antes de `vtex deploy`
- SIEMPRE usar `yes | vtex deploy {app} -f` para auto-confirmar ambas preguntas
- Si `vtex publish` falla → mostrar error completo y PARAR
- Nombres de workspace: sin guiones ni espacios — solo letras y números
- SIEMPRE eliminar workspaces al finalizar si no se ejecutó `vtex promote` (cambiar a master primero)
</vtex-rules>
