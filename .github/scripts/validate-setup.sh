#!/bin/bash

# Script para validar configuração do YFinance Integration
# Execute: bash .github/scripts/validate-setup.sh

echo "🔍 Validando configuração do YFinance Integration..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check markers
PASS="${GREEN}✓${NC}"
FAIL="${RED}✗${NC}"
WARN="${YELLOW}⚠${NC}"

# Validation results
ERRORS=0
WARNINGS=0

# 1. Check GitHub Actions workflow
echo "1. Verificando GitHub Actions workflow..."
if [ -f ".github/workflows/fetch-historical-data.yml" ]; then
    echo -e "   $PASS Workflow file exists"
else
    echo -e "   $FAIL Workflow file NOT found"
    ((ERRORS++))
fi

# 2. Check Python script
echo ""
echo "2. Verificando script Python..."
if [ -f ".github/scripts/fetch_yfinance.py" ]; then
    echo -e "   $PASS Python script exists"
    if [ -x ".github/scripts/fetch_yfinance.py" ]; then
        echo -e "   $PASS Script is executable"
    else
        echo -e "   $WARN Script is not executable (não é problema)"
        ((WARNINGS++))
    fi
else
    echo -e "   $FAIL Python script NOT found"
    ((ERRORS++))
fi

# 3. Check Python requirements
echo ""
echo "3. Verificando requirements.txt..."
if [ -f ".github/scripts/requirements.txt" ]; then
    echo -e "   $PASS Requirements file exists"
    if grep -q "yfinance" ".github/scripts/requirements.txt"; then
        echo -e "   $PASS yfinance listed"
    else
        echo -e "   $FAIL yfinance NOT listed"
        ((ERRORS++))
    fi
    if grep -q "firebase-admin" ".github/scripts/requirements.txt"; then
        echo -e "   $PASS firebase-admin listed"
    else
        echo -e "   $FAIL firebase-admin NOT listed"
        ((ERRORS++))
    fi
else
    echo -e "   $FAIL Requirements file NOT found"
    ((ERRORS++))
fi

# 4. Check frontend API file
echo ""
echo "4. Verificando frontend API..."
if [ -f "client/src/api/historicalData.js" ]; then
    echo -e "   $PASS historicalData.js exists"
else
    echo -e "   $FAIL historicalData.js NOT found"
    ((ERRORS++))
fi

# 5. Check AssetChart modification
echo ""
echo "5. Verificando AssetChart.jsx..."
if [ -f "client/src/components/Investimentos/AssetChart.jsx" ]; then
    if grep -q "getHistoricalData" "client/src/components/Investimentos/AssetChart.jsx"; then
        echo -e "   $PASS AssetChart usa getHistoricalData"
    else
        echo -e "   $FAIL AssetChart NÃO usa getHistoricalData"
        ((ERRORS++))
    fi
else
    echo -e "   $FAIL AssetChart.jsx NOT found"
    ((ERRORS++))
fi

# 6. Check .env.example
echo ""
echo "6. Verificando .env.example..."
if [ -f "client/.env.example" ]; then
    echo -e "   $PASS .env.example exists"
    if grep -q "VITE_GITHUB_TOKEN" "client/.env.example"; then
        echo -e "   $PASS VITE_GITHUB_TOKEN presente"
    else
        echo -e "   $FAIL VITE_GITHUB_TOKEN ausente"
        ((ERRORS++))
    fi
else
    echo -e "   $FAIL .env.example NOT found"
    ((ERRORS++))
fi

# 7. Check client .env (actual)
echo ""
echo "7. Verificando client/.env (configuração real)..."
if [ -f "client/.env" ]; then
    echo -e "   $PASS .env exists"
    
    # Check for required variables
    REQUIRED_VARS=("VITE_FIREBASE_API_KEY" "VITE_GITHUB_TOKEN" "VITE_GITHUB_REPO_OWNER" "VITE_GITHUB_REPO_NAME")
    
    for VAR in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${VAR}=" "client/.env"; then
            VALUE=$(grep "^${VAR}=" "client/.env" | cut -d'=' -f2)
            if [ -n "$VALUE" ] && [ "$VALUE" != "your_" ] && [ "$VALUE" != "your-" ]; then
                echo -e "   $PASS $VAR configurado"
            else
                echo -e "   $WARN $VAR presente mas parece vazio/template"
                ((WARNINGS++))
            fi
        else
            echo -e "   $FAIL $VAR ausente"
            ((ERRORS++))
        fi
    done
else
    echo -e "   $FAIL .env NOT found - copie .env.example para .env"
    ((ERRORS++))
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Validação concluída com sucesso!${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS avisos encontrados (revise acima)${NC}"
    fi
    echo ""
    echo "Próximos passos:"
    echo "1. Configure GitHub Secret: FIREBASE_SERVICE_ACCOUNT"
    echo "2. Preencha todas as variáveis no client/.env"
    echo "3. Teste manualmente via GitHub Actions UI"
    exit 0
else
    echo -e "${RED}✗ $ERRORS erros encontrados${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS avisos encontrados${NC}"
    fi
    echo ""
    echo "Corrija os erros acima antes de prosseguir."
    exit 1
fi
