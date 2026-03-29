# vtex-deploy

CLI de deploy inteligente para proyectos VTEX IO. Instala un conjunto de skills y reglas en tu agente de IA para automatizar el flujo completo de deploy a QA y Producción, incluyendo transformación de vendor, gestión de ramas y workspaces.

## Instalación

```bash
npx --yes git+ssh://git@github.com/johan-garcia-expe/vtex-deploy.git
```

Ejecuta el instalador en la raíz del proyecto VTEX IO donde quieres configurar el agente.

## Qué instala

```
.agents/
├── skills/
│   ├── vtex-deploy-qa/     — Flujo completo de deploy a QA
│   ├── vtex-deploy-prod/   — Flujo de deploy a Producción
│   ├── vtex-transform/     — Transformación de vendor (QA ↔ Prod)
│   └── vtex-git-flow/      — Gestión de ramas y PRs
├── rules/                  — Reglas globales del agente
└── commands/               — Comandos de deploy
```

Además, inyecta el orchestrator en el archivo nativo de tu agente (`CLAUDE.md`, `.cursor/cursorrules`, etc.).

## Configuración del proyecto

Al ejecutar el primer deploy, el agente detecta que no existe `.vtex-deploy.yaml` y guía la configuración inicial. También puedes crearlo manualmente:

```yaml
vendor_prod: mi-marca
vendor_qa: mi-marca-qa

dependencies_to_switch:
  - mi-marca.components
  - mi-marca.checkout-ui

branches:
  prod: main
  qa: qa
  develop: develop
```

| Campo | Descripción |
|---|---|
| `vendor_prod` | Vendor de la cuenta de Producción |
| `vendor_qa` | Vendor de la cuenta de QA |
| `dependencies_to_switch` | Apps cuyo prefijo se renombra al transformar |
| `branches` | Ramas del repositorio por ambiente |

## Agentes compatibles

| Agente | Archivo configurado |
|---|---|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursor/.cursorrules` |
| GitHub Copilot | `.vscode/copilot-instructions.md` |
| Windsurf | `.windsurf/rules.md` |
| Gemini CLI | `.gemini/GEMINI.md` |
| Codex | `.codex/agents.md` |
| OpenCode | `.opencode/opencode.json` |
| Universal | `AGENTS.md` |

## Skills incluidos

### vtex-deploy-qa

Flujo completo de deploy a QA. Detecta automáticamente el estado del vendor:

- **qa:full** — código en estado Prod → crea deploy branch, transforma vendor, publica, valida, deploy
- **qa:release** — código ya en estado QA → publica directamente sin transformar

### vtex-deploy-prod

Flujo de deploy a Producción. Transforma el vendor si es necesario, crea workspace de producción, publica y despliega.

### vtex-transform

Transformación de archivos entre vendor QA y Prod:
- `manifest.json` — vendor y dependencias
- Archivos CSS/SCSS — renombra archivos que incluyan el vendor
- Store blocks JSON — reemplaza prefijos en `store/blocks/**`

Nunca modifica archivos parciales (`_*.*`) ni CSS compilados si existen fuentes SCSS.

### vtex-git-flow

Gestión de ramas y PRs siguiendo el flujo de deploy:

```
feature/* ──► develop ──► deploy/qa-{fecha} ──► qa
                │
                └──────────────────────────────► main
```

La rama `qa` es one-way: solo recibe PRs desde ramas `deploy/qa-*`, nunca se mergea hacia `develop` o `main`.

## Flujo de deploy QA

```
1. [develop]  git checkout -b deploy/qa-20260328
2. [deploy]   vtex-transform → vendor_qa
3. [deploy]   git commit + push
4. [deploy]   vtex switch {vendor_qa}
5. [deploy]   vtex use deploy20260328 -p
6. [deploy]   vtex release patch stable
7. [deploy]   vtex install
8. [deploy]   vtex browse  ← validación humana
9. [deploy]   vtex deploy -f
10. [deploy]  gh pr create --base qa  ← registro del deploy
```

## Uso

Con el agente configurado, simplemente escribe en lenguaje natural:

```
deploya a QA
```

```
deploy a producción
```

```
transforma a QA
```

El agente lee el estado actual del proyecto, detecta el vendor, y ejecuta el flujo correspondiente solicitando confirmación en cada punto crítico.
