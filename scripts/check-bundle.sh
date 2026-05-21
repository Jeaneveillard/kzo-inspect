#!/usr/bin/env bash
# Vérifie que les fonctions clés des modules source sont bien dans bundle.js
set -e

BUNDLE="js/bundle.js"
ERRORS=0

check() {
  local fn="$1"
  if ! grep -q "$fn" "$BUNDLE"; then
    echo "MANQUANT dans bundle.js : $fn"
    ERRORS=$((ERRORS + 1))
  else
    echo "OK $fn"
  fi
}

echo "=== Validation bundle.js ==="
check "openImageEditor"
check "renderSectionListRail"
check "renderChecklistToolbar"
check "renderChecklistMainPane"
check "openAiAssistant"
check "analyzePhotoWithVision"
check "openReport"
check "openReceipt"
check "escapeAttr"
check "loadInspections"
check "upsertInspection"
check "nextInvoiceNumber"
check "buildInvoiceHtml"
check "sendInvoiceEmail"
check "googleAuthenticate"
check "initGoogleAuth"

echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo "ATTENTION : $ERRORS fonction(s) manquante(s) dans bundle.js"
  exit 1
else
  echo "OK : Toutes les fonctions cles sont presentes dans bundle.js"
fi
