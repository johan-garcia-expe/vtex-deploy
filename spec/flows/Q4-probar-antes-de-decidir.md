---
id: Q4
title: Probar en workspace antes de decidir (vendor QA, opción 2)
agents: [orchestrator, deploy-qa]
validates:
  orchestrator: "Apertura Escenario B opción 2 — vendor qa, sin deploy"
  deploy-qa: "Flujo qa:release con workspace de preview antes del release"
priority: alta
---

# Q4 — "Probar en workspace antes de decidir" (vendor ya en QA, opción 2)

## Precondiciones

```yaml
manifest.json:
  vendor: vendorqa
  name: mi-app
  version: 1.2.3

.vtex-deploy.yaml:
  vendor_prod: vendorprod
  vendor_qa: vendorqa
  deploy_state: null

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
Vendor:  vendorqa  ← en QA
Rama:    feature/banner-home
Deploy:  sin actividad en curso
─────────────────────────────────

El vendor ya está en QA. ¿Qué quieres hacer?
  1. Hacer release y desplegar a QA
     (el flujo crea un workspace para que valides antes de confirmar el deploy)
  2. Probar en un workspace antes de decidir
     (crea workspace temporal, tú validas, luego decides si continuar)
  3. Desplegar a Producción
  4. Salir
```

**[USUARIO]** 2

**[ORQUESTADOR]** Voy a crear un workspace para que puedas validar antes del release.

**[@deploy-qa inicia — flujo qa:release con pausa en validación]**

**[@deploy-qa]** Verificando cuenta VTEX...
`vtex whoami` → cuenta: vendorqa ✓

Creando workspace temporal...
```
vtex use preview20260513 -p
```

**[@deploy-qa]**
```
vtex install
vtex browse
```

Valida lo que ves en el workspace. ¿Quieres continuar con el release y deploy? (s/n)

**[USUARIO]** s

**[@deploy-qa]** Perfecto. Continuando con el release...

¿Tipo de release? (patch / minor / major)

**[USUARIO]** patch

¿Canal? (stable / beta)

**[USUARIO]** stable

**[@deploy-qa]**
```
vtex release patch stable
```
[... flujo qa:release normal continúa ...]

---

## Variante: usuario valida y decide NO continuar

**[@deploy-qa]** Valida lo que ves en el workspace. ¿Quieres continuar con el release y deploy? (s/n)

**[USUARIO]** n

**[@deploy-qa]** Entendido. Limpiando workspace temporal...
```
yes | vtex use master
yes | vtex workspace delete preview20260513
```

No se hizo ningún release. Puedes corregir y volver cuando estés listo.

---

## Criterios de éxito

- [ ] El orquestador distingue entre opción 1 (qa:release directo) y opción 2 (probar primero)
- [ ] La opción 2 crea un workspace ANTES del release — no después
- [ ] El workspace se llama `preview{fecha}` o similar — diferenciable del workspace de deploy
- [ ] La pregunta de validación es EXPLÍCITA: "¿quieres continuar con el release?" — no solo "¿todo bien?"
- [ ] Si el usuario dice no: elimina el workspace y no ejecuta release
- [ ] Si el usuario dice sí: continúa con qa:release normal desde la fase de release

## Criterios de falla

- La opción 2 se comporta igual que la opción 1 (no hay diferencia en el flujo)
- Hace el release ANTES de crear el workspace de validación
- No elimina el workspace temporal al cancelar
- No queda claro que el release aún no se ha ejecutado cuando se pide validación
