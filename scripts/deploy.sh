#!/usr/bin/env bash
set -euo pipefail

# deploy.sh — build and deploy Surge proposals

CLIENT="${1:-}"

if [[ -z "$CLIENT" ]]; then
  echo "Usage: ./scripts/deploy.sh <client-name>"
  exit 1
fi

PROPOSAL="clients/$CLIENT/proposal.html"

if [[ ! -f "$PROPOSAL" ]]; then
  echo "Error: $PROPOSAL not found"
  exit 1
fi

echo "Deploying proposal for: $CLIENT"
# Add deployment logic here
