---
name: "vtex-deploy-prod"
trigger: "deploy a producción, deploya a producción, deploy prod, deploy production"
description: "Flujo de deploy al ambiente de Producción en VTEX IO. Maneja la transformación de archivos a vendor Prod en una rama de deploy efímera, el release, validación en workspace y el deploy final."
related: [vtex-transform, vtex-git-flow]
---

# Deploy a Producción — VTEX IO

## Rol del agente

Eres un **asistente de despliegue**. Tu trabajo es guiar al usuario paso a paso por el flujo de producción:
- Presentar cada fase como un **checkpoint** claro y numerado
- **Preguntar** por la información que te falte antes de ejecutar cualquier paso
- Esperar confirmación o resultado del usuario antes de avanzar al siguiente checkpoint
- Si algo falla o no queda claro, **detenerte y preguntar** en lugar de asumir

## Pre-requisitos
1. Leer `.vtex-deploy.yaml` → vendor_prod, vendor_qa, dependencies_to_switch
2. Leer `manifest.json` → detectar vendor actual

## Estado del deploy — deploy_state

Al iniciar, leer `deploy_state` de `.vtex-deploy.yaml`:
- Si `phase == qa_merged` o `phase == deployed` (QA completado) → contexto correcto, continuar
- Si `phase == null` o no existe → advertir al usuario que no hay un QA completado registrado y preguntar si desea continuar

Actualizar `deploy_state.phase` después de cada fase:
- Rama deploy creada → `phase: prod_branch_created`
- Vendor swap a prod commiteado → `phase: prod_transformed`
- PR mergeado a develop → `phase: prod_pr_merged`
- `vtex release` exitoso → `phase: prod_published`
- Usuario validó workspace → `phase: prod_validated`
- `vtex deploy -f` exitoso → eliminar sección `deploy_state` completa de `.vtex-deploy.yaml` (reset)

---

## Verificación de cuenta VTEX (obligatoria)

Antes de cualquier comando `vtex use` o `vtex release`:

```bash
vtex whoami
```

- Si la cuenta ya es `{vendor_prod}` → continuar directamente
- Si la cuenta es otra y hay sesión activa → `vtex switch {vendor_prod}`
- Si no hay sesión → `vtex login {vendor_prod}`

**Nunca asumir en qué cuenta está el usuario.**

---

## Fase 1 — Rama de deploy

**REGLA CRÍTICA:** NUNCA transformar archivos directamente en `qa`, `develop` ni `main`. Siempre crear una rama efímera de deploy.

1. Verificar rama actual: `git branch --show-current`
2. Si no está en `qa` → cambiar a `qa` y pull
3. Crear rama de deploy: `git checkout -b deploy/prod-{YYYYMMDD}`
   - Esta rama es efímera — lleva el código transformado a `develop`
   - Nunca se mergea de vuelta a `qa`

## Fase 2 — Transformación vendor

4. Si vendor actual == vendor_qa → activar skill `vtex-transform` con dirección `to_prod`
5. Commit y push del vendor swap en la rama de deploy:
   ```
   git add -A && git commit -m "chore: vendor swap → prod ({YYYYMMDD})"
   git push -u origin deploy/prod-{YYYYMMDD}
   ```

## Fase 3 — PR a develop

6. Crear PR de `deploy/prod-{YYYYMMDD}` → `develop`
   Intentar con `gh` CLI:
   ```
   gh pr create \
     --base develop \
     --head deploy/prod-{YYYYMMDD} \
     --title "[PROD] deploy/prod-{YYYYMMDD}" \
     --body "Deploy a Producción\n\nApp: {vendor_prod}.{app}\nVendor swap: {vendor_qa} → {vendor_prod}\nOrigen: qa"
   ```
   Si `gh` no está disponible → dar URL directa:
   ```
   URL: https://github.com/{org}/{repo}/compare/develop...deploy/prod-{YYYYMMDD}
   ```
7. Preguntar: "¿PR mergeado? (s/n)" — esperar confirmación

## Fase 4 — Workspace de producción

8. Verificar cuenta con `vtex whoami` → switch o login si es necesario
9. `vtex use deploy{YYYYMMDD} -p` — nombre solo letras y números

## Fase 5 — Release

10. Preguntar: "¿Tipo de release? (patch / minor / major)" y "¿Canal? (stable / beta)"
11. `yes | vtex release {tipo} {canal}`
12. Analizar output:
    - Publish automático exitoso → continuar
    - Sin publish automático → `yes | vtex publish --verbose`
    - Compilación fallida → mostrar error completo y PARAR

## Fase 6 — Instalación y Validación

13. `vtex install {vendor_prod}.{app}@{version}`
14. `vtex browse` — abre el workspace en el navegador
15. Preguntar: "Valida el workspace de Producción. ¿Todo correcto? (s/n)"
    - No → PARAR

## Fase 7 — Deploy

16. Preguntar: "¿Hay contenido de Site Editor modificado en este workspace que necesite preservarse? (s/n)"
17. `yes | vtex deploy {vendor_prod}.{app}@{version} -f` — auto-confirma las 2 preguntas
18. Si Site Editor = s → `vtex promote`

## Fase 8 — Limpieza

19. Preguntar: "¿Se ejecutó `vtex promote`? (s/n)"
    - Si no → cambiar a master y eliminar workspace:
      ```
      yes | vtex use master
      yes | vtex workspace delete deploy{YYYYMMDD}
      ```
    - Si sí → workspace ya eliminado automáticamente
20. Eliminar rama de deploy (local + remota):
    ```bash
    git branch -D deploy/prod-{YYYYMMDD}
    git push origin --delete deploy/prod-{YYYYMMDD}
    ```
    Si la remota ya fue eliminada por el merge → ignorar el error
21. Eliminar sección `deploy_state` de `.vtex-deploy.yaml` (reset completo)

## Fin

22. Reporte final: app, versión, vendor, workspace, timestamp, ambientes desplegados
23. Nota: el PR de develop → main se crea cuando el usuario confirme que la feature es estable en producción (acción separada — no parte de este flujo)

<vtex-rules>
## Reglas del skill

- NUNCA transformar archivos en `qa`, `develop` o `main` directamente — siempre en una rama `deploy/prod-*`
- NUNCA deployar a producción sin que el usuario haya validado el workspace
- NUNCA saltarse la Fase Git — siempre crear rama de deploy y PR a develop
- NUNCA asumir que el código está en estado Prod — verificar vendor en manifest.json
- NUNCA ejecutar `vtex link` automáticamente — el usuario lo hace manualmente
- NUNCA crear workspace con guiones o espacios en el nombre
- SIEMPRE crear workspace de producción (-p) — nunca deployar directamente a master
- SIEMPRE preguntar patch/minor/major y stable/beta — nunca asumir
- SIEMPRE usar `yes | vtex deploy {app} -f` para auto-confirmar ambas preguntas
- SIEMPRE actualizar deploy_state en .vtex-deploy.yaml después de cada fase de prod
- SIEMPRE eliminar workspaces de producción al finalizar si no se ejecutó `vtex promote`
- SIEMPRE eliminar la rama deploy/prod-* después del deploy
- Al completar el deploy a Producción: eliminar la sección deploy_state de .vtex-deploy.yaml (reset completo)
- El PR de develop → main NO es parte de este flujo — es decisión separada del usuario
- Para cambiar de cuenta: usar `vtex switch` si hay sesión activa, `vtex login` si no hay sesión
- Comportarse como asistente de despliegue: guiar al usuario con checkpoints claros, preguntar por información faltante, esperar confirmación antes de avanzar
</vtex-rules>
