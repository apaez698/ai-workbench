#!/usr/bin/env pwsh

# Script rápido para ejecutar pruebas del MCP
# Uso: .\run-tests.ps1

Write-Host "🧪 Local Backend Tools - Test Runner" -ForegroundColor Green
Write-Host ""

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "📍 Directorio: $projectRoot" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
$node = Get-Command node -ErrorAction SilentlyContinue
if ($null -eq $node) {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "   Instalar en: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

$nodeVersion = & node --version
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green

# Verificar npm
$npm = Get-Command npm -ErrorAction SilentlyContinue
if ($null -eq $npm) {
    Write-Host "❌ npm no está instalado" -ForegroundColor Red
    exit 1
}

# Instalar dependencias si es necesario
if (-not (Test-Path "$projectRoot\node_modules")) {
    Write-Host ""
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Cyan
    & npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 Ejecutando manual tests..." -ForegroundColor Green
Write-Host ""

& npm run manual

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ¡Todos los tests pasaron!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Resumen:" -ForegroundColor Cyan
    Write-Host "   ✅ DOCKER UP"
    Write-Host "   ✅ RESET POSTGRES"
    Write-Host "   ✅ FLUSH REDIS"
    Write-Host "   ✅ DOCKER DOWN"
    Write-Host ""
    Write-Host "🎯 El sistema multi-plataforma está funcionando correctamente en Windows!" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "❌ Algunos tests fallaron" -ForegroundColor Red
    exit 1
}
