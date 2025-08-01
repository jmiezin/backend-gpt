#!/bin/bash

# 👉 Renseigne ici ton token Azure AD (access:ngrok requis)
TOKEN="PASTE_YOUR_ACCESS_TOKEN_HERE"

# 👉 URL de ton API locale
API_BASE_URL="http://localhost:3010"

# 👉 URL à sauvegarder dans ngrok-tunnel.json
NGROK_URL="https://your-tunnel.ngrok.io"

echo "🔐 Test de POST /ngrok/write"
curl -s -o /dev/null -w "➡️  Status: %{http_code}\n" \
  -X POST "$API_BASE_URL/ngrok/write" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$NGROK_URL\"}"

echo -e "\n📥 Test de GET /ngrok/read"
curl -s \
  -X GET "$API_BASE_URL/ngrok/read" \
  -H "Authorization: Bearer $TOKEN" | jq .