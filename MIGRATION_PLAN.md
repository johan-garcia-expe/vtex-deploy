# Plan de Migración: Subagentes + Optimización de Contexto

**Fecha:** 2026-03-31
**Estado:** Pendiente de ejecución

---

## Diagnóstico de la arquitectura actual

| Problema | Impacto |
|---------|---------|
| Orquestador + 8 skills = ~1,500 líneas activas en contexto | Context rot severo en sesiones largas de deploy |
| Reglas de seguridad embebidas en orchestrator.md | Se ignoran cuando supera 200 líneas |
| Un solo modelo para todo | Costo innecesario en tareas de lectura |
| Sin mecanismo de checkpoint | Sesiones largas pierden estado al compactar |

---

## Arquitectura objetivo

```
CLAUDE.md (~80 líneas)
  └─► .claude/rules/vtex-safety.md  ← carga solo en globs relevantes
  └─► ORQUESTADOR (routing puro, sin lógica de skill)
        ├─► @config-reader      (Haiku — detección de estado)
        ├─► @deploy-qa          (Sonnet — pipeline QA)
        ├─► @deploy-prod        (Sonnet — pipeline Prod)
        ├─► @vendor-transformer (Sonnet — vendor swap)
        ├─► @git-manager        (Haiku — ramas/commits/PRs)
        └─► @deploy-state       (Haiku — deploy_state YAML)
```

---

## Archivos a CREAR (8)

### Subagentes — `agents/`
Se instalan en `.claude/agents/` del proyecto destino (solo para Claude Code).

| Archivo | Modelo | Tools | Propósito |
|---------|--------|-------|-----------|
| `agents/config-reader.md` | haiku | Read, Grep, Glob | Lee manifest.json + .vtex-deploy.yaml → devuelve resumen ≤10 líneas |
| `agents/deploy-qa.md` | sonnet | Read, Edit, Bash, Glob, Grep | Pipeline QA completo (embed de vtex-deploy-qa/SKILL.md) |
| `agents/deploy-prod.md` | sonnet | Read, Edit, Bash, Glob, Grep | Pipeline Prod completo (embed de vtex-deploy-prod/SKILL.md) |
| `agents/vendor-transformer.md` | sonnet | Read, Edit, Glob, Grep | Vendor swap (embed de vtex-transform/SKILL.md + rules/vendor-transform.md) |
| `agents/git-manager.md` | haiku | Bash, Read | Git/gh operations (embed de vtex-git-flow/SKILL.md + git-branch-policy.md) |
| `agents/deploy-state.md` | haiku | Read, Edit | Lee/escribe deploy_state en .vtex-deploy.yaml |

### Reglas scoped — `rules/`
Se instalan en `.claude/rules/` del proyecto destino.

| Archivo | globs | Contenido |
|---------|-------|-----------|
| `rules/vtex-deploy-safety.md` | `manifest.json, .vtex-deploy.yaml, store/**` | Bloque `<vtex-rules>` del orchestrator + deploy-safety.md + vendor-transform.md + git-branch-policy.md |

> **Nota técnica — globs vs paths:** Usar `globs:` en CSV sin comillas (`globs: manifest.json, .vtex-deploy.yaml`) en lugar de `paths:` con lista YAML. La lista YAML silenciosamente falla (bug #17204 Claude Code). Hay un bug abierto (#16299) donde las reglas scoped igual se cargan globalmente al inicio de sesión — pero la organización sigue siendo beneficiosa para mantener CLAUDE.md bajo las 200 líneas.

### Checkpoint command — `commands/`

| Archivo | Propósito |
|---------|-----------|
| `commands/checkpoint.md` | Patrón "Document & Clear": guarda estado del deploy en `.vtex-deploy/session-state.md` con instrucciones para `/clear` + retomar sesión |

---

## Archivos a MODIFICAR (2)

### 1. `system-prompts/orchestrator.md`
- Eliminar sección "Skills disponibles" con rutas de Read (ya no se usan)
- Eliminar bloque `<vtex-rules>` completo (se mueve a `.claude/rules/vtex-deploy-safety.md`)
- Agregar routing a subagentes: `@config-reader`, `@deploy-qa`, `@deploy-prod`, etc.
- Agregar instrucción de checkpoint cuando la sesión sea larga
- **Objetivo:** < 80 líneas (vs 116 actuales)

### 2. `src/install.ts`
Añadir 2 nuevas funciones al flujo de instalación:

- `copyAgentDefinitions(destPath)` — crea `.claude/agents/` + copia los 6 archivos de subagentes
  - Solo se ejecuta cuando "Claude Code" está en `selectedAgents`
  - Añadir como **Fase E** del flujo actual
- `copyScopedRules(destPath)` — crea `.claude/rules/` + copia `vtex-deploy-safety.md`
  - Solo se ejecuta cuando "Claude Code" está en `selectedAgents`
  - Añadir como **Fase F** del flujo actual

---

## Optimizaciones de contexto adicionales (sin archivos nuevos)

| Estrategia | Implementación |
|-----------|---------------|
| **Subagent output format** | Cada subagente tendrá instrucción explícita en su system prompt: devolver resumen ≤10 líneas (estado, acciones, resultado, próximo paso) |
| **`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50`** | Añadir al mensaje `p.outro()` del instalador como recomendación para el desarrollador |
| **Model tiering** | Haiku: config-reader, git-manager, deploy-state / Sonnet: deploy-qa, deploy-prod, vendor-transformer |

### Notas sobre `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`
- Env var confirmada real (documentada en sub-agents docs de Claude Code)
- Solo sirve para **bajar** el threshold (no se puede subir por encima de ~83% — bug #31806)
- Valor recomendado: `50`
- Se aplica por terminal: `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50 claude`

---

## Estructura de archivos resultante (en proyecto destino tras instalación)

```
proyecto-vtex-io/
├── .claude/
│   ├── agents/                        ← NUEVO
│   │   ├── config-reader.md
│   │   ├── deploy-qa.md
│   │   ├── deploy-prod.md
│   │   ├── vendor-transformer.md
│   │   ├── git-manager.md
│   │   └── deploy-state.md
│   └── rules/                         ← NUEVO
│       └── vtex-deploy-safety.md
├── .agents/
│   ├── skills/                        ← sin cambios (Cursor, Copilot, etc.)
│   ├── rules/
│   └── commands/
│       └── checkpoint.md              ← NUEVO
├── CLAUDE.md                          ← MODIFICADO (~80 líneas)
└── .vtex-deploy.yaml
```

---

## Resumen de impacto

| Categoría | Antes | Después |
|-----------|-------|---------|
| Archivos nuevos | — | 8 |
| Archivos modificados | — | 2 |
| Líneas en CLAUDE.md | ~116 | < 80 |
| Reglas de seguridad | Embebidas en CLAUDE.md | `.claude/rules/` scoped |
| Skills en contexto activo | 5-8 skills (~1,500 líneas) | Solo el subagente invocado |
| Modelos | Mismo para todo | Haiku (lectura) / Sonnet (escritura) |
| Checkpoint de sesión | No existe | `commands/checkpoint.md` |
| Soporte otros agentes | Cursor, Copilot, Windsurf | Sin cambios |

---

## Contexto de investigación utilizado

- [Claude Code Memory docs](https://code.claude.com/docs/en/memory) — `.claude/rules/` y frontmatter `paths:`/`globs:`
- [Claude Code Sub-agents docs](https://code.claude.com/docs/en/sub-agents) — `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`
- [Bug #17204](https://github.com/anthropics/claude-code/issues/17204) — `globs:` CSV más confiable que `paths:` YAML list
- [Bug #16299](https://github.com/anthropics/claude-code/issues/16299) — reglas scoped cargan globalmente (bug abierto)
- [Bug #31806](https://github.com/anthropics/claude-code/issues/31806) — `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` no puede subir threshold

---

## Para retomar en la próxima sesión

1. Leer este archivo: `@MIGRATION_PLAN.md`
2. Leer el orchestrator actual: `@system-prompts/orchestrator.md`
3. Leer los skills fuente de cada subagente:
   - `@skills/vtex-deploy-qa/SKILL.md`
   - `@skills/vtex-deploy-prod/SKILL.md`
   - `@skills/vtex-transform/SKILL.md`
   - `@skills/vtex-git-flow/SKILL.md`
4. Solicitar al agente: "Ejecuta el plan de migración descrito en MIGRATION_PLAN.md"
