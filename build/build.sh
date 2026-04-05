#!/bin/bash
set -e

echo "=== Building Git Simple ==="

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Step 1: Publish Blazor WASM
echo -e "\n[1/4] Publishing Blazor WASM..."
dotnet publish "$PROJECT_ROOT/src/GitSimple.UI/GitSimple.UI.csproj" -c Release -o "$PROJECT_ROOT/publish"
echo "  Blazor output: $(du -sh "$PROJECT_ROOT/publish/wwwroot/_framework" | cut -f1)"

# Step 2: Copy Blazor output into extension
echo -e "\n[2/4] Copying Blazor to extension..."
DEST="$PROJECT_ROOT/src/extension/blazor-app"
rm -rf "$DEST"
cp -r "$PROJECT_ROOT/publish/wwwroot" "$DEST"

# Step 3: Compile TypeScript
echo -e "\n[3/4] Compiling TypeScript..."
cd "$PROJECT_ROOT/src/extension"
npm install --silent
npm run compile

# Step 4: Package VSIX
echo -e "\n[4/4] Packaging VSIX..."
npx @vscode/vsce package --no-dependencies

VSIX=$(ls *.vsix 2>/dev/null | head -1)
if [ -n "$VSIX" ]; then
    echo -e "\n=== Done! ==="
    echo "VSIX: $VSIX ($(du -sh "$VSIX" | cut -f1))"
else
    echo -e "\n=== Build complete (no VSIX generated — install vsce globally) ==="
fi
