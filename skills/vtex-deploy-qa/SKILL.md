---
name: "vtex-deploy-qa"
trigger: "deploy a QA, deploya a QA, qa:full, qa:release, deploy QA"
description: "Flujo completo de deploy al ambiente QA en VTEX IO. Maneja dos flujos: qa:full (código en estado Prod) y qa:release (código ya en estado QA)."
related: [vtex-transform, vtex-git-flow]
---

# Deploy a QA — VTEX IO

## Pre-requisitos
1. Leer `.vtex-deploy.yaml` → vendor_qa, vendor_prod, dependencies_to_switch
2. Leer `manifest.json` → detectar vendor actual y tipo de app (builders)

## Detección de estado
- vendor actual == vendor_qa → código ya en estado QA → ejecutar flujo **qa:release**
- vendor actual == vendor_prod → ejecutar flujo **qa:full**

---

## Flujo qa:full

Punto de entrada: código en estado Prod (vendor == vendor_prod).

### Fase Git
1. Detectar rama actual: `git branch --show-current`
2. Si es feature branch:
   - `gh pr create --base qa --title "[QA] {rama-actual}" --body "Deploy a QA"`
   - Preguntar: "¿PR aprobado y mergeado? (s/n)" — esperar confirmación antes de continuar

### Fase Transform
3. `vtex switch {vendor_qa}`
4. `vtex use {nombre}{fecha} -p`
   - Nombre: solo letras y números, incluir fecha YYYYMMDD (ej: deploy20260328)
5. Activar skill `vtex-transform` con dirección `to_qa`

### Fase Release
6. Preguntar: "¿Tipo de release? (patch / minor / major)" y "¿Canal? (stable / beta)"
7. `vtex release {tipo} {canal}`
8. Analizar output:
   - Publish automático exitoso → continuar
   - Sin publish automático → `vtex publish` manualmente
   - Compilación fallida → mostrar error completo y PARAR

### Fase Instalación y Validación
9. `vtex install` (en el workspace creado en paso 4)
10. `vtex browse` — abre el workspace en el navegador
11. Preguntar: "Valida el workspace QA. ¿Todo correcto? (s/n)"
    - No → PARAR

### Fase Deploy
12. Preguntar: "¿Hay contenido de Site Editor modificado en este workspace que necesite preservarse? (s/n)"
13. `vtex deploy -f` — aceptar las 2 confirmaciones automáticamente
14. Si Site Editor = s → `vtex promote`

### Fin
15. Mostrar reporte: app, versión, vendor, workspace, timestamp
16. Preguntar: "¿Deseas continuar con el deploy a Producción? (s/n)"
    - Sí → activar skill `vtex-deploy-prod`

---

## Flujo qa:release

Punto de entrada: código ya en estado QA (vendor == vendor_qa). Salta la transformación de archivos.

### Fase Git
1. Detectar rama actual
2. Si es feature branch → crear PR hacia qa (igual que qa:full)

### Fase Release
3. `vtex switch {vendor_qa}`
4. `vtex use {nombre}{fecha} -p`
5. Preguntar: "¿Tipo de release? (patch / minor / major)" y "¿Canal? (stable / beta)"
6. `vtex release {tipo} {canal}` → verificar publish y compilación

### Fase Instalación y Validación
7. `vtex install`
8. `vtex browse`
9. Preguntar: "Valida el workspace QA. ¿Todo correcto? (s/n)" — No → PARAR

### Fase Deploy
10. Preguntar por Site Editor
11. `vtex deploy -f`
12. Si Site Editor = s → `vtex promote`

### Fin
13. Reporte + preguntar si continuar a Producción

<vtex-rules>
## Reglas del skill

- NUNCA omitir la detección de estado al inicio — leer manifest.json primero
- NUNCA crear workspace con guiones o espacios en el nombre
- NUNCA continuar si vtex publish falla — mostrar error y PARAR
- NUNCA omitir vtex browse ni la validación humana del workspace
- SIEMPRE preguntar patch/minor/major y stable/beta — nunca asumir
- SIEMPRE preguntar por Site Editor antes de vtex deploy -f
</vtex-rules>
