# vtex-deploy — CLAUDE.md

Herramienta CLI que instala subagentes, reglas y skills en proyectos VTEX IO para automatizar deploys a QA y Producción. El agente que trabaje en este repo está trabajando en la **herramienta misma**, no en un proyecto VTEX IO.

---

## Arquitectura

Patrón **Orquestador-Trabajador**. El orquestador detecta el estado y delega; los subagentes ejecutan en contexto aislado.

```
system-prompts/orchestrator.md   ← routing puro, sin lógica de deploy
      ├── agents/config-reader.md      (Haiku)
      ├── agents/deploy-qa.md          (Sonnet + memory:project)
      ├── agents/deploy-prod.md        (Sonnet + memory:project)
      ├── agents/vendor-transformer.md (Sonnet + memory:project)
      ├── agents/git-manager.md        (Haiku)
      └── agents/deploy-state.md       (Haiku)
```

Los subagentes se instalan en `.claude/agents/` del proyecto destino vía `src/install.ts`.

---

## Estructura del repo

```
agents/          ← definiciones de subagentes (frontmatter + instrucciones)
commands/        ← comandos de usuario (/deploy, /checkpoint)
rules/           ← reglas scoped que se instalan en .claude/rules/
skills/          ← skills para otros agentes (Cursor, Copilot, Windsurf...)
system-prompts/  ← orchestrator.md
src/             ← código TypeScript del instalador CLI
```

---

## Convenciones para subagentes

### Campo `description` (crítico para enrutamiento)
- Siempre comenzar con **"DEBE SER USADO"** o **"Usar proactivamente"**
- Incluir la condición de activación exacta (cuándo, no solo qué hace)
- Incluir el input que recibe (ej: "Input: resultado de config-reader")

```yaml
# Correcto
description: "DEBE SER USADO cuando el usuario pide deployar a QA..."

# Incorrecto (pasivo, no activa enrutamiento automático)
description: "Pipeline de deploy a QA en VTEX IO..."
```

### Campo `memory`
Solo para agentes que acumulan conocimiento entre sesiones:
- `memory: project` → `deploy-qa`, `deploy-prod`, `vendor-transformer`
- Sin memory → `config-reader`, `deploy-state`, `git-manager` (operaciones deterministas)

### Model tiering
- **Haiku**: lectura, estado, git (config-reader, deploy-state, git-manager)
- **Sonnet**: escritura, decisiones, pipelines (deploy-qa, deploy-prod, vendor-transformer)

### Reglas scoped (`.claude/rules/`)
- Usar `globs:` en CSV sin comillas: `globs: manifest.json, .vtex-deploy.yaml`
- **No usar** lista YAML bajo `paths:` — silenciosamente falla (bug #17204)

---

## Estado actual de los flujos (al 2026-04-01)

Los flujos de deploy están alineados con el patrón real de proyectos VTEX IO con ambiente QA separado (vendor_prod / vendor_qa).

### Flujos implementados y validados
- **qa:full** — vendor en prod → transform + release + workspace + deploy
- **qa:release** — vendor ya en QA → solo release + workspace + deploy
- **prod:from-qa** — QA completado → `vtex publish --verbose` (sin release, versión ya bumpeada)
- **prod:direct** — sin QA previo → `vtex release` + workspace + deploy

### Invariantes críticos en los flujos
| Regla | Agente |
|-------|--------|
| `deploy/qa-*` se crea desde `feature/*` | git-manager, deploy-qa |
| `deploy/prod-*` se crea desde `qa` | git-manager, deploy-prod |
| NO `vtex release` en `prod:from-qa` | deploy-prod |
| `vtex use master` antes de `vtex deploy -f` | deploy-prod |
| `.claude/` en `.gitignore` antes del release | deploy-qa |
| `git push --set-upstream` antes del release | deploy-qa, git-manager |
| CHANGELOG antes del release | deploy-qa, deploy-prod |
| Workspace `prod{fecha}` sin guiones | deploy-prod |

---

## Bugs conocidos de Claude Code

| Bug | Impacto | Mitigación |
|-----|---------|------------|
| #17204 | `paths:` con lista YAML en rules no funciona | Usar `globs:` CSV |
| #16299 | Reglas scoped cargan globalmente al inicio de sesión | Mantener CLAUDE.md < 200 líneas |
| #31806 | `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` no puede subir el threshold | Solo usarlo para bajar (valor: 50) |

---

## Áreas de mejora pendientes

### Alta prioridad
- [ ] **Instrucciones de memoria** en `deploy-qa.md`, `deploy-prod.md` y `vendor-transformer.md` — `memory: project` está configurado pero los agentes no tienen reglas explícitas de qué guardar ni cuándo
- [ ] **`src/install.ts`** — agregar `copyAgentDefinitions()` y `copyScopedRules()` para instalar `.claude/agents/` y `.claude/rules/` en proyectos destino (actualmente solo instala `.agents/skills/`)

### Media prioridad
- [ ] **Validación del diff** en `git-manager.md` — lógica de `gh pr diff` documentada pero sin paths específicos por tipo de app (Custom vs Theme)
- [ ] **Orquestador** — agregar detección de `deploy_state.phase == prod_*` para reanudar flujos de producción interrumpidos (actualmente solo detecta fases QA)
- [ ] **Soporte multi-vendor** en `vendor-transformer.md` (proyectos con más de 2 cuentas)

### Baja prioridad
- [ ] Subagente `@release-validator` (Haiku) que analice el output de `vtex release` y detecte errores de compilación sin contaminar el contexto de `deploy-qa`

---

## Qué NO hacer

- No modificar `system-prompts/orchestrator.md` para añadir lógica de deploy — debe mantenerse como routing puro (< 80 líneas)
- No embeber `<vtex-rules>` en el orquestador — van en `rules/vtex-deploy-safety.md`
- No usar un solo modelo para todos los subagentes — respetar el tiering Haiku/Sonnet
- No crear skills nuevas para flujos que ya tienen subagente equivalente — la arquitectura de subagentes reemplaza a las skills para Claude Code

---

## Para continuar en una nueva sesión

```
1. Lee este archivo
2. Lee agents/*.md para ver el estado actual de los subagentes
3. Lee src/install.ts para entender el flujo de instalación
```
