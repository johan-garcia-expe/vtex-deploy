---
name: "vtex-git-flow"
trigger: "crea PR, crear pull request, gestionar ramas, git flow deploy, push a qa"
description: "Gestión de ramas Git y Pull Requests para el flujo de deploy VTEX IO. Detecta ramas disponibles y decide cuándo crear PRs según el contexto. Usar siempre que el flujo de deploy necesite crear ramas, hacer push o abrir un PR."
related: [vtex-deploy-qa, vtex-deploy-prod]
---

# Git Flow — Deploy VTEX IO

## Arquitectura de ramas

El código siempre fluye en una sola dirección — nunca hacia atrás:

```
feature/* ──► develop ──► deploy/qa-{fecha} ──► qa
                │
                └──────────────────────────────► main  (solo via PR de estabilización)
```

La rama `qa` es **one-way**: solo recibe PRs desde ramas `deploy/qa-*`, nunca se mergea hacia `develop` ni `main`. Esto es por diseño: `qa` contiene vendor_qa que es incompatible con las ramas de desarrollo.

## Convención de nombres de ramas

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Deploy QA | `deploy/qa-{YYYYMMDD}` | `deploy/qa-20260328` |
| Feature | `feature/{nombre}` | `feature/banner-home` |
| Fix / Hotfix | `fix/{nombre}` | `fix/cart-layout` |
| Chore | `chore/{nombre}` | `chore/cleanup-styles` |

## Lógica de PRs por flujo

### Flujo QA — PR al FINAL del deploy (registro)

El PR a `qa` se crea **después** del deploy, como registro de lo que se desplegó:

```
gh pr create \
  --base qa \
  --head deploy/qa-{YYYYMMDD} \
  --title "[QA] {rama-origen} — {YYYYMMDD}" \
  --body "Deploy a QA\n\nApp: {vendor_qa}.{app}@{version}\nWorkspace: deploy{YYYYMMDD}\nOrigen: {rama-origen}"
```

No es un gate — no espera aprobación para continuar el deploy.

### Flujo Producción

- Desde feature branch → `gh pr create --base {develop} --title "[PROD] {rama-actual}"`
- Desde rama qa → `gh pr create --base {develop} --title "[PROD] qa"`
- Desde develop → no crear PR (ya está en la rama correcta)
- Esperar confirmación del usuario: "¿PR aprobado y mergeado? (s/n)"

### PR de estabilización (acción separada — NO parte del flujo de deploy)

- `develop` → `main`
- Solo cuando el usuario confirma explícitamente que la feature es estable en producción
- El agente jamás lo crea automáticamente

## Validación del diff al crear PR

Antes de notificar al usuario, verificar con `gh pr diff`:
- Archivos esperados en deploy QA: `manifest.json`, archivos CSS/SCSS renombrados, `store/**/*.json`
- Si hay archivos inesperados fuera de esos patrones → alertar al usuario antes de continuar

## Detección de estado de vendor en feature branch

Si se detecta `vendor == vendor_qa` en una feature branch:
- Advertir: "vendor_qa commiteado en feature branch. Recuerda revertir antes del PR a develop: `git checkout -- manifest.json styles/`"
- Esta situación ocurre cuando el desarrollador commiteó la transformación local durante el desarrollo en QA

<vtex-rules>
## Reglas del skill

- NUNCA hacer push directo a main/master — siempre via PR desde develop
- NUNCA mergear `qa` hacia `develop` o `main` — es una rama one-way
- NUNCA crear el PR a `qa` antes del deploy — se crea al final como registro
- SIEMPRE validar el diff del PR y alertar si hay archivos inesperados
- SIEMPRE advertir si se detecta vendor_qa commiteado en una feature branch
- El PR de develop → main es decisión exclusiva del usuario — el agente jamás lo crea automáticamente
</vtex-rules>
