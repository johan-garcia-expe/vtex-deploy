---
name: "deploy"
trigger: "deploy, deployar, hacer deploy, cómo deployar"
description: "Guía paso a paso del flujo de deploy VTEX IO con el agente vtex-deploy."
---

# Comando: deploy

## Cómo iniciar un deploy

Simplemente dile al agente lo que quieres hacer:

```
deploya a QA
```
```
deploya a producción
```
```
deploy qa:full
```

El agente leerá la configuración de `.vtex-deploy.yaml` y `manifest.json`, detectará el estado actual y ejecutará el flujo correcto.

---

## Flujos disponibles

### qa:full
Código en estado Prod → deploy a QA con transformación de archivos.

```
[Git] PR feature → qa (si aplica)
  ↓
[Transform] vtex switch + workspace + vendor swap a QA
  ↓
[Release] vtex release → vtex publish (si necesario)
  ↓
[Validación] vtex install → vtex browse → confirmación humana
  ↓
[Deploy] vtex deploy -f → vtex promote (si Site Editor)
```

### qa:release
Código ya en estado QA → solo release y deploy, sin transformación.

```
[Git] PR feature → qa (si aplica)
  ↓
[Release] vtex switch + workspace → vtex release
  ↓
[Validación] vtex install → vtex browse → confirmación humana
  ↓
[Deploy] vtex deploy -f → vtex promote (si Site Editor)
```

### prod
QA validado → deploy a Producción.

```
[Git] PR feature/qa → develop/dev (si aplica)
  ↓
[Transform] vendor swap a Prod (si estaba en QA)
  ↓
[Release] vtex switch + workspace → vtex release
  ↓
[Validación] vtex install → vtex browse → confirmación humana
  ↓
[Deploy] vtex deploy -f → vtex promote (si Site Editor)
```

---

## Configuración del proyecto

El agente usa `.vtex-deploy.yaml` para saber:
- `vendor_prod` — vendor de producción
- `vendor_qa` — vendor de QA
- `dependencies_to_switch` — apps que deben cambiar de vendor
- `branches` — nombres de ramas (main/master, dev/develop, qa)
- `styles` — formato de estilos (css o scss) y directorio fuente

Si el archivo no existe, el agente te guiará para crearlo la primera vez.

---

## Gates de aprobación humana

El agente se detiene y espera tu confirmación en:
1. Merge del PR (si aplica)
2. Tipo de release (patch/minor/major) y canal (stable/beta)
3. Validación del workspace en el navegador
4. Existencia de cambios de Site Editor
5. Confirmación final antes de `vtex deploy -f`
