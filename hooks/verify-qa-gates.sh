#!/bin/bash
# Quality Gate: verifica precondiciones críticas antes de que deploy-qa finalice.
#
# Gates:
#   1. .claude/ está en .gitignore (su ausencia hace fallar vtex release)
#   2. deploy_state.phase fue actualizado en .vtex-deploy.yaml
#
# Se activa vía hook Stop en agents/deploy-qa.md.

INPUT=$(cat)

ERRORS=""

# Gate 1: .claude/ en .gitignore
if [ -f ".gitignore" ]; then
  if ! grep -qE '^\.claude(/)?$' .gitignore 2>/dev/null; then
    ERRORS="${ERRORS}\n- .claude/ no está en .gitignore. vtex release fallará si hay archivos untracked en .claude/. Añade la entrada y commitea."
  fi
else
  ERRORS="${ERRORS}\n- No existe .gitignore. Crea uno con al menos '.claude/' antes de continuar."
fi

# Gate 2: deploy_state.phase actualizado
YAML_FILE=".vtex-deploy.yaml"
if [ -f "$YAML_FILE" ]; then
  PHASE=$(grep 'phase:' "$YAML_FILE" | awk '{print $2}' | tr -d '"' | head -1)
  if [ -z "$PHASE" ] || [ "$PHASE" = "null" ] || [ "$PHASE" = "~" ]; then
    ERRORS="${ERRORS}\n- deploy_state.phase no fue actualizado en .vtex-deploy.yaml. Actualiza la fase actual antes de finalizar."
  fi
fi

if [ -n "$ERRORS" ]; then
  echo "Quality Gate de QA fallido — correcciones requeridas:" >&2
  echo -e "$ERRORS" >&2
  exit 2
fi

echo "OK: quality gates de QA verificados."
exit 0
