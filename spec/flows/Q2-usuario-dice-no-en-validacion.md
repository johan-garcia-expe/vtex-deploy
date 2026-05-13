---
id: Q2
title: Usuario dice NO en validación de workspace QA
agents: [deploy-qa]
validates:
  deploy-qa: "Gate de validación — detiene deploy, ofrece corregir o abandonar, limpia workspace"
priority: critica
---

# Q2 — Usuario dice NO en validación de workspace

## Precondiciones

```yaml
# Estado: mid qa:full, workspace ya creado e instalado
# El agente acaba de ejecutar vtex browse
vtex:
  workspace_activo: deploy20260513
  app_instalada: vendorqa.mi-app@1.2.4
  cuenta: vendorqa
```

---

## Conversación esperada

**[@deploy-qa — Checkpoint 4/6: Validación]**

**[@deploy-qa]**
```
vtex browse
```
Abriendo workspace en el navegador...

Valida el workspace QA. ¿Todo correcto? (s/n)

**[USUARIO]** n

**[@deploy-qa]** Entendido. El deploy se detiene aquí.

Opciones para continuar:
  1. Corregir el problema en la rama `deploy/qa-20260513` y retomar
  2. Abandonar este deploy y volver a la rama original

¿Qué prefieres?

**[USUARIO]** 2

**[@deploy-qa]** Limpiando workspace y rama de deploy...
```
yes | vtex use master
yes | vtex workspace delete deploy20260513
git checkout feature/banner-home
```

El deploy fue cancelado. Los cambios de vendor swap en `deploy/qa-20260513` no se mergearon a `qa`.

---

## Variante: usuario elige corregir y retomar

**[USUARIO]** 1

**[@deploy-qa]** Perfecto. Estás en la rama `deploy/qa-20260513`.
Haz los cambios necesarios, commitéalos, y cuando estés listo confirma para continuar con la validación.

¿Listo para revalidar? (s/n)

**[USUARIO]** s

**[@deploy-qa]**
```
vtex browse
```
Valida el workspace QA. ¿Todo correcto? (s/n)

**[USUARIO]** s

**[Continúa con Checkpoint 5/6: Deploy]**

---

## Criterios de éxito

- [ ] Al recibir "n", el agente se detiene INMEDIATAMENTE — no ejecuta vtex deploy
- [ ] Ofrece dos opciones claras: corregir o abandonar
- [ ] Al abandonar: elimina el workspace Y vuelve a la rama original
- [ ] Al retomar: espera confirmación antes de volver a vtex browse
- [ ] No actualiza deploy_state a `deployed` si el usuario dijo no

## Criterios de falla

- Continúa con vtex deploy después de recibir "n"
- No elimina el workspace al abandonar
- No ofrece opciones — solo para sin dar salida
- Actualiza deploy_state como si el deploy hubiera sido exitoso
