---
id: A5
title: Retomar deploy QA interrumpido
agents: [orchestrator, deploy-qa, deploy-state]
validates:
  orchestrator: "Apertura Escenario C — fase qa en curso — muestra retomar/reiniciar"
  deploy-qa: "Reanuda flujo desde phase: transformed"
  deploy-state: "Limpia deploy_state al reiniciar"
priority: alta
---

# A5 — Retomar deploy QA interrumpido

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
    phase: transformed
    feature: feature/banner-home
    workspace: deploy20260513

git:
  rama_actual: deploy/qa-20260513
```

---

## Conversación esperada

**[ORQUESTADOR llama @config-reader — silencioso]**

**[ORQUESTADOR]**
```
Estado actual
─────────────────────────────────
App:     mi-app@1.2.4
Vendor:  vendorqa  ← en QA
Rama:    deploy/qa-20260513
Deploy:  QA en curso — vendor transformado, pendiente release
─────────────────────────────────

Hay un deploy a QA sin terminar (quedó en: vendor transformado, pendiente release).
  1. Retomar desde esta fase
  2. Reiniciar desde cero
  3. Cancelar
```

**[USUARIO]** 1

**[ORQUESTADOR]** Retomando deploy a QA desde la fase de release...

**[ORQUESTADOR delega a @deploy-qa con phase: transformed]**

---

## Variante: usuario elige reiniciar

**[USUARIO]** 2

**[ORQUESTADOR]** Limpiando estado anterior...

**[ORQUESTADOR llama @deploy-state para limpiar deploy_state]**

**[ORQUESTADOR]**
```
Estado actual
─────────────────────────────────
App:     mi-app@1.2.4
Vendor:  vendorqa  ← en QA
Rama:    deploy/qa-20260513
Deploy:  sin actividad en curso
─────────────────────────────────

El vendor ya está en QA. ¿Qué quieres hacer?
  1. Hacer release y desplegar a QA
  2. Probar en un workspace antes de decidir
  3. Desplegar a Producción
  4. Salir
```

---

## Criterios de éxito

- [ ] La fase `transformed` se traduce a "vendor transformado, pendiente release" (no se muestra el valor raw)
- [ ] Las opciones son exactamente 3 (retomar / reiniciar / cancelar) — no las opciones normales de apertura
- [ ] Al retomar, pasa la fase actual a @deploy-qa
- [ ] Al reiniciar, llama @deploy-state para limpiar ANTES de volver a mostrar estado
- [ ] Tras limpiar, vuelve a mostrar estado actualizado con las opciones correspondientes al vendor actual

## Criterios de falla

- Se muestra el valor raw `transformed` al usuario
- Al reiniciar, se muestran las opciones de apertura normal sin limpiar primero
- Al retomar, el orquestador intenta ejecutar el release directamente en lugar de delegar
