# 💰 fin-track

<p align="right">
  <a href="README.md">🇺🇸 English</a> | <strong>🇧🇷 Português</strong>
</p>

> **Seu dinheiro, suas regras.**  
> Rastreie gastos, monitore investimentos e tome decisões financeiras mais inteligentes — tudo em uma interface elegante e intuitiva.

> [!WARNING]
> **Aviso de Status do Projeto**
> Esta aplicação não está mais em desenvolvimento ativo. Criei uma nova aplicação, o **[Zeno Cash](https://github.com/Droppicode/Zeno-Cash)**, totalmente focada em controle de gastos e monitoramento *offline* de transações, bancos e cartões de crédito. 
> 
> O *Finance-Tracker* (este repositório) ficou voltado exclusivamente para a parte de **investimentos**, utilizando a API da Brapi e GitHub Actions.

<p align="center">
  <img src="https://img.shields.io/badge/React-19.1-61DAFB?style=flat&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-7.1-646CFF?style=flat&logo=vite" alt="Vite"/>
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=flat&logo=tailwindcss" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Firebase-12.5-FFCA28?style=flat&logo=firebase" alt="Firebase"/>
  <img src="https://img.shields.io/badge/License-MIT-success" alt="License"/>
</p>

---

## ✨ Recursos

- 📄 **Upload de Extratos Bancários** — Faça upload de PDFs e classifique transações automaticamente
- 📊 **Análise de Gastos** — Visualize seus gastos por categoria com gráficos interativos
- 💹 **Portfolio de Investimentos** — Acompanhe seus ativos com cotações em tempo real via yfinance
- 🌙 **Modo Escuro** — Interface moderna que se adapta ao seu gosto
- 🔐 **Autenticação Segura** — Login via JWT ou Google OAuth
- 📱 **Responsivo** — Funciona perfeitamente em qualquer dispositivo

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- Conta Firebase (gratuita)
- Conta GitHub (para GitHub Actions)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/fin-track.git
cd fin-track/client

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais Firebase e GitHub

# Instale as dependências e rode o projeto
npm install
npm run dev
```

🎉 Acesse `http://localhost:5173` e comece a rastrear suas finanças!

> **💡 Dica:** Você precisará configurar um projeto Firebase e adicionar as credenciais no arquivo `.env`. Veja a seção de configuração abaixo.

## 🏗️ Stack Tecnológica

| Camada      | Tecnologias                                                   |
|-------------|---------------------------------------------------------------|
| Frontend    | React 19, Vite, Tailwind CSS, Recharts, Lucide Icons         |
| Backend     | Firebase (Firestore, Auth), Vercel Functions (Serverless)    |
| Cloud       | GitHub Actions (data pipeline com yfinance)                   |
| Mobile      | Capacitor (Android/iOS)                                       |

## 📈 Dados Históricos de Ações

fin-track usa um **pipeline automatizado** para buscar dados históricos de ações:

1. **Frontend** solicita dados e cria um documento "pending" no Firestore
2. **GitHub Actions** é acionado via repository dispatch
3. **yfinance** busca dados históricos do Yahoo Finance
4. **Firestore** armazena os dados com cache de 24 horas
5. **Frontend** exibe os gráficos instantaneamente

### Configuração

1. Crie uma conta de serviço no Firebase Console
2. Gere um token do GitHub com escopo `repo`
3. Adicione `FIREBASE_SERVICE_ACCOUNT` aos secrets do repositório
4. Configure `VITE_GITHUB_TOKEN` no `.env` do frontend

Um workflow agendado atualiza os dados **diariamente às 2h UTC** para garantir informações sempre atualizadas. 🔄

## 🤖 Desenvolvido com IA

Este projeto foi uma **experiência em programação assistida por IA**. Uma parte significativa do código foi gerada com o auxílio do **Google Gemini**, com supervisão humana para revisão, integração e testes.

## 📝 Licença

MIT © [Marcos]

---

<p align="center">
  Feito com ❤️ e ☕ • <a href="#-fin-track">Voltar ao topo ↑</a>
</p>
