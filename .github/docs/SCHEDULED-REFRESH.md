# 🔄 Scheduled Data Refresh

## Overview

O sistema agora inclui um **GitHub Actions workflow agendado** que roda automaticamente todos os dias para manter os dados históricos sempre atualizados.

## Como Funciona

### Workflow: `scheduled-refresh.yml`

- **Frequência**: Diariamente às 2 AM UTC (11 PM BRT)
- **Ação**: Atualiza dados históricos de todos os símbolos já pesquisados
- **Localização**: `.github/workflows/scheduled-refresh.yml`

### Script: `refresh_all_data.py`

**Lógica:**

1. 📋 Busca todos os símbolos únicos da coleção `historical-data` no Firestore
2. ✅ Para cada símbolo, verifica se os dados precisam ser atualizados:
   - Dados com **mais de 12 horas** → atualiza
   - Dados com **status 'error'** → tenta novamente
   - Dados **frescos** (< 12h) → pula
3. 🔄 Busca dados atualizados do YFinance
4. 💾 Salva no Firestore

**Proteções:**
- Limite padrão de 50 símbolos por execução (evita timeout)
- Reusa a lógica de `fetch_yfinance.py` (sem duplicação de código)
- Logs detalhados de sucesso/erro

## Configuração

### Já está pronto! ✅

Se você já configurou o `FIREBASE_SERVICE_ACCOUNT` secret, o workflow scheduled já funciona automaticamente.

### Customizar (opcional)

Editar `.github/workflows/scheduled-refresh.yml`:

```yaml
schedule:
  # Alterar horário (formato cron UTC)
  - cron: '0 2 * * *'  # 2 AM UTC = 11 PM BRT
  # Exemplos:
  # - cron: '0 6 * * *'   # 6 AM UTC = 3 AM BRT
  # - cron: '0 */12 * * *' # A cada 12 horas
```

Alterar número máximo de símbolos:

```yaml
--max-symbols ${{ github.event.inputs.max_symbols || '50' }}
# Trocar '50' para outro limite (ex: '100')
```

## Teste Manual

Você pode testar o refresh sem esperar o cron:

1. Vá para **Actions** no GitHub
2. Selecione **"Scheduled Data Refresh"**
3. Clique em **"Run workflow"**
4. (Opcional) Altere `max_symbols` se quiser
5. Clique em **"Run workflow"**

Aguarde ~1-2 minutos e verifique os logs.

## Logs e Monitoramento

### Logs do Workflow

Cada execução mostra:
```
[1/3] Refreshing PETR4...
  → Fetching data from YFinance...
  → Saving to Firestore...
  ✓ PETR4 refreshed successfully (252 points)

[2/3] Refreshing VALE3...
  ✓ VALE3 data is fresh (< 12 hours old), skipping

[3/3] Refreshing ITUB4...
  → Fetching data from YFinance...
  → Saving to Firestore...
  ✓ ITUB4 refreshed successfully (189 points)

=============================
REFRESH SUMMARY
=============================
Total symbols: 3
✓ Successful: 3
✗ Failed: 0
```

### Notificações de Falha

Se algum símbolo falhar, o workflow:
- ✅ Continua processando os outros
- ⚠️ Marca o workflow como "failed" (amarelo no GitHub)
- 📧 GitHub pode enviar notificações (configurável em Settings)

## Benefícios

✅ **Dados sempre frescos**: Usuários sempre veem dados recentes (< 12h)  
✅ **Zero espera**: Primeira carga é instantânea (dados já estão no cache)  
✅ **Automático**: Nenhuma ação manual necessária  
✅ **Eficiente**: Só atualiza se necessário (> 12h ou erro)

## Gestão de Custos

**GitHub Actions (free tier):**
- 2000 minutos/mês grátis para repos privados
- Execução típica: ~2min para 10 símbolos
- **Uso mensal estimado**: ~60 minutos (30 dias × 2 min)
- **Sobra**: ~1940 minutos para outras ações

**Firestore (free tier):**
- 50k leituras/dia grátis
- Refresh diário: ~50 leituras (1 por símbolo)
- **Uso mensal**: ~1500 leituras
- **Muito abaixo do limite!** ✅

## Desabilitar (se necessário)

Para desabilitar o refresh automático:

**Opção 1: Via GitHub UI**
1. Actions → Scheduled Data Refresh
2. "..." → Disable workflow

**Opção 2: Deletar o arquivo**
```bash
git rm .github/workflows/scheduled-refresh.yml
git commit -m "Disable scheduled refresh"
git push
```

## Troubleshooting

### Workflow não está rodando

- ✅ Verifique se o workflow está **enabled** (Actions → Scheduled Data Refresh)
- ✅ Workflows só rodam em **branch padrão** (main/master/yfinance-actions)
- ✅ Aguarde até o próximo horário agendado (2 AM UTC)

### Erros de autenticação Firebase

- ✅ Verifique se `FIREBASE_SERVICE_ACCOUNT` secret está configurado
- ✅ Secret deve ter o JSON completo do service account

### Rate limiting do YFinance

Se tiver muitos símbolos (>100):
- Reduza `max_symbols` para 50 ou menos
- Ou adicione delay entre requisições no script

---

**Status**: ✅ Ativo  
**Próxima execução**: Verifique em Actions → Scheduled Data Refresh
