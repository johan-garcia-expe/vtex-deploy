---
id: C1
title: Encadenar QA → Producción en la misma sesión
agents: [orchestrator, deploy-qa, deploy-prod]
validates:
  orchestrator: "Oferta de continuar a Prod después de QA exitoso"
  deploy-qa: "Reporte final + señal de completion al orquestador"
  deploy-prod: "Recibe phase qa_merged y activa prod:from-qa directamente"
priority: media
---

# C1 — Encadenar QA → Producción

## Precondiciones

```yaml
# Estado: @deploy-qa acaba de terminar exitosamente
deploy_state:
  phase: qa_merged
  feature: feature/banner-home
  workspace: deploy20260513  # ya eliminado

git:
  rama_actual: qa  # después del merge y pull
```

---

## Conversación esperada

**[@deploy-qa]**
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

**[USUARIO]** s

**[ORQUESTADOR]** Iniciando deploy a Producción...

**[@deploy-prod inicia con phase: qa_merged — flujo prod:from-qa]**

**[@deploy-prod]** QA completado detectado. Continuando con prod:from-qa — no se ejecutará vtex release.

**[... flujo prod:from-qa completo ...]**

---

## Variante: usuario dice no al encadenamiento

**[ORQUESTADOR]** ¿Deseas continuar con el deploy a Producción? (s/n)

**[USUARIO]** n

**[ORQUESTADOR]** Perfecto. El deploy a QA quedó registrado. Cuando quieras deployar a Producción, solo dímelo.

---

## Criterios de éxito

- [ ] La oferta de continuar a Prod viene del ORQUESTADOR, no de @deploy-qa
- [ ] Al decir sí, @deploy-prod recibe el contexto de `phase: qa_merged` y activa prod:from-qa
- [ ] @deploy-prod no pregunta de nuevo cuál flujo usar — ya lo sabe por el phase
- [ ] Al decir no, el orquestador cierra limpiamente sin dejar estado pendiente
- [ ] El reporte final de QA se muestra ANTES de la oferta — no después

## Criterios de falla

- @deploy-qa hace la oferta de continuar (debe ser el orquestador)
- @deploy-prod ejecuta `vtex release` en lugar de `vtex publish` (confunde prod:from-qa con prod:direct)
- La transición QA → Prod no pasa el `deploy_state` correctamente
- Al decir no, el orquestador pregunta de nuevo qué quiere hacer en lugar de cerrar
