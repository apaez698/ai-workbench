#!/usr/bin/env pwsh
# Setup script para configurar el proyecto en Windows

Write-Host "🚀 Configurando proyecto para Windows..." -ForegroundColor Green
Write-Host ""

# Check ExecutionPolicy
Write-Host "🔍 Verificando ExecutionPolicy..." -ForegroundColor Cyan
$policy = Get-ExecutionPolicy
Write-Host "   ExecutionPolicy actual: $policy"

if ($policy -eq "Restricted") {
    Write-Host "   ⚠️  ExecutionPolicy es 'Restricted'"
    Write-Host "   Ejecutar uno de los siguientes:"
    Write-Host ""
    Write-Host "   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser"
    Write-Host "   o"
    Write-Host "   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"
    Write-Host ""
    Write-Host "   Luego reiniciar PowerShell"
    exit 1
}
else {
    Write-Host "✅ ExecutionPolicy: $policy" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔍 Verificando dependencias..." -ForegroundColor Cyan
Write-Host ""

# Check Node.js
$node = Get-Command node -ErrorAction SilentlyContinue
if ($null -eq $node) {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "   Descargarlo en: https://nodejs.org"
    exit 1
}
else {
    $nodeVersion = & node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
}

# Check npm
$npm = Get-Command npm -ErrorAction SilentlyContinue
if ($null -eq $npm) {
    Write-Host "❌ npm no está instalado" -ForegroundColor Red
    exit 1
}
else {
    $npmVersion = & npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
}

# Check Docker
$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($null -eq $docker) {
    Write-Host "⚠️  Docker no está instalado (opcional, pero recomendado)" -ForegroundColor Yellow
    Write-Host "   Descargarlo en: https://www.docker.com/products/docker-desktop"
}
else {
    $dockerVersion = & docker --version
    Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
}

Write-Host ""
Write-Host "🏗️ Instalando dependencias del MCP..." -ForegroundColor Cyan
Push-Location "mcps\local-backend-tools"
npm install
Pop-Location

Write-Host ""
Write-Host "✅ ¡Setup completado!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Para comenzar:" -ForegroundColor Green
Write-Host ""
Write-Host "  cd mcps\local-backend-tools"
Write-Host "  npm run build"
Write-Host "  npm run manual"
Write-Host ""
Write-Host "📚 Para más información:" -ForegroundColor Green
Write-Host "  - Get-Content QUICK-REFERENCE.md"
Write-Host "  - Get-Content docs/os-auto-detection.md"
Write-Host "  - Get-Content docs/setup-multiplataforma.md"
Write-Host ""
