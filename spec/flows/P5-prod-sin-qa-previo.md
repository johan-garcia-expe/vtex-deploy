---
id: P5
title: Deploy a Producción sin QA previo
agents: [orchestrator, deploy-prod]
validates:
  orchestrator: "Apertura Escenario A opción 2 — advertencia explícita antes de prod:direct"
  deploy-prod: "Flujo prod:direct — usa vtex release, verifica CHANGELOG"
priority: media
---

# P5 — Intento de deploy a Producción sin QA previo

## Precondiciones

```yaml
manifest.json:
  vendor: vendorprod
  name: mi-app
  version: 1.2.3

.vtex-deploy.yaml:
  vendor_prod: vendorprod
  vendor_qa: vendorqa
  deploy_state: null  # sin qa_merged

git:
  rama_actual: feature/banner-home
```

---

## Conversación esperada

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

**[USUARIO]** 2

**[ORQUESTADOR]**
```
No hay QA completado registrado para este deploy.

Desplegar directo a Producción omite las validaciones de QA.
¿Confirmas que quieres continuar sin QA? (s/n)
```

**[USUARIO]** s

**[ORQUESTADOR]** Iniciando flujo prod:direct...

**[@deploy-prod inicia — flujo prod:direct]**

**[@deploy-prod]** Verificando CHANGELOG...
No hay entrada para esta versión. ¿Deseas añadir una antes del release? (s/n)

**[USUARIO]** s

**[@deploy-prod]** Actualiza el CHANGELOG y confirma cuando esté listo.

**[USUARIO]** listo

**[@deploy-prod]** ¿Tipo de release? (patch / minor / major)

**[USUARIO]** patch

¿Canal? (stable / beta)

**[USUARIO]** stable

**[... flujo prod:direct continúa con vtex release ...]**

---

## Variante: usuario confirma pero luego cancela en validación

Misma advertencia → usuario confirma → flujo avanza → llega a validación de workspace → dice no → se detiene (ver P4).

---

## Variante: usuario dice no a la confirmación

**[ORQUESTADOR]**
```
No hay QA completado registrado para este deploy.

Desplegar directo a Producción omite las validaciones de QA.
¿Confirmas que quieres continuar sin QA? (s/n)
```

**[USUARIO]** n

**[ORQUESTADOR]** Entendido. ¿Quieres hacer el deploy a QA primero? (s/n)

**[USUARIO]** s

**[ORQUESTADOR delega a @deploy-qa — flujo qa:full]**

---

## Criterios de éxito

- [ ] El orquestador muestra advertencia explícita antes de prod:direct — no delega silenciosamente
- [ ] La advertencia es UNA sola pregunta de confirmación — no párrafos de texto
- [ ] Si el usuario dice no a la confirmación, ofrece ir a QA primero
- [ ] Si confirma, @deploy-prod activa prod:direct (con vtex release, no vtex publish)
- [ ] @deploy-prod verifica CHANGELOG en prod:direct — no lo asume actualizado

## Criterios de falla

- El orquestador delega a @deploy-prod sin advertencia cuando el usuario elige opción 2
- La advertencia es tan larga que el usuario la ignora
- @deploy-prod usa `vtex publish` en lugar de `vtex release` en prod:direct
- Al decir no a la confirmación, el orquestador no ofrece alternativa (solo para)
