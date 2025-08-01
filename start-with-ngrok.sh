#!/bin/bash

# Démarre ngrok avec le tunnel statique
ngrok start --config=ngrok.yml --all &

# Attend que ngrok démarre
sleep 2

# Lance ton serveur
npm run dev