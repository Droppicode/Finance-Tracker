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

<p align="center">
  <img src=".github/assets/investments.png" alt="Fin-Track Investments Dashboard" width="800" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
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

This project is divided into two separate applications: the frontend (`client/`) and the serverless backend (`api/`). To run the project locally, you need to start both.

**1. Backend Setup (Vercel Serverless API)**
```bash
# Clone the repository
git clone https://github.com/Droppicode/Finance-Tracker.git
cd Finance-Tracker

# Install Vercel CLI if you haven't already
npm i -g vercel

# Create a .env file in the ROOT folder for the backend:
# BRAPI_API_KEY=your_brapi_api_key
# GEMINI_API_KEY=your_gemini_api_key
# GITHUB_TOKEN=your_github_token
# GITHUB_REPO_OWNER=your_github_username
# GITHUB_REPO_NAME=Finance-Tracker

# Run the backend locally (it will typically start on http://localhost:3000)
vercel dev
```

**2. Frontend Setup**
Open a new terminal window:
```bash
cd Finance-Tracker/client

# Configure environment variables
cp .env.example .env

# IMPORTANT: Edit your client/.env to point to the local backend:
# VITE_API_BASE_URL=http://localhost:3000
# Also fill in your Firebase and Google Client ID credentials.

# Install dependencies and run the frontend
npm install
npm run dev
```

🎉 Navigate to `http://localhost:5173` and start tracking your investments!

## 🧪 Demo / Test Mode

Want to test the application without typing any data manually? We've built a **Guest Login** mode!
Just click **"Entrar como Visitante / Teste"** on the login page. You will enter a clean, isolated session where you can click the "Magic Button" to instantly populate the application with dozens of realistic mock data, including:
- 📊 **Diverse Portfolio:** Stocks, FIIs, ETFs, BDRs, and Cryptocurrencies.
- 💸 **Transactions:** Incomes and expenses spanning the current and previous months.
- 📅 **Dynamic Dates:** Data is always generated relative to the current day, ensuring charts are always beautifully populated.

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