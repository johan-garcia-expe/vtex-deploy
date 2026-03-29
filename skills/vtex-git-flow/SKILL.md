---
name: "vtex-git-flow"
trigger: "crea PR, crear pull request, gestionar ramas, git flow deploy, push a qa"
description: "Gestión de ramas Git y Pull Requests para el flujo de deploy VTEX IO. Detecta ramas disponibles y decide cuándo crear PRs según el contexto (rama actual + flujo en ejecución)."
related: [vtex-deploy-qa, vtex-deploy-prod]
---

# Git Flow — Deploy VTEX IO

## Detección de ramas

Ejecutar `git branch -a` y mapear:
- `main` o `master` → rama principal (vendor Prod, código estable en producción)
- `dev` o `develop` → rama de desarrollo (vendor Prod, código listo para deploy)
- `qa` → rama QA (vendor QA cuando se necesite persistir)

## Lógica de PRs por flujo

### Flujo QA (qa:full / qa:release)
- Desde feature branch → `gh pr create --base qa --title "[QA] {rama-actual}" --body "Deploy a QA\n\nApp: {app}\nVendor: {vendor_qa}"`
- Desde rama qa → no crear PR (ya está en la rama correcta)

### Flujo Producción (prod)
- Desde feature branch → `gh pr create --base {develop/dev} --title "[PROD] {rama-actual}" --body "Deploy a Producción\n\nApp: {app}\nVendor: {vendor_prod}"`
- Desde rama qa → `gh pr create --base {develop/dev} --title "[PROD] qa"`
- Desde develop/dev → no crear PR (ya está en la rama correcta)

### PR de estabilización (acción separada, NO parte del flujo de deploy)
- `develop`/`dev` → `main`/`master`
- Solo cuando el usuario confirma explícitamente que la feature es estable en producción
- El agente NO lo crea automáticamente bajo ninguna circunstancia

## Validación del diff al crear PR

Antes de notificar al usuario que el PR fue creado, verificar con `gh pr diff`:
- Archivos esperados en deploy QA: `manifest.json`, archivos CSS/SCSS renombrados, `store/**/*.json`
- Archivos esperados en deploy Prod: mismos que QA pero con vendor_prod
- Si hay archivos inesperados (fuera de los patrones anteriores) → alertar al usuario antes de continuar

## Formato del PR

- Título: `[QA] {rama}` o `[PROD] {rama}`
- Body incluir: app, versión, vendor destino, archivos transformados

<vtex-rules>
## Reglas del skill

- NUNCA hacer push directo a main/master — siempre via PR desde develop/dev
- NUNCA mergear a main/master como parte del flujo de deploy automático
- SIEMPRE esperar confirmación del usuario de que el PR fue aprobado y mergeado antes de continuar
- SIEMPRE validar el diff del PR y alertar si hay archivos inesperados
- El PR de develop → main es decisión exclusiva del usuario — el agente jamás lo crea automáticamente
</vtex-rules>
