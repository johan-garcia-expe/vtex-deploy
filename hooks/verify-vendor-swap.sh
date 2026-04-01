#!/bin/bash
# Quality Gate: verifica que no queden referencias al vendor antiguo
# después de una transformación ejecutada por vendor-transformer.
#
# Se activa vía hook Stop en agents/vendor-transformer.md.
# Recibe JSON en stdin con last_assistant_message y agent_transcript_path.

INPUT=$(cat)

YAML_FILE=".vtex-deploy.yaml"

if [ ! -f "$YAML_FILE" ]; then
  echo "Error: .vtex-deploy.yaml no encontrado" >&2
  exit 2
fi

VENDOR_PROD=$(grep 'vendor_prod:' "$YAML_FILE" | awk '{print $2}' | tr -d '"' | head -1)
VENDOR_QA=$(grep 'vendor_qa:' "$YAML_FILE" | awk '{print $2}' | tr -d '"' | head -1)
PHASE=$(grep 'phase:' "$YAML_FILE" | awk '{print $2}' | tr -d '"' | head -1)

if [ -z "$VENDOR_PROD" ] || [ -z "$VENDOR_QA" ]; then
  echo "Error: vendor_prod o vendor_qa no configurados en .vtex-deploy.yaml" >&2
  exit 2
fi

# Determinar vendor antiguo según la fase actual
if [ "$PHASE" = "transformed" ]; then
  VENDOR_OLD="$VENDOR_PROD"
  VENDOR_NEW="$VENDOR_QA"
elif [ "$PHASE" = "prod_transformed" ]; then
  VENDOR_OLD="$VENDOR_QA"
  VENDOR_NEW="$VENDOR_PROD"
else
  # Sin transformación activa — gate no aplica
  echo "Gate omitido: phase='$PHASE' no indica transformación activa."
  exit 0
fi

echo "Verificando que no queden referencias a '$VENDOR_OLD'..."

FOUND=0
REPORT=""

# manifest.json — campo vendor y dependencies
if grep -q "\"$VENDOR_OLD\"" manifest.json 2>/dev/null; then
  FOUND=1
  REPORT="$REPORT\n  - manifest.json"
fi

# store/**/*.json y *.jsonc
STORE_REFS=$(grep -rl "\"${VENDOR_OLD}\." store/ 2>/dev/null || true)
if [ -n "$STORE_REFS" ]; then
  FOUND=1
  while IFS= read -r f; do
    REPORT="$REPORT\n  - $f"
  done <<< "$STORE_REFS"
fi

if [ "$FOUND" -eq 1 ]; then
  echo "Referencias a '$VENDOR_OLD' encontradas en:" >&2
  echo -e "$REPORT" >&2
  echo "" >&2
  echo "La transformación está incompleta. Reemplaza todas las referencias de '$VENDOR_OLD' por '$VENDOR_NEW' en los archivos listados antes de finalizar." >&2
  exit 2
fi

echo "OK: no quedan referencias a '$VENDOR_OLD'. Transformación completa."
exit 0
