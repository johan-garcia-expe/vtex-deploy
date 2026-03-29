---
name: "vtex-deploy-prod"
trigger: "deploy a producción, deploya a producción, deploy prod, deploy production"
description: "Flujo de deploy al ambiente de Producción en VTEX IO. Maneja la transformación de archivos a vendor Prod si aplica, el release, validación en workspace y el deploy final."
related: [vtex-transform, vtex-git-flow]
---

# Deploy a Producción — VTEX IO

## Pre-requisitos
1. Leer `.vtex-deploy.yaml` → vendor_prod, vendor_qa, dependencies_to_switch
2. Leer `manifest.json` → detectar vendor actual

## Fase Git
1. Detectar rama actual: `git branch --show-current`
2. Según rama actual:
   - Feature branch → `gh pr create --base {develop/dev} --title "[PROD] {rama-actual}"`
   - Desde rama qa → `gh pr create --base {develop/dev} --title "[PROD] qa"`
   - Desde develop/dev → no crear PR
3. Si se creó PR → preguntar: "¿PR aprobado y mergeado? (s/n)" — esperar confirmación

## Fase Transform
4. Si vendor actual == vendor_qa → activar skill `vtex-transform` con dirección `to_prod`
5. `vtex switch {vendor_prod}`
6. `vtex use {nombre}{fecha} -p` — nombre solo letras y números (ej: deploy20260328)

## Fase Release
7. Preguntar: "¿Tipo de release? (patch / minor / major)" y "¿Canal? (stable / beta)"
8. `vtex release {tipo} {canal}`
9. Analizar output:
   - Publish automático exitoso → continuar
   - Sin publish automático → `vtex publish` manualmente
   - Compilación fallida → mostrar error completo y PARAR

## Fase Instalación y Validación
10. `vtex install` (en el workspace creado)
11. `vtex browse` — abre el workspace en el navegador
12. Preguntar: "Valida el workspace de Producción. ¿Todo correcto? (s/n)"
    - No → PARAR

## Fase Deploy
13. Preguntar: "¿Hay contenido de Site Editor modificado en este workspace que necesite preservarse? (s/n)"
14. `vtex deploy -f` — aceptar las 2 confirmaciones automáticamente
15. Si Site Editor = s → `vtex promote`

## Fin
16. Reporte final: app, versión, vendor, workspace, timestamp, ambientes desplegados
17. Nota: el PR de develop/dev → main/master se crea cuando el usuario confirme que la feature es estable en producción (acción separada — no parte de este flujo)

<vtex-rules>
## Reglas del skill

- NUNCA deployar a producción sin que el usuario haya validado el workspace
- NUNCA saltarse la Fase Git — siempre detectar rama y crear PR cuando corresponda
- NUNCA asumir que el código está en estado Prod — verificar vendor en manifest.json
- SIEMPRE crear workspace de producción (-p) — nunca deployar directamente a master
- SIEMPRE preguntar patch/minor/major y stable/beta — nunca asumir
- El PR de develop → main NO es parte de este flujo — es decisión separada del usuario
</vtex-rules>
