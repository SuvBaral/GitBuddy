# Cleanup script to remove stale build artifacts and temporary files
# This script cleans up unnecessary files to prepare the project for distribution

Write-Host "Starting cleanup of stale files..." -ForegroundColor Cyan

$deletedItems = @()

# Clean up test node_modules if it exists
$testNodeModulesPath = "tests\extension.tests\node_modules"
if (Test-Path $testNodeModulesPath) {
    Write-Host "Deleting test node_modules directory..." -ForegroundColor Yellow
    Remove-Item -Path $testNodeModulesPath -Recurse -Force
    $deletedItems += "tests\extension.tests\node_modules (directory)"
}

# Recursively delete all bin folders
Write-Host "Searching for bin/ directories..." -ForegroundColor Yellow
$binFolders = Get-ChildItem -Path . -Recurse -Directory -Filter "bin" -ErrorAction SilentlyContinue
foreach ($folder in $binFolders) {
    Write-Host "Deleting $($folder.FullName)" -ForegroundColor Yellow
    Remove-Item -Path $folder.FullName -Recurse -Force
    $deletedItems += $folder.FullName
}

# Recursively delete all obj folders
Write-Host "Searching for obj/ directories..." -ForegroundColor Yellow
$objFolders = Get-ChildItem -Path . -Recurse -Directory -Filter "obj" -ErrorAction SilentlyContinue
foreach ($folder in $objFolders) {
    Write-Host "Deleting $($folder.FullName)" -ForegroundColor Yellow
    Remove-Item -Path $folder.FullName -Recurse -Force
    $deletedItems += $folder.FullName
}

# Report results
Write-Host "" -ForegroundColor Cyan
Write-Host "Cleanup complete!" -ForegroundColor Green
if ($deletedItems.Count -gt 0) {
    Write-Host "Deleted the following items:" -ForegroundColor Green
    foreach ($item in $deletedItems) {
        Write-Host "  - $item" -ForegroundColor Gray
    }
} else {
    Write-Host "No stale files found to delete." -ForegroundColor Green
}
