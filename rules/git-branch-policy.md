---
name: "git-branch-policy"
description: "Políticas de ramas Git para el flujo de deploy VTEX IO."
---

# Políticas de Ramas — Deploy VTEX IO

<vtex-rules>
## Estado del código por rama

- main/master → SIEMPRE vendor Prod (código estable en producción)
- dev/develop → SIEMPRE vendor Prod (código listo para deploy a producción)
- qa → vendor QA cuando se necesita persistir código QA en la rama
- Feature branches → SIEMPRE vendor Prod por defecto

## Reglas de PRs

- NUNCA hacer push directo a main/master — siempre via PR desde develop/dev
- NUNCA mergear a main/master como parte del flujo de deploy automático
- SIEMPRE esperar confirmación del usuario de que el PR fue aprobado y mergeado antes de continuar
- SIEMPRE validar el diff del PR y alertar si hay archivos inesperados

## Nombres de workspace

- Solo letras y números — sin guiones, sin espacios, sin caracteres especiales
- Incluir fecha en formato YYYYMMDD
- Ejemplos válidos: deploy20260328, hotfix20260328, release20260401
</vtex-rules>
