---
id: Q5
title: vtex release falla con TAG_EXISTS
agents: [deploy-qa, release-validator]
validates:
  deploy-qa: "Recuperación automática de TAG_EXISTS — un solo reintento"
  release-validator: "Detecta TAG_EXISTS y devuelve acción correcta"
priority: alta
---

# Q5 — vtex release falla con TAG_EXISTS

## Precondiciones

```yaml
# Estado: mid qa:full, justo después de ejecutar vtex release
# La versión 1.2.3 ya fue publicada anteriormente (en otro vendor o sesión anterior)
vtex:
  workspace_activo: deploy20260513
  cuenta: vendorqa

release_output: |
  info: Running pre release actions
  info: Bumping app version
  error: Tag v1.2.3 already exists
```

---

## Conversación esperada

**[@deploy-qa]** Ejecutando release...
```
vtex release patch stable
```
Cuando aparezca el prompt de publish, confirma con `y`.

**[USUARIO]** [pega output del release con el error]

**[@deploy-qa llama @release-validator — silencioso]**

**[@release-validator responde]**
```
estado: TAG_EXISTS
versión: 1.2.3
resumen: El tag v1.2.3 ya existe — versión previamente publicada
acción: vtex release patch stable
```

**[@deploy-qa]** La versión `1.2.3` ya fue publicada anteriormente. Voy a hacer un nuevo release para incrementar la versión.

```
vtex release patch stable
```
Confirma con `y` cuando aparezca el prompt.

**[USUARIO]** [confirma — output exitoso]

**[@deploy-qa llama @release-validator — silencioso]**

**[@release-validator responde]**
```
estado: SUCCESS
versión: 1.2.4
resumen: Release y publish completados correctamente
acción: ninguna
```

**[@deploy-qa]** Release exitoso. Versión publicada: `1.2.4`. Continuando...

**[Sigue con Checkpoint 3/6: Instalación]**

---

## Variante: segundo release también falla

**[@release-validator responde]**
```
estado: BUILD_ERROR
versión: desconocida
resumen: Error de compilación en el segundo intento
acción: ninguna
detalle: [últimas 15 líneas del output]
```

**[@deploy-qa]** Hay un error de compilación que impide continuar:

```
[detalle del error]
```

El deploy se detiene aquí. Corrige el error en la rama `deploy/qa-20260513`, commitea los cambios y vuelve a ejecutar el deploy.

---

## Criterios de éxito

- [ ] @release-validator detecta TAG_EXISTS automáticamente desde el output
- [ ] El agente ejecuta un segundo `vtex release patch` SIN preguntar al usuario — es recuperación automática
- [ ] El segundo intento también pasa por @release-validator
- [ ] Si el segundo intento falla con BUILD_ERROR, el agente para y muestra el error
- [ ] El agente NO reintenta infinitamente — máximo 1 reintento automático para TAG_EXISTS

## Criterios de falla

- El agente le pregunta al usuario qué hacer cuando detecta TAG_EXISTS (debe ser automático)
- El agente continúa sin verificar que el segundo release fue exitoso
- No para ante BUILD_ERROR en el segundo intento
- Muestra el output raw del release al usuario en lugar de una explicación clara
