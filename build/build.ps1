$ErrorActionPreference = "Stop"

Write-Host "=== Building Git Simple ===" -ForegroundColor Cyan

# Step 1: Publish Blazor WASM
Write-Host "`n[1/4] Publishing Blazor WASM..." -ForegroundColor Yellow
$projectRoot = Split-Path -Parent $PSScriptRoot
dotnet publish "$projectRoot/src/GitSimple.UI/GitSimple.UI.csproj" -c Release -o "$projectRoot/publish"
$blazorSize = (Get-ChildItem "$projectRoot/publish/wwwroot/_framework" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  Blazor output: $([math]::Round($blazorSize, 2)) MB" -ForegroundColor Gray

# Step 2: Copy Blazor output into extension
Write-Host "`n[2/4] Copying Blazor to extension..." -ForegroundColor Yellow
$dest = "$projectRoot/src/extension/blazor-app"
if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
Copy-Item -Recurse "$projectRoot/publish/wwwroot" $dest

# Step 3: Compile TypeScript
Write-Host "`n[3/4] Compiling TypeScript..." -ForegroundColor Yellow
Push-Location "$projectRoot/src/extension"
npm install --silent
npm run compile
Pop-Location

# Step 4: Package VSIX
Write-Host "`n[4/4] Packaging VSIX..." -ForegroundColor Yellow
Push-Location "$projectRoot/src/extension"
npx @vscode/vsce package --no-dependencies
Pop-Location

$vsix = Get-ChildItem "$projectRoot/src/extension/*.vsix" | Select-Object -First 1
if ($vsix) {
    $vsixSize = $vsix.Length / 1MB
    Write-Host "`n=== Done! ===" -ForegroundColor Green
    Write-Host "VSIX: $($vsix.Name) ($([math]::Round($vsixSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "`n=== Build complete (no VSIX generated — install vsce globally) ===" -ForegroundColor Yellow
}
