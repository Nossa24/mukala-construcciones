#!/bin/zsh
export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="$1"; TAG="$2"
for preset in mobile desktop; do
  if [ "$preset" = "desktop" ]; then P="--preset=desktop"; else P=""; fi
  node node_modules/lighthouse/cli/index.js ${URL:-http://localhost:8766/} $P --quiet --output=json --output-path="$OUT/lh-$TAG-$preset.json" --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility,best-practices,seo > "$OUT/lh-$TAG-$preset.log" 2>&1
  echo "$preset exit $?" >> "$OUT/lh-$TAG-done.txt"
done
