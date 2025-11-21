# 💰 fin-track

<p align="right">
  <strong>🇺🇸 English</strong> | <a href="README.pt-BR.md">🇧🇷 Português</a>
</p>

> **Your money, your rules.**  
> Track expenses, monitor investments, and make smarter financial decisions — all in an elegant and intuitive interface.

<p align="center">
  <img src="https://img.shields.io/badge/React-19.1-61DAFB?style=flat&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-7.1-646CFF?style=flat&logo=vite" alt="Vite"/>
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=flat&logo=tailwindcss" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Firebase-12.5-FFCA28?style=flat&logo=firebase" alt="Firebase"/>
  <img src="https://img.shields.io/badge/License-MIT-success" alt="License"/>
</p>

---

## ✨ Features

- 📄 **Bank Statement Upload** — Upload PDFs and automatically classify transactions
- 📊 **Expense Analysis** — Visualize your spending by category with interactive charts
- 💹 **Investment Portfolio** — Track your assets with real-time quotes via yfinance
- 🌙 **Dark Mode** — Modern interface that adapts to your preference
- 🔐 **Secure Authentication** — Login via JWT or Google OAuth
- 📱 **Responsive** — Works perfectly on any device

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Firebase account (free)
- GitHub account (for GitHub Actions)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/fin-track.git
cd fin-track/client

# Configure environment variables
cp .env.example .env
# Edit .env with your Firebase and GitHub credentials

# Install dependencies and run the project
npm install
npm run dev
```

🎉 Navigate to `http://localhost:5173` and start tracking your finances!

> **💡 Tip:** You'll need to set up a Firebase project and add the credentials to the `.env` file. See the configuration section below.

## 🏗️ Tech Stack

| Layer       | Technologies                                                  |
|-------------|---------------------------------------------------------------|
| Frontend    | React 19, Vite, Tailwind CSS, Recharts, Lucide Icons         |
| Backend     | Firebase (Firestore, Auth), Vercel Functions (Serverless)    |
| Cloud       | GitHub Actions (data pipeline with yfinance)                  |
| Mobile      | Capacitor (Android/iOS)                                       |

## 📈 Historical Stock Data

fin-track uses an **automated pipeline** to fetch historical stock data:

1. **Frontend** requests data and creates a "pending" document in Firestore
2. **GitHub Actions** is triggered via repository dispatch
3. **yfinance** fetches historical data from Yahoo Finance
4. **Firestore** stores the data with a 24-hour cache
5. **Frontend** displays the charts instantly

### Configuration

1. Create a service account in Firebase Console
2. Generate a GitHub token with `repo` scope
3. Add `FIREBASE_SERVICE_ACCOUNT` to repository secrets
4. Configure `VITE_GITHUB_TOKEN` in the frontend `.env`

A scheduled workflow updates the data **daily at 2 AM UTC** to ensure information is always up to date. 🔄

## 🤖 AI-Assisted Development

This project was an **experiment in AI-assisted programming**. A significant portion of the codebase was generated with the help of **Google Gemini**, with human oversight for review, integration, and testing.

## 📝 License

MIT © [Marcos]

---

<p align="center">
  Made with ❤️ and ☕ • <a href="#-fin-track">Back to top ↑</a>
</p>