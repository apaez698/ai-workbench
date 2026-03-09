#!/bin/bash

# Script helper para ejecutar tests y verificar el MCP localmente
# Uso: bash test-mcp.sh [command]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR" && pwd)"

echo "🚀 Local Backend Tools MCP Test Helper"
echo "Project Root: $PROJECT_ROOT"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
else
    OS="unknown"
fi

echo -e "${BLUE}Detected OS: $OS${NC}"
echo ""

# Available commands
show_help() {
    print_status "Available commands:"
    echo ""
    echo "  build              - Build the MCP"
    echo "  flush-redis        - Flush Redis cache"
    echo "  docker-up          - Start Docker containers"
    echo "  docker-down        - Stop Docker containers"
    echo "  reset-postgres     - Reset PostgreSQL database"
    echo "  gradle-test        - Run Gradle tests"
    echo "  manual-test        - Run manual test (TypeScript)"
    echo "  status             - Check if all services are running"
    echo "  help               - Show this help message"
    echo ""
}

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Commands
build_mcp() {
    print_status "Building MCP..."
    cd "$PROJECT_ROOT/mcps/local-backend-tools"
    npm run build
    print_success "MCP built successfully"
}

flush_redis() {
    print_status "Flushing Redis..."
    if [[ "$OS" == "windows" ]]; then
        powershell -NoProfile -ExecutionPolicy Bypass -File "$PROJECT_ROOT/scripts/cache/flush-redis.ps1"
    else
        bash "$PROJECT_ROOT/scripts/cache/flush-redis.sh"
    fi
    print_success "Redis flushed"
}

docker_up() {
    print_status "Starting Docker containers..."
    if [[ "$OS" == "windows" ]]; then
        powershell -NoProfile -ExecutionPolicy Bypass -File "$PROJECT_ROOT/scripts/docker/up.ps1"
    else
        bash "$PROJECT_ROOT/scripts/docker/up.sh"
    fi
    print_success "Docker containers started"
}

docker_down() {
    print_status "Stopping Docker containers..."
    if [[ "$OS" == "windows" ]]; then
        powershell -NoProfile -ExecutionPolicy Bypass -File "$PROJECT_ROOT/scripts/docker/down.ps1"
    else
        bash "$PROJECT_ROOT/scripts/docker/down.sh"
    fi
    print_success "Docker containers stopped"
}

reset_postgres() {
    print_status "Resetting PostgreSQL..."
    if [[ "$OS" == "windows" ]]; then
        powershell -NoProfile -ExecutionPolicy Bypass -File "$PROJECT_ROOT/scripts/db/reset-postgres.ps1"
    else
        bash "$PROJECT_ROOT/scripts/db/reset-postgres.sh"
    fi
    print_success "PostgreSQL reset"
}

gradle_test() {
    print_status "Running Gradle tests..."
    if [[ "$OS" == "windows" ]]; then
        powershell -NoProfile -ExecutionPolicy Bypass -File "$PROJECT_ROOT/scripts/gradle/test.ps1"
    else
        bash "$PROJECT_ROOT/scripts/gradle/test.sh"
    fi
    print_success "Gradle tests completed"
}

manual_test() {
    print_status "Running manual tests..."
    cd "$PROJECT_ROOT/mcps/local-backend-tools"
    npm run manual
    print_success "Manual tests completed"
}

check_status() {
    print_status "Checking service status..."
    echo ""
    
    # Check Docker
    if command -v docker &> /dev/null; then
        if docker ps > /dev/null 2>&1; then
            print_success "Docker is running"
        else
            print_error "Docker is not running"
        fi
    else
        print_warning "Docker is not installed"
    fi
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed"
    fi
    
    echo ""
}

# Main
COMMAND="${1:-help}"

case "$COMMAND" in
    build)
        build_mcp
        ;;
    flush-redis)
        flush_redis
        ;;
    docker-up)
        docker_up
        ;;
    docker-down)
        docker_down
        ;;
    reset-postgres)
        reset_postgres
        ;;
    gradle-test)
        gradle_test
        ;;
    manual-test)
        manual_test
        ;;
    status)
        check_status
        ;;
    help)
        show_help
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        echo ""
        show_help
        exit 1
        ;;
esac
