---
id: P4
title: Usuario dice NO en validación de workspace Producción
agents: [deploy-prod, deploy-state]
validates:
  deploy-prod: "Gate de validación prod — NO ejecuta vtex deploy -f, ofrece opciones, limpia"
  deploy-state: "Limpia deploy_state al abandonar"
priority: critica
---

# P4 — Usuario dice NO en validación de workspace de Producción

## Precondiciones

```yaml
# Estado: mid prod deploy, workspace de producción creado, app instalada
vtex:
  workspace_activo: prod20260513
  app_instalada: vendorprod.mi-app@1.2.4
  cuenta: vendorprod

deploy_state:
  phase: prod_published
```

---

## Conversación esperada

**[@deploy-prod — Fase 6: Instalación y Validación]**

**[@deploy-prod]**
```
vtex install vendorprod.mi-app@1.2.4
vtex browse
```

Valida el workspace de Producción. ¿Todo correcto? (s/n)

**[USUARIO]** n

**[@deploy-prod]** El deploy a Producción se detiene aquí.

El workspace `prod20260513` sigue activo para que puedas seguir revisando.

Opciones:
  1. Corregir el problema y retomar desde esta fase
  2. Abandonar el deploy y limpiar

¿Qué prefieres?

**[USUARIO]** 2

**[@deploy-prod]** Limpiando...
```
yes | vtex use master
yes | vtex workspace delete prod20260513
```

Actualizando estado...

**[@deploy-state limpia deploy_state]**

Deploy cancelado. Los cambios en `develop` siguen ahí — la rama `deploy/prod-20260513` puede eliminarse manualmente si no la necesitas.

---

## Variante: usuario elige corregir y retomar

**[USUARIO]** 1

**[@deploy-prod]** El workspace `prod20260513` sigue activo.

Haz el fix en la rama `deploy/prod-20260513`, commitea, vuelve a hacer `vtex install` y confirma cuando estés listo para revalidar.

¿Listo para revalidar? (s/n)

**[USUARIO]** s

**[@deploy-prod]**
```
vtex install vendorprod.mi-app@1.2.4
vtex browse
```

Valida el workspace de Producción. ¿Todo correcto? (s/n)

**[USUARIO]** s

**[Continúa con Fase 7 — Deploy]**

---

## Criterios de éxito

- [ ] Al recibir "n", NO ejecuta `vtex deploy -f` bajo ninguna circunstancia
- [ ] El workspace de producción NO se elimina inmediatamente — el usuario puede seguir inspeccionando
- [ ] Ofrece dos opciones: corregir o abandonar
- [ ] Al abandonar: elimina el workspace Y limpia deploy_state
- [ ] Al retomar: espera confirmación antes de volver a vtex browse
- [ ] El agente NO actualiza deploy_state a `prod_validated` si el usuario dijo no

## Criterios de falla

- Ejecuta `vtex deploy -f` después de recibir "n" (el error más grave posible)
- Elimina el workspace inmediatamente sin dar opción de inspeccionar
- No limpia deploy_state al abandonar — deja el proyecto en estado inconsistente
- No ofrece opciones — solo para sin dar salida al usuario
