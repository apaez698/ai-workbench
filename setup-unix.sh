#!/bin/bash
# Setup script para configurar el proyecto en Linux/macOS

echo "🚀 Configurando proyecto para Linux/macOS..."
echo ""

# Set permissions on all shell scripts
echo "📝 Configurando permisos en scripts..."
find scripts -name "*.sh" -exec chmod +x {} \;
chmod +x mcps/local-backend-tools/src/tools/*.sh 2>/dev/null || true

echo "✅ Permisos configurados"
echo ""

# Check dependencies
echo "🔍 Verificando dependencias..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "   Descargarlo en: https://nodejs.org"
    exit 1
else
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
else
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
fi

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker: $DOCKER_VERSION"
else
    echo "⚠️  Docker no está instalado (opcional, pero recomendado)"
    echo "   Descargarlo en: https://www.docker.com/products/docker-desktop"
fi

echo ""
echo "🏗️ Instalando dependencias del MCP..."
cd mcps/local-backend-tools
npm install

echo ""
echo "✅ ¡Setup completado!"
echo ""
echo "🚀 Para comenzar:"
echo ""
echo "  cd mcps/local-backend-tools"
echo "  npm run build"
echo "  npm run manual"
echo ""
echo "📚 Para más información:"
echo "  - cat QUICK-REFERENCE.md"
echo "  - cat docs/os-auto-detection.md"
echo "  - cat docs/setup-multiplataforma.md"
echo ""
