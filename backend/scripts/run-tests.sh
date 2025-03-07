#!/bin/bash

echo "🧪 Executando testes..."

# Executar testes unitários
echo "🔬 Executando testes unitários..."
npm test

# Verificar se K6 está instalado
if command -v k6 &> /dev/null; then
    echo "🔥 Executando testes de carga com K6..."
    k6 run scripts/k6/load-test.js
else
    echo "⚠️ K6 não está instalado. Pulando testes de carga."
    echo "   Para instalar o K6, visite: https://k6.io/docs/getting-started/installation/"
fi

echo "✅ Testes concluídos!"