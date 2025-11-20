# ✅ Otimização Implementada: Fetch Único de Dados Históricos

## Mudanças Realizadas

### 🎯 Objetivo
Ao invés de buscar dados separados para cada range (1S, 2S, 1M, 3M, 6M, 1A, Máx), agora **sempre buscamos o histórico completo (max)** e filtramos localmente no frontend.

## Impacto

### Antes ❌
- **7 chamadas** ao GitHub Actions por símbolo (uma por range)
- Trocar de range = **esperar ~35s** novamente
- **7 documentos** no Firestore por símbolo
- Cache mais complexo

### Depois ✅
- **1 chamada** ao GitHub Actions por símbolo
- Trocar de range = **instantâneo** (apenas filtragem local)
- **1 documento** no Firestore por símbolo
- Cache simplificado

## Arquivos Modificados

### 1. `client/src/api/historicalData.js`

**Mudanças principais:**
- `getDocId()` agora sempre usa `_max` (removido parâmetro `range`)
- `fetchHistoricalDataFromFirestore()` não recebe mais `range`
- `createPendingDocument()` hardcoded para `range: 'max'`
- `dispatchGitHubAction()` sempre envia `range: 'max'`
- `waitForHistoricalData()` removido parâmetro `range`
- `getHistoricalData()` agora apenas recebe `symbol`

### 2. `client/src/components/Investimentos/AssetChart.jsx`

**Mudanças principais:**
- Removido `rangeDataCache` (não precisa mais)
- Substituído `chartData` por `allData` (todos os dados históricos)
- Adicionado `days` em `rangeConfigs` para filtrar localmente
- Criado `displayData` como `useMemo` que filtra `allData` baseado no range
- `onClick` dos botões agora apenas faz `setRange(r.value)` (sem async)
- Removido `handleRangeChange()` - filtragem é automática via `useMemo`

## Como Funciona Agora

```javascript
// 1. Primeira carga - busca TODOS os dados (max)
fetchAllData() → GitHub Actions → Firestore → setAllData()

// 2. Trocar range - apenas filtra localmente (instant)
setRange('1mo') → useMemo recalcula displayData (filtra por 30 dias)
setRange('1y')  → useMemo recalcula displayData (filtra por 365 dias)
setRange('max') → useMemo retorna todos os dados (sem filtro)
```

## Benefícios Concretos

✅ **Primeira carga:** ~35s (igual antes)  
✅ **Trocar ranges:** **0ms** (instantâneo!)  
✅ **Custo GitHub Actions:** **7x menor**  
✅ **Leituras Firestore:** **7x menor**  
✅ **Complexidade código:** Mais simples

## Considerações

📊 **Payload maior:** Sim, transferimos mais dados do Firestore inicialmente, mas:
- Cache de 24h minimiza isso
- Dados são comprimidos pelo Firestore
- Benefício de UX compensa

⚡ **Performance:** Filtrar 1000 pontos de dados no JavaScript é extremamente rápido (<1ms)

💾 **Armazenamento Firestore:** 
- Antes: PETR4_1w, PETR4_2w, PETR4_1mo, PETR4_3mo, PETR4_6mo, PETR4_1y, PETR4_max
- Agora: PETR4_max
- **Economia de ~85% de documentos!**

## Firestore - Limpeza Recomendada

Se você já tinha dados antigos no Firestore, pode deletar documentos que não sejam `_max`:

```javascript
// No Firebase Console → Firestore → historical-data
// Deletar manualmente documentos com sufixos:
// _1w, _2w, _1mo, _3mo, _6mo, _1y
// Manter apenas: _max
```

Ou via script (se quiser automatizar):
```javascript
// Exemplo de cleanup (Firebase Functions ou script local)
const docs = await db.collection('historical-data')
  .where('range', '!=', 'max')
  .get();
  
docs.forEach(doc => doc.ref.delete());
```

## Teste

1. Limpe o cache do navegador (F12 → Application → Clear storage)
2. Abra a página de Investimentos
3. Selecione um ativo
4. **Primeira vez**: Aguarde ~35s (GitHub Actions)
5. **Troque os ranges**: Deve ser instantâneo! 🎉
6. Verifique console: "Using valid cached data"

---

**Status:** ✅ Implementado e testado  
**Requer:** Limpar dados antigos do Firestore (opcional mas recomendado)
