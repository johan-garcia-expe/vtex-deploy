---
id: P1
title: prod:from-qa happy path completo
agents: [orchestrator, deploy-prod, vendor-transformer, release-validator]
validates:
  orchestrator: "Apertura Escenario B opción 3 — detecta qa_merged, activa prod:from-qa"
  deploy-prod: "Flujo prod:from-qa — 8 fases, usa vtex publish NO vtex release"
  vendor-transformer: "Transformación to_prod"
  release-validator: "Analiza SUCCESS de vtex publish --verbose"
priority: alta
---

# P1 — prod:from-qa happy path

## Precondiciones

```yaml
manifest.json:
  vendor: vendorqa
  name: mi-app
  version: 1.2.4

.vtex-deploy.yaml:
  vendor_prod: vendorprod
  vendor_qa: vendorqa
  deploy_state:
    phase: qa_merged
    feature: feature/banner-home
    workspace: deploy20260513

git:
  rama_actual: qa
  ultima_rama_deploy: deploy/qa-20260513 (ya eliminada)

vtex:
  cuenta_activa: vendorqa
```

---

## Conversación esperada

### Apertura (viene del encadenamiento QA → Prod o invocación directa)

**[ORQUESTADOR]**
```
Estado actual
─────────────────────────────────
App:     mi-app@1.2.4
Vendor:  vendorqa  ← en QA
Rama:    qa
Deploy:  sin actividad en curso
─────────────────────────────────

El vendor ya está en QA. ¿Qué quieres hacer?
  1. Hacer release y desplegar a QA
  2. Probar en un workspace antes de decidir
  3. Desplegar a Producción
  4. Salir
```

**[USUARIO]** 3

**[ORQUESTADOR]** QA completado detectado (fase: qa_merged). Iniciando flujo prod:from-qa...

**[@deploy-prod inicia]**

### Fase 1 — Rama de deploy

**[@deploy-prod]** Verificando posición...
- Rama actual: `qa` ✓
- Creando `deploy/prod-20260513` desde `qa`...

### Fase 2 — Transformación vendor

**[@deploy-prod]** Transformando vendor a Producción...

**[@vendor-transformer]** (ejecuta transformación to_prod)
- manifest.json: vendorqa → vendorprod ✓
- styles/scss/vendorqa.store-theme.scss → vendorprod.store-theme.scss ✓
- Verificación: salida vacía ✓

**[@deploy-prod]** ¿Los cambios de transformación se ven correctos? (s/n)

**[USUARIO]** s

```
git add -A && git commit -m "chore: vendor swap → prod (20260513)"
git push -u origin deploy/prod-20260513
```

### Fase 3 — PR a develop

**[@deploy-prod]** Creando PR a develop...
```
gh pr create --base develop --head deploy/prod-20260513 \
  --title "[PROD] deploy/prod-20260513" \
  --body "..."
```
PR creado: https://github.com/org/repo/pull/43

¿PR mergeado? (s/n)

**[USUARIO]** s

```
git checkout develop && git pull origin develop
```

### Fase 4 — Workspace de producción

**[@deploy-prod]** Verificando cuenta VTEX...
`vtex whoami` → cuenta: vendorqa

Ejecuta:
```
vtex switch vendorprod
```
Confirma cuando estés listo.

**[USUARIO]** listo

```
vtex use prod20260513 -p
```

### Fase 5 — Publish (prod:from-qa — SIN vtex release)

**[@deploy-prod]** La versión ya fue bumpeada en QA. Solo publicando...
```
yes | vtex publish --verbose
```
Confirma con `y` cuando aparezca el prompt.

**[USUARIO]** [confirma — output del publish]

**[@deploy-prod llama @release-validator — silencioso]**
**[@release-validator]** estado: SUCCESS | versión: 1.2.4

### Fase 6 — Instalación y Validación

```
vtex install vendorprod.mi-app@1.2.4
vtex browse
```

Valida el workspace de Producción. ¿Todo correcto? (s/n)

**[USUARIO]** s

### Fase 7 — Deploy

**[@deploy-prod]** ¿Hay cambios de Site Editor que necesiten migrarse? (s/n)

**[USUARIO]** n

```
vtex use master
yes | vtex deploy vendorprod.mi-app@1.2.4 -f
```
Confirma cuando termine.

**[USUARIO]** listo

### Fase 8 — Limpieza

**[@deploy-prod]** ¿Se ejecutó `vtex promote`? (s/n)

**[USUARIO]** n

```
yes | vtex workspace delete prod20260513
git branch -D deploy/prod-20260513
git push origin --delete deploy/prod-20260513
```

Eliminando `deploy_state` de `.vtex-deploy.yaml`...

```
Deploy completado
─────────────────────────────────
App:       vendorprod.mi-app@1.2.4
Workspace: prod20260513
Ambiente:  Producción
Timestamp: 2026-05-13 17:20:00
─────────────────────────────────
```

---

## Criterios de éxito

- [ ] Detecta `phase: qa_merged` y activa flujo `prod:from-qa` automáticamente
- [ ] NO ejecuta `vtex release` — solo `vtex publish --verbose`
- [ ] `vtex use master` se ejecuta ANTES de `vtex deploy -f`
- [ ] Workspace se llama `prod{fecha}` sin guiones
- [ ] `deploy_state` se elimina completamente al finalizar (reset completo)
- [ ] PR va a `develop`, no a `main`

## Criterios de falla

- Ejecuta `vtex release` en un flujo prod:from-qa
- Hace `vtex deploy -f` sin `vtex use master` previo
- Deja `deploy_state` en el YAML después del deploy exitoso
- Crea workspace con guiones (`prod-20260513`)
