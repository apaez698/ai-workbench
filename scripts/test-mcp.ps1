#!/usr/bin/env pwsh

# Script helper para ejecutar tests y verificar el MCP localmente
# Uso: .\test-mcp.ps1 [command]

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

Write-Host "🚀 Local Backend Tools MCP Test Helper" -ForegroundColor Green
Write-Host "Project Root: $projectRoot" -ForegroundColor Cyan
Write-Host ""

# Colors/Status messages
function Print-Status {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Print-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Show help
function Show-Help {
    Print-Status "Available commands:"
    Write-Host ""
    Write-Host "  build              - Build the MCP"
    Write-Host "  flush-redis        - Flush Redis cache"
    Write-Host "  docker-up          - Start Docker containers"
    Write-Host "  docker-down        - Stop Docker containers"
    Write-Host "  reset-postgres     - Reset PostgreSQL database"
    Write-Host "  gradle-test        - Run Gradle tests"
    Write-Host "  manual-test        - Run manual test (TypeScript)"
    Write-Host "  status             - Check if all services are running"
    Write-Host "  help               - Show this help message"
    Write-Host ""
}

# Commands
function Invoke-BuildMCP {
    Print-Status "Building MCP..."
    Push-Location "$projectRoot\mcps\local-backend-tools"
    npm run build
    Pop-Location
    Print-Success "MCP built successfully"
}

function Invoke-FlushRedis {
    Print-Status "Flushing Redis..."
    & "$projectRoot\scripts\cache\flush-redis.ps1"
    Print-Success "Redis flushed"
}

function Invoke-DockerUp {
    Print-Status "Starting Docker containers..."
    & "$projectRoot\scripts\docker\up.ps1"
    Print-Success "Docker containers started"
}

function Invoke-DockerDown {
    Print-Status "Stopping Docker containers..."
    & "$projectRoot\scripts\docker\down.ps1"
    Print-Success "Docker containers stopped"
}

function Invoke-ResetPostgres {
    Print-Status "Resetting PostgreSQL..."
    & "$projectRoot\scripts\db\reset-postgres.ps1"
    Print-Success "PostgreSQL reset"
}

function Invoke-GradleTest {
    Print-Status "Running Gradle tests..."
    & "$projectRoot\scripts\gradle\test.ps1"
    Print-Success "Gradle tests completed"
}

function Invoke-ManualTest {
    Print-Status "Running manual tests..."
    Push-Location "$projectRoot\mcps\local-backend-tools"
    npm run manual
    Pop-Location
    Print-Success "Manual tests completed"
}

function Check-Status {
    Print-Status "Checking service status..."
    Write-Host ""
    
    # Check Docker
    $docker = Get-Command docker -ErrorAction SilentlyContinue
    if ($docker) {
        try {
            & docker ps | Out-Null
            Print-Success "Docker is running"
        }
        catch {
            Print-Error "Docker is not running"
        }
    }
    else {
        Print-Warning "Docker is not installed"
    }
    
    # Check Node.js
    $node = Get-Command node -ErrorAction SilentlyContinue
    if ($node) {
        $version = & node --version
        Print-Success "Node.js is installed: $version"
    }
    else {
        Print-Error "Node.js is not installed"
    }
    
    Write-Host ""
}

# Main
$command = $args[0] ?? "help"

switch ($command) {
    "build" { Invoke-BuildMCP }
    "flush-redis" { Invoke-FlushRedis }
    "docker-up" { Invoke-DockerUp }
    "docker-down" { Invoke-DockerDown }
    "reset-postgres" { Invoke-ResetPostgres }
    "gradle-test" { Invoke-GradleTest }
    "manual-test" { Invoke-ManualTest }
    "status" { Check-Status }
    "help" { Show-Help }
    default {
        Print-Error "Unknown command: $command"
        Write-Host ""
        Show-Help
        exit 1
    }
}
