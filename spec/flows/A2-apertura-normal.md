---
id: A2
title: Apertura normal
agents: [orchestrator]
validates:
  orchestrator: "Apertura Escenario A — vendor prod, sin deploy — muestra estado y ofrece opciones"
priority: alta
---

# A2 — Apertura normal

## Precondiciones

```yaml
manifest.json:
  vendor: vendorprod
  name: mi-app
  version: 1.2.3

.vtex-deploy.yaml:
  vendor_prod: vendorprod
  vendor_qa: vendorqa
  deploy_state: null

git:
  rama_actual: feature/banner-home
  cambios_sin_commitear: ninguno
```

---

## Conversación esperada

**[ORQUESTADOR llama @config-reader — silencioso para el usuario]**

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

**[ORQUESTADOR]** Perfecto. Iniciando flujo qa:full...

**[ORQUESTADOR delega a @deploy-qa con flujo qa:full]**

---

## Criterios de éxito

- [ ] @config-reader se llama antes de mostrar cualquier texto al usuario
- [ ] El estado se muestra completo con los 4 campos (App, Vendor, Rama, Deploy)
- [ ] La etiqueta del vendor incluye `← en Producción`
- [ ] Las opciones incluyen descripción del flujo, no solo el nombre
- [ ] Al elegir 1, delega a @deploy-qa sin ejecutar nada directamente

## Criterios de falla

- El orquestador muestra opciones SIN llamar @config-reader primero
- El orquestador empieza a ejecutar pasos de deploy sin que el usuario elija
- La opción 1 dice solo "Deploy a QA" sin descripción del flujo
