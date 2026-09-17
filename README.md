# 💰 fin-track (Investment Tracker)

<p align="right">
  <strong>🇺🇸 English</strong> | <a href="README.pt-BR.md">🇧🇷 Português</a>
</p>

> [!WARNING]
> **Project Status Notice**
> This application is no longer under active development. I have created a new application, **[Zeno Cash](https://github.com/Droppicode/Zeno-Cash)**, entirely focused on expense tracking and *offline* monitoring of transactions, banks, and credit cards. 
> 
> *Finance-Tracker* (this repository) has pivoted to focus exclusively on **investments**, utilizing the Brapi API and GitHub Actions.

> **Your money, your rules.**  
> Monitor your investment portfolio and track stock quotes in an elegant and intuitive interface.

<p align="center">
  <img src="https://img.shields.io/badge/React-19.1-61DAFB?style=flat&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-7.1-646CFF?style=flat&logo=vite" alt="Vite"/>
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=flat&logo=tailwindcss" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Firebase-12.5-FFCA28?style=flat&logo=firebase" alt="Firebase"/>
  <img src="https://img.shields.io/badge/License-MIT-success" alt="License"/>
</p>

---

## ✨ Features

- 💹 **Investment Portfolio** — Track your assets with real-time quotes via the Brapi API
- 📊 **Asset Analysis** — Visualize your portfolio distribution with interactive charts
- 🌙 **Dark Mode** — Modern interface that adapts to your preference
- 🔐 **Secure Authentication** — Login via Google OAuth or Email
- 📱 **Responsive** — Works perfectly on any device

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Firebase account (free)
- GitHub account (for GitHub Actions)
- Brapi API Token

### Installation

```bash
# Clone the repository
git clone https://github.com/Droppicode/Finance-Tracker.git
cd Finance-Tracker/client

# Configure environment variables
cp .env.example .env
# Edit .env with your Firebase, GitHub, and Brapi credentials

# Install dependencies and run the project
npm install
npm run dev
```

🎉 Navigate to `http://localhost:5173` and start tracking your investments!

## 🏗️ Tech Stack

| Layer       | Technologies                                                  |
|-------------|---------------------------------------------------------------|
| Frontend    | React 19, Vite, Tailwind CSS, Recharts, Lucide Icons         |
| Backend     | Firebase (Firestore, Auth), Vercel Functions (Serverless)    |
| Cloud       | GitHub Actions (data pipeline with Brapi API)                 |

## 📈 Historical Stock Data

fin-track uses an **automated pipeline** to fetch historical stock data:

1. **Frontend** requests data and creates a "pending" document in Firestore
2. **GitHub Actions** is triggered via repository dispatch
3. **Brapi API** fetches historical data for Brazilian stocks (B3)
4. **Firestore** stores the data with a 24-hour cache
5. **Frontend** displays the charts instantly

### Configuration

1. Create a service account in Firebase Console
2. Generate a GitHub token with `repo` scope
3. Obtain a Brapi API token
4. Add `FIREBASE_SERVICE_ACCOUNT` to repository secrets
5. Configure `GITHUB_TOKEN` and `BRAPI_TOKEN` in the backend environment variables

A scheduled workflow updates the data **daily at 2 AM UTC** to ensure information is always up to date. 🔄

## 📝 License

MIT © [Marcos]

---

<p align="center">
  Made with ❤️ and ☕ • <a href="#-fin-track-investment-tracker">Back to top ↑</a>
</p>