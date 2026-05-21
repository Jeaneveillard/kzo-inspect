#!/bin/bash
cd "$(dirname "$0")"
PORT=8775
URL="http://127.0.0.1:${PORT}/"

echo "════════════════════════════════════════"
echo "  KZO Inspect"
echo "  $URL"
echo "════════════════════════════════════════"
echo ""
echo "  → Ne double-cliquez PAS sur index.html"
echo "  → Utilisez cette fenêtre (serveur local)"
echo ""
echo "  Fermez cette fenêtre pour arrêter l'app."
echo ""

# Ouvre le navigateur après 1 seconde
(sleep 1 && open "$URL") &

python3 -m http.server "$PORT" --bind 127.0.0.1
