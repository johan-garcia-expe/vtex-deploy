#!/bin/bash
# Quality Gate: verifica precondiciones críticas antes de que deploy-prod finalice.
#
# Gates:
#   1. vendor en manifest.json == vendor_prod (vendor swap a prod completado)
#   2. deploy_state.phase fue actualizado en .vtex-deploy.yaml
#
# Se activa vía hook Stop en agents/deploy-prod.md.

INPUT=$(cat)

YAML_FILE=".vtex-deploy.yaml"
ERRORS=""

if [ ! -f "$YAML_FILE" ]; then
  echo "Error: .vtex-deploy.yaml no encontrado" >&2
  exit 2
fi

VENDOR_PROD=$(grep 'vendor_prod:' "$YAML_FILE" | awk '{print $2}' | tr -d '"' | head -1)
PHASE=$(grep 'phase:' "$YAML_FILE" | awk '{print $2}' | tr -d '"' | head -1)

# Gate 1: vendor en manifest.json debe ser vendor_prod
if [ -f "manifest.json" ] && [ -n "$VENDOR_PROD" ]; then
  CURRENT_VENDOR=$(grep '"vendor"' manifest.json | head -1 | sed 's/.*"vendor"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
  if [ -n "$CURRENT_VENDOR" ] && [ "$CURRENT_VENDOR" != "$VENDOR_PROD" ]; then
    ERRORS="${ERRORS}\n- vendor en manifest.json es '$CURRENT_VENDOR' pero se esperaba '$VENDOR_PROD'. El vendor swap a producción no se aplicó o no fue commiteado."
  fi
fi

# Gate 2: deploy_state.phase fue actualizado
if [ -z "$PHASE" ] || [ "$PHASE" = "null" ] || [ "$PHASE" = "~" ]; then
  ERRORS="${ERRORS}\n- deploy_state.phase no fue actualizado en .vtex-deploy.yaml. Actualiza la fase antes de finalizar."
fi

if [ -n "$ERRORS" ]; then
  echo "Quality Gate de Producción fallido — correcciones requeridas:" >&2
  echo -e "$ERRORS" >&2
  exit 2
fi

echo "OK: quality gates de Producción verificados."
exit 0
