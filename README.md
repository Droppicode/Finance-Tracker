# fin-track                                                                               
                                                                                          
A personal finance tracker SPA built with React and Django. It helps users track expenses 
and investments through a clean, dark-mode interface. Features include PDF statement proce
ssing, transaction classification, and portfolio visualization.                           
                                                                                          
*This project was developed as an experiment in AI-assisted programming. A significant por
tion of the codebase was generated with the help of Google's Gemini, with human oversight 
for review, integration, and testing.*                                                    
                                                                                          
## Core Features                                                                          
                                                                                          
*   PDF Bank Statement Upload & Processing                                                
*   Automatic & Manual Transaction Categorization                                         
*   Expense Analysis with Charts                                                          
*   Investment Portfolio Tracking                                                         
*   User Authentication (JWT & Google OAuth)                                              
                                                                                          
## Tech Stack                                                                             
                                                                                          
*   **Frontend:** React, Vite, Tailwind CSS, Recharts                                     
*   **Backend:** Django, Django Rest Framework, PostgreSQL                                
*   **Containerization:** Docker                                                          
                                                                                          
## Getting Started                                                                        
                                                                                          
To get a local copy of `fin-track` up and running, follow these steps.                    
                                                                                          
### Prerequisites                                                                         
                                                                                          
*   Node.js and npm                                                                       
*   Python 3.9+ and pip                                                                   
*   Docker and Docker Compose                                                             
                                                                                          
### Local Development                                                                     
                                                                                          
1.  **Clone the repository:**                                                             
    ```bash                                                                               
    git clone https://github.com/your_username/fin-track.git                              
    cd fin-track                                                                          
    ```                                                                                   
                                                                                          
2.  **Backend Setup:**                                                                    
    *   Navigate to the backend directory: `cd backend`                                   
    *   Create a `.env` file. You can use the following as a template:                    
        ```env                                                                            
        # backend/.env                                                                    
        DB_NAME=fintrack_db                                                               
        DB_USER=fintrack_user                                                             
        DB_PASSWORD=fintrack_password                                                     
        DB_HOST=postgres                                                                  
        DB_PORT=5432                                                                      
        SECRET_KEY='your-strong-secret-key'                                               
        # Add other secrets like Google API keys if needed                                
        ```                                                                               
    *   Start the PostgreSQL database using Docker:                                       
        ```bash                                                                           
        docker-compose up -d                                                              
        ```                                                                               
    *   Set up a Python virtual environment and install dependencies:                     
        ```bash                                                                           
        python3 -m venv .venv                                                             
        source .venv/bin/activate                                                         
        pip install -r requirements.txt                                                   
        ```                                                                               
    *   Apply database migrations:                                                        
        ```bash                                                                           
        python3 manage.py migrate                                                         
        ```                                                                               
    *   Run the backend server:                                                           
        ```bash                                                                           
        python3 manage.py runserver                                                       
        ```                                                                               
        The backend will be available at `http://127.0.0.1:8000`.                         
                                                                                          
3.  **Frontend Setup:**                                                                   
    *   In a new terminal, navigate to the client directory: `cd client`                  
    *   Create a `.env` file based on `.env.example`:
        ```bash
        cp .env.example .env
        ```
    *   Fill in the required environment variables:
        - Firebase configuration (from Firebase Console)
        - GitHub token for triggering historical data fetch
        - Your GitHub repository owner and name
    *   Install dependencies:                                                             
        ```bash                                                                           
        npm install                                                                       
        ```                                                                               
    *   Run the frontend development server:                                              
        ```bash                                                                           
        npm run dev                                                                       
        ```                                                                               
        The frontend will be available at `http://localhost:5173`.                        

## Historical Stock Data Configuration

The application uses **yfinance** to fetch historical stock data via GitHub Actions, which then stores the data in Firestore for the frontend to consume.

### Prerequisites

1. **Firebase Service Account:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

2. **GitHub Personal Access Token:**
   - Go to GitHub Settings → Developer Settings → Personal Access Tokens
   - Generate a new token with `repo` scope
   - Copy the token and add it to your frontend `.env` file as `VITE_GITHUB_TOKEN`

3. **GitHub Repository Secrets:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add a new secret named `FIREBASE_SERVICE_ACCOUNT`
   - Paste the entire content of your Firebase service account JSON file

### How It Works

1. User selects a time range in the AssetChart component
2. Frontend checks Firestore for cached data (valid for 24 hours)
3. If data not found or expired:
   - Creates a "pending" document in Firestore
   - Triggers GitHub Actions workflow via repository dispatch
   - Polls Firestore every 2 seconds (max 30 seconds)
4. GitHub Actions:
   - Runs Python script with yfinance
   - Fetches historical data from Yahoo Finance
   - Saves to Firestore with status "completed" or "error"
5. Frontend receives the data and displays the chart

### Firestore Structure

```
/historical-data/
  {symbol}_{range}/
    - status: 'pending' | 'completed' | 'error'
    - symbol: string
    - range: string
    - data: array of {date, open, high, low, close, volume}
    - fetchedAt: ISO timestamp
    - error: string (if status is error)
```

### Manual Testing

You can manually trigger the GitHub Actions workflow:
1. Go to your repository → Actions → "Fetch Historical Stock Data"
2. Click "Run workflow"
3. Enter a symbol (e.g., PETR4) and range (e.g., 1mo)
4. Check Firestore to see if data was saved correctly

### Scheduled Automatic Refresh

A **scheduled GitHub Actions workflow** runs daily at 2 AM UTC (11 PM BRT) to automatically refresh historical data for all symbols already in Firestore. This ensures:

- ✅ Data is always fresh (< 12 hours old)
- ✅ Users experience instant loading (data pre-cached)
- ✅ Only updates symbols that are older than 12 hours

**Manual trigger:** Go to Actions → "Scheduled Data Refresh" → Run workflow

See [.github/docs/SCHEDULED-REFRESH.md](file:///.github/docs/SCHEDULED-REFRESH.md) for details.
                                                                                          
## License                                                                                
                                                                                          
This project is licensed under the MIT License.