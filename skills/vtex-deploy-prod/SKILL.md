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
- `vtex release` exitoso → `phase: prod_published`
- Usuario validó workspace → `phase: prod_validated`
- `vtex deploy -f` exitoso → `phase: prod_deployed`
- PR mergeado a develop → eliminar sección `deploy_state` completa de `.vtex-deploy.yaml` (reset)

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

## Fase 3 — Gate de cuenta

6. GATE DE CUENTA (obligatorio antes del workspace y release):
   - `vtex whoami`
   - Si la cuenta activa es `{vendor_prod}` → continuar
   - Si no → `vtex switch {vendor_prod}` y confirmar con `vtex whoami`

## Fase 4 — Workspace de producción

7. `vtex use deploy{YYYYMMDD} -p` — nombre solo letras y números

## Fase 5 — Release

8. Actualizar `CHANGELOG.md`:
   - Agregar entrada para la versión a publicar con los cambios incluidos
   - Formato: `## [x.x.x] - YYYY-MM-DD` + cambios categorizados (Added, Fixed, Changed)
   - `git add CHANGELOG.md && git commit -m "docs: update CHANGELOG for release"`
9. Preguntar: "¿Tipo de release? (patch / minor / major)" y "¿Canal? (stable / beta)"
10. `yes | vtex release {tipo} {canal}`
11. Analizar output:
    - Publish automático exitoso → continuar
    - Sin publish automático → `yes | vtex publish --verbose`
    - Compilación fallida → mostrar error completo y PARAR

## Fase 6 — Instalación y Validación

12. `vtex install {vendor_prod}.{app}@{version}`
13. `vtex browse` — abre el workspace en el navegador
14. Preguntar: "Valida el workspace de Producción. ¿Todo correcto? (s/n)"
    - No → PARAR

## Fase 7 — Deploy

15. Preguntar: "¿Hay contenido de Site Editor modificado en este workspace que necesite preservarse? (s/n)"
16. `yes | vtex deploy {vendor_prod}.{app}@{version} -f` — auto-confirma las 2 preguntas
17. Si Site Editor = s → `vtex promote`

## Fase 8 — Limpieza de workspace

18. Preguntar: "¿Se ejecutó `vtex promote`? (s/n)"
    - Si no → cambiar a master y eliminar workspace:
      ```
      yes | vtex use master
      yes | vtex workspace delete deploy{YYYYMMDD}
      ```
    - Si sí → workspace ya eliminado automáticamente
19. Actualizar `deploy_state.phase` → `prod_deployed` en `.vtex-deploy.yaml`

## Fase 9 — PR a develop

20. Crear PR de `deploy/prod-{YYYYMMDD}` → `develop` (incluye vendor swap + CHANGELOG + version bump):
    Intentar con `gh` CLI:
    ```
    gh pr create \
      --base develop \
      --head deploy/prod-{YYYYMMDD} \
      --title "[PROD] deploy/prod-{YYYYMMDD}" \
      --body "Deploy a Producción\n\nApp: {vendor_prod}.{app}@{version}\nVendor swap: {vendor_qa} → {vendor_prod}\nOrigen: qa"
    ```
    Si `gh` no está disponible → dar URL directa:
    ```
    URL: https://github.com/{org}/{repo}/compare/develop...deploy/prod-{YYYYMMDD}
    ```
21. Preguntar: "¿PR mergeado? (s/n)" — esperar confirmación

## Fase 10 — Eliminar rama de deploy

22. Al confirmar merge: eliminar rama de deploy (local + remota):
    ```bash
    git branch -D deploy/prod-{YYYYMMDD}
    git push origin --delete deploy/prod-{YYYYMMDD}
    ```
    Si la remota ya fue eliminada por el merge → ignorar el error
23. Eliminar sección `deploy_state` de `.vtex-deploy.yaml` (reset completo)

## Fin

24. Reporte final: app, versión, vendor, workspace, timestamp, ambientes desplegados
25. Nota: el PR de develop → main se crea cuando el usuario confirme que la feature es estable en producción (acción separada — no parte de este flujo)

<vtex-rules>
## Reglas del skill

- NUNCA transformar archivos en `qa`, `develop` o `main` directamente — siempre en una rama `deploy/prod-*`
- NUNCA deployar a producción sin que el usuario haya validado el workspace
- NUNCA saltarse la Fase Git — siempre crear rama de deploy y PR a develop (al final, después del deploy)
- NUNCA asumir que el código está en estado Prod — verificar vendor en manifest.json
- NUNCA ejecutar `vtex link` automáticamente — el usuario lo hace manualmente
- NUNCA crear workspace con guiones o espacios en el nombre
- NUNCA ejecutar `vtex release` sin verificar primero que la cuenta activa es `{vendor_prod}` (GATE DE CUENTA)
- SIEMPRE crear workspace de producción (-p) — nunca deployar directamente a master
- SIEMPRE preguntar patch/minor/major y stable/beta — nunca asumir
- SIEMPRE usar `yes | vtex deploy {app} -f` para auto-confirmar ambas preguntas
- SIEMPRE actualizar deploy_state en .vtex-deploy.yaml después de cada fase de prod
- SIEMPRE eliminar workspaces de producción al finalizar si no se ejecutó `vtex promote`
- SIEMPRE eliminar la rama deploy/prod-* después del PR mergeado
- SIEMPRE actualizar CHANGELOG.md con la entrada de la versión y hacer commit antes de vtex release
- El PR a develop se crea DESPUÉS del deploy — incluye vendor swap + CHANGELOG + version bump
- Al confirmar merge del PR: eliminar la sección deploy_state de .vtex-deploy.yaml (reset completo)
- El PR de develop → main NO es parte de este flujo — es decisión separada del usuario
- Para cambiar de cuenta: usar `vtex switch` si hay sesión activa, `vtex login` si no hay sesión
- Ejecutar los comandos de deploy directamente (vtex release, vtex deploy -f, vtex promote, vtex workspace delete) — no delegar al usuario. Excepción: vtex link y vtex login (requieren interacción del browser)
</vtex-rules>
