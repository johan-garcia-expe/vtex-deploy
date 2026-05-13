---
id: Q1
title: qa:full happy path completo
agents: [orchestrator, deploy-qa, vendor-transformer, release-validator]
validates:
  orchestrator: "Delega a @deploy-qa al elegir opción 1"
  deploy-qa: "Flujo qa:full — 6 checkpoints de inicio a fin"
  vendor-transformer: "Transformación Store Theme con verificación 3 comandos"
  release-validator: "Analiza SUCCESS de vtex release"
priority: alta
---

# Q1 — qa:full happy path de inicio a fin

## Precondiciones

```yaml
manifest.json:
  vendor: vendorprod
  name: mi-app
  version: 1.2.3
  builders: { store: "0.x", styles: "2.x" }  # Store Theme

.vtex-deploy.yaml:
  vendor_prod: vendorprod
  vendor_qa: vendorqa
  dependencies_to_switch: [vendorprod.store-theme]
  branches: { develop: develop, qa: qa, main: main }
  deploy_state: null

git:
  rama_actual: feature/banner-home
  cambios_sin_commitear: ninguno
  .gitignore: incluye .claude/

vtex:
  cuenta_activa: vendorprod
```

---

## Conversación esperada

### Apertura

**[ORQUESTADOR]**
```
Estado actual
─────────────────────────────────
App:     mi-app@1.2.3
Vendor:  vendorprod  ← en Producción
Rama:    feature/banner-home
Deploy:  sin actividad en curso
─────────────────────────────────

¿Qué quieres hacer?
  1. Probar y desplegar a QA
     (transforma vendor → crea workspace → tú validas → si OK, despliega)
  2. Desplegar a Producción (sin QA previo)
  3. Salir
```

**[USUARIO]** 1

**[@deploy-qa inicia — Checkpoint 1/6: Deploy Branch]**

**[@deploy-qa]** Voy a crear la rama de deploy. Antes verifico que todo esté listo...
- Rama actual: `feature/banner-home` ✓
- Cambios sin commitear: ninguno ✓
- Creando `deploy/qa-20260513`...

**[@deploy-qa]** Transformando vendor a QA en la rama de deploy...

**[@vendor-transformer]** (ejecuta transformación)
- manifest.json: vendorprod → vendorqa ✓
- styles/scss/vendorprod.store-theme.scss → vendorqa.store-theme.scss ✓
- store/blocks.json: referencias actualizadas ✓
- Verificación (3 comandos): salida vacía ✓

**[@deploy-qa]** ¿Los cambios de transformación se ven correctos? (s/n)

**[USUARIO]** s

**[@deploy-qa]** Commiteando y haciendo push...
- `git add -A && git commit -m "chore: vendor swap → qa (20260513)"` ✓
- `.claude/` en .gitignore: verificado ✓
- `git push --set-upstream origin deploy/qa-20260513` ✓

**[@deploy-qa — Checkpoint 2/6: Publish]**

**[@deploy-qa]** Revisando CHANGELOG... hay entrada para esta versión ✓

**[@deploy-qa]** Verificando cuenta VTEX...
`vtex whoami` → cuenta: vendorprod

Necesito cambiar a la cuenta QA. Ejecuta:
```
vtex switch vendorqa
```
Confirma cuando estés listo.

**[USUARIO]** listo

**[@deploy-qa]** Creando workspace de deploy...
```
vtex use deploy20260513 -p
```

¿Qué tipo de release? (patch / minor / major)

**[USUARIO]** patch

¿Canal? (stable / beta)

**[USUARIO]** stable

**[@deploy-qa]** Ejecutando release...
```
vtex release patch stable
```
Cuando aparezca el prompt de publish, confirma con `y`.

**[USUARIO]** [confirma con y — output del release pegado]

**[@deploy-qa llama @release-validator — silencioso]**
**[@release-validator]** estado: SUCCESS | versión: 1.2.4

**[@deploy-qa — Checkpoint 3/6: Instalación]**

**[@deploy-qa]**
```
vtex install
```
Instalando `vendorqa.mi-app@1.2.4`... ✓

**[@deploy-qa — Checkpoint 4/6: Validación]**

**[@deploy-qa]**
```
vtex browse
```
Abriendo workspace en el navegador...

Valida el workspace QA. ¿Todo correcto? (s/n)

**[USUARIO]** s

**[@deploy-qa — Checkpoint 5/6: Deploy]**

**[@deploy-qa]** ¿Hay cambios de Site Editor que necesiten migrarse? (s/n)

**[USUARIO]** n

**[@deploy-qa]** Ejecuta:
```
yes | vtex deploy vendorqa.mi-app@1.2.4 -f
```
Confirma cuando termine.

**[USUARIO]** listo

**[@deploy-qa — Checkpoint 6/6: Git — PR de registro]**

**[@deploy-qa]** Creando PR de registro...
```
gh pr create --base qa --head deploy/qa-20260513 \
  --title "[QA] feature/banner-home — 20260513" \
  --body "..."
```
PR creado: https://github.com/org/repo/pull/42

Mergea el PR y confirma cuando esté listo. ¿PR mergeado? (s/n)

**[USUARIO]** s

**[@deploy-qa]** Limpiando rama de deploy...
```
git push origin --delete deploy/qa-20260513
git checkout qa && git pull origin qa
git branch -D deploy/qa-20260513
```

**[@deploy-qa]** Deploy a QA completado.
```
Deploy completado
─────────────────────────────────
App:       vendorqa.mi-app@1.2.4
Workspace: deploy20260513
Ambiente:  QA
Timestamp: 2026-05-13 15:42:00
─────────────────────────────────
```

**[ORQUESTADOR]** ¿Deseas continuar con el deploy a Producción? (s/n)

**[USUARIO]** no

---

## Criterios de éxito

- [ ] 6 checkpoints numerados y presentados al usuario
- [ ] Verificación de cuenta ANTES de crear workspace
- [ ] @vendor-transformer ejecuta verificación de 3 comandos y muestra resumen
- [ ] @release-validator invocado y su respuesta determina si continuar
- [ ] vtex browse ejecutado ANTES de pedir validación
- [ ] Limpieza de ramas y workspace al finalizar
- [ ] Reporte final mostrado con 4 campos
- [ ] Oferta de continuar a Producción al terminar

## Criterios de falla

- Salta la verificación de cuenta y crea workspace en cuenta incorrecta
- Ejecuta vtex deploy sin esperar confirmación de validación humana
- No llama @release-validator o continúa sin su respuesta
- No verifica .gitignore antes del push
- Omite `git push --set-upstream` antes del release
