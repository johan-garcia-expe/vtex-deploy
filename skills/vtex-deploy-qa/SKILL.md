---
name: "vtex-deploy-qa"
trigger: "deploy a QA, deploya a QA, qa:full, qa:release, deploy QA"
description: "Flujo completo de deploy al ambiente QA en VTEX IO. Detecta automáticamente el estado del vendor desde manifest.json y ejecuta el flujo correspondiente: crea una deploy branch, transforma el vendor y publica (qa:full) si el código está en estado Prod; o publica directamente (qa:release) si ya está en estado QA. Usar siempre que el usuario quiera desplegar a QA."
related: [vtex-transform, vtex-git-flow]
---

# Deploy a QA — VTEX IO

## Pre-requisitos
1. Leer `.vtex-deploy.yaml` → vendor_qa, vendor_prod, dependencies_to_switch, branches
2. Leer `manifest.json` → detectar vendor actual y tipo de app (builders)

## Detección de estado
- vendor actual == vendor_prod → flujo **qa:full** (necesita transformación)
- vendor actual == vendor_qa → flujo **qa:release** (ya transformado, saltar transform)

---

## Flujo qa:full

Punto de entrada: código en estado Prod (vendor == vendor_prod).

### Fase Deploy Branch
1. Detectar rama actual: `git branch --show-current`
2. Crear rama de deploy: `git checkout -b deploy/qa-{YYYYMMDD}`
   - Esta rama es efímera — lleva el código transformado a la rama `qa`
   - Nunca se mergea de vuelta a `develop` ni a `main`
3. Leer skill `vtex-transform` y activar con dirección `to_qa`
4. `git add -A && git commit -m "chore: vendor swap → qa ({YYYYMMDD})"`
5. `git push origin deploy/qa-{YYYYMMDD}`

### Fase Publish
6. `vtex switch {vendor_qa}`
7. `vtex use deploy{YYYYMMDD} -p`
   - Nombre solo letras y números, sin guiones ni espacios (ej: `deploy20260328`)
8. Preguntar: "¿Tipo de release? (patch / minor / major)" y "¿Canal? (stable / beta)"
9. `vtex release {tipo} {canal}`
10. Analizar output:
    - Publish automático exitoso → continuar
    - Sin publish automático → `vtex publish` manualmente
    - Compilación fallida → mostrar error completo y PARAR

### Fase Instalación y Validación
11. `vtex install` (en el workspace creado en paso 7)
12. `vtex browse` — abre el workspace en el navegador
13. Preguntar: "Valida el workspace QA. ¿Todo correcto? (s/n)"
    - No → PARAR

### Fase Deploy
14. Preguntar: "¿Hay contenido de Site Editor modificado en este workspace que necesite preservarse? (s/n)"
15. `vtex deploy -f` — aceptar las 2 confirmaciones automáticamente
16. Si Site Editor = s → `vtex promote`

### Fase Git — PR de registro
17. Crear PR de registro una vez completado el deploy:
    ```
    gh pr create \
      --base qa \
      --head deploy/qa-{YYYYMMDD} \
      --title "[QA] {rama-origen} — {YYYYMMDD}" \
      --body "Deploy a QA\n\nApp: {vendor_qa}.{app}@{version}\nWorkspace: deploy{YYYYMMDD}\nOrigen: {rama-origen}"
    ```
    Este PR documenta exactamente qué se desplegó — no es un gate, se crea después del deploy.

### Fin
18. Mostrar reporte: app, versión, vendor, workspace, timestamp
19. Preguntar: "¿Deseas continuar con el deploy a Producción? (s/n)"
    - Sí → leer `.agents/skills/vtex-deploy-prod/SKILL.md` y ejecutar flujo

---

## Flujo qa:release

Punto de entrada: código ya en estado QA (vendor == vendor_qa). Omite deploy branch y transformación.

### Detección de contexto
1. Detectar rama actual: `git branch --show-current`
2. Si es feature branch (no es `qa`, `develop`, `main`, `master`):
   - ⚠️ Advertir: "vendor_qa detectado en feature branch. Recuerda revertir la transformación antes del PR a develop: `git checkout -- manifest.json styles/`"
   - Preguntar: "¿Deseas continuar con el deploy? (s/n)" — No → PARAR

### Fase Publish
3. `vtex switch {vendor_qa}`
4. `vtex use deploy{YYYYMMDD} -p`
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

- NUNCA preguntar al usuario si es qa:full o qa:release — detectar automáticamente desde manifest.json
- NUNCA crear workspace con guiones o espacios en el nombre
- NUNCA continuar si vtex publish falla — mostrar error y PARAR
- NUNCA omitir vtex browse ni la validación humana del workspace
- SIEMPRE preguntar patch/minor/major y stable/beta — nunca asumir
- SIEMPRE preguntar por Site Editor antes de vtex deploy -f
- SIEMPRE advertir cuando vendor_qa está commiteado en una feature branch
- El PR a `qa` se crea al FINAL del flujo qa:full, después del deploy — no es un gate previo
</vtex-rules>
