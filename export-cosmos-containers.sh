#!/usr/bin/env bash
set -euo pipefail

# Lecture des arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --rg)      RG="$2"; shift 2 ;;
    --account) ACCOUNT="$2"; shift 2 ;;
    --db)      DB="$2"; shift 2 ;;
    *)         echo "Usage: $0 --rg <resource-group> --account <account-name> --db <database-name>"; exit 1 ;;
  esac
done

if [[ -z "${RG:-}" || -z "${ACCOUNT:-}" || -z "${DB:-}" ]]; then
  echo "Usage: $0 --rg <resource-group> --account <account-name> --db <database-name>"
  exit 1
fi

OUTFILE="cosmos-containers.md"

echo "→ Export des containers pour RG=$RG, Account=$ACCOUNT, DB=$DB..."

# En-tête Markdown
cat > "$OUTFILE" <<EOF
# Conteneurs CosmosDB pour \`$DB\`

| Nom de container | Clé de partition | TTL par défaut (s) | Mode d’indexation |
|:-----------------|:----------------:|:------------------:|:------------------:|
EOF

# Lignes dynamiques
az cosmosdb sql container list \
  --resource-group "$RG" \
  --account-name  "$ACCOUNT" \
  --database-name "$DB" \
  -o json \
| jq -r '
  .[] |
  [
    .name,
    (.resource.partitionKey.paths | join(", ")),
    ((.resource.defaultTtl // "-") | tostring),
    (.resource.indexingPolicy.indexingMode // "-")
  ] | "| " + join(" | ") + " |"
' >> "$OUTFILE"

echo "✅ Export terminé : ./$OUTFILE"