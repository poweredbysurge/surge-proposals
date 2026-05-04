#!/bin/bash
set -e

OUT=".vercel/output"
STATIC="$OUT/static"

mkdir -p "$STATIC"

# Copy all static assets
cp -r index.html brand clients templates "$STATIC/"

# Write the required Vercel output config
cat > "$OUT/config.json" <<'EOF'
{
  "version": 3,
  "routes": [
    { "src": "/PDI", "dest": "/clients/PDI/index.html" },
    { "src": "/PDI/seo-report", "dest": "/clients/PDI/seo-report/index.html" },
    { "src": "/accuenviro", "dest": "/clients/accuenviro/index.html" },
    { "src": "/sunrise", "dest": "/clients/sunrise/index.html" },
    { "src": "/test", "dest": "/clients/test/index.html" },
    { "handle": "filesystem" }
  ]
}
EOF

echo "Build complete."
ls "$STATIC"
