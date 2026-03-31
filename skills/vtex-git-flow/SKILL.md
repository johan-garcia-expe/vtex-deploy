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
| Deploy Prod | `deploy/prod-{YYYYMMDD}` | `deploy/prod-20260331` |
| Feature | `feature/{nombre}` | `feature/banner-home` |
| Fix / Hotfix | `fix/{nombre}` | `fix/cart-layout` |
| Chore | `chore/{nombre}` | `chore/cleanup-styles` |

## Lógica de PRs por flujo

### Flujo QA — PR al FINAL del deploy (registro)

El PR a `qa` se crea **después** del deploy, como registro de lo que se desplegó.
- Si la feature branch ya fue mergeada a `qa` antes del deploy → el PR de registro es **innecesario**, omitir.

Intentar con `gh` CLI:
```
gh pr create \
  --base qa \
  --head deploy/qa-{YYYYMMDD} \
  --title "[QA] {rama-origen} — {YYYYMMDD}" \
  --body "Deploy a QA\n\nApp: {vendor_qa}.{app}@{version}\nWorkspace: deploy{YYYYMMDD}\nOrigen: {rama-origen}"
```

Si `gh` no está instalado (command not found) → dar al usuario URL directa + datos:
```
URL: https://github.com/{org}/{repo}/pull/new/deploy/qa-{YYYYMMDD}
Base: qa | Head: deploy/qa-{YYYYMMDD}
Título: [QA] {rama-origen} — {YYYYMMDD}
```

No es un gate — no espera aprobación para continuar el deploy.

#### Limpieza de rama post-merge
Después de confirmar que el PR fue mergeado:
```bash
git push origin --delete deploy/qa-{YYYYMMDD}
git checkout qa && git pull origin qa
git branch -D deploy/qa-{YYYYMMDD}
```

### Flujo Producción — Rama de deploy + PR a develop

**REGLA CRÍTICA:** NUNCA transformar archivos directamente en `qa`, `develop` ni `main`. Siempre crear una rama efímera `deploy/prod-{YYYYMMDD}` desde `qa`.

1. Crear rama: `git checkout -b deploy/prod-{YYYYMMDD}` desde `qa`
2. Transformar vendor en esa rama
3. PR de `deploy/prod-{YYYYMMDD}` → `develop`
4. Esperar confirmación del usuario: "¿PR mergeado? (s/n)"

Intentar con `gh` CLI:
```
gh pr create \
  --base develop \
  --head deploy/prod-{YYYYMMDD} \
  --title "[PROD] deploy/prod-{YYYYMMDD}" \
  --body "Deploy a Producción\n\nVendor swap: {vendor_qa} → {vendor_prod}\nOrigen: qa"
```

Si `gh` no está disponible → dar URL directa.

#### Limpieza de rama post-deploy
```bash
git branch -D deploy/prod-{YYYYMMDD}
git push origin --delete deploy/prod-{YYYYMMDD}
```
Si la remota ya fue eliminada por el merge → ignorar el error.

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
- **No advertir** — en este proyecto es intencional. El flujo lleva el vendor_qa directo a `qa`.
- No pedir al usuario que revierta el vendor antes del PR.

<vtex-rules>
## Reglas del skill

- NUNCA hacer push directo a main/master — siempre via PR desde develop
- NUNCA mergear `qa` hacia `develop` o `main` — es una rama one-way
- NUNCA crear el PR a `qa` antes del deploy — se crea al final como registro
- NUNCA transformar archivos en `qa`, `develop` o `main` directamente — siempre en rama `deploy/*`
- SIEMPRE validar el diff del PR y alertar si hay archivos inesperados
- NUNCA advertir si se detecta vendor_qa en una feature branch — es intencional en este proyecto
- Si `gh` CLI no está disponible → dar URL directa de GitHub con datos del PR
- El PR de develop → main es decisión exclusiva del usuario — el agente jamás lo crea automáticamente
- SIEMPRE eliminar la rama deploy/* local y remota después del merge/deploy
- SIEMPRE hacer `git checkout qa && git pull origin qa` después de limpiar la deploy branch de QA
</vtex-rules>
