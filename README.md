# fin-track

A personal finance tracker application to help you manage your expenses and investments.

*This project was developed as an experiment in AI-assisted programming. A significant portion of the codebase was generated with the help of Google's Gemini, with human oversight for review, integration, and testing.*

## Features

*   **Dashboard:** Upload your bank statement (PDF) and classify transactions.
*   **Expense Analysis:** Visualize your spending by category with interactive bar charts.
*   **Investment Portfolio:** Track your investment portfolio, view asset allocation with a pie chart, and add new investments.
*   **User Authentication:** Secure login and registration using JWT and Google OAuth.
*   **Dark Mode:** A comfortable viewing experience in low-light environments.

## Technologies Used

### Frontend

*   **Framework:** React
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Charting:** Recharts
*   **Icons:** Lucide-React
*   **Routing:** React Router
*   **HTTP Client:** Axios

### Backend

*   **Framework:** Django
*   **API:** Django Rest Framework
*   **Authentication:** dj-rest-auth, django-allauth, simplejwt
*   **Database:** SQLite3
*   **CORS:** django-cors-headers

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js and npm (or yarn/pnpm)
*   Python and pip

### Installation

1.  **Clone the repo:**
    ```sh
    git clone https://github.com/your_username/fin-track.git
    ```

2.  **Frontend Setup:**
    ```sh
    cd client
    npm install
    ```

3.  **Backend Setup:**
    ```sh
    cd backend
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    python manage.py migrate
    ```

### Running the Application

*   **Frontend (Development Server):**
    ```bash
    cd client
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) (the port may vary) to view it in the browser.

*   **Backend Server:**
    ```bash
    cd backend
    source .venv/bin/activate
    python manage.py runserver
    ```
    The backend server will be running at [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

### Frontend Scripts

*   **Production Build:**
    ```bash
    npm run build
    ```
    This will create a `dist` folder with the production-ready files.

*   **Preview Production Build:**
    ```bash
    npm run preview
    ```

*   **Linting:**
    ```bash
    npm run lint
    ```

## API Endpoints

The backend API provides the following endpoints:

*   `/api/auth/google/`: Google OAuth login.
*   `/api/auth/login/`: JWT-based login.
*   `/api/auth/logout/`: JWT-based logout.
*   `/api/auth/user/`: Get user details.
*   `/api/auth/registration/`: User registration.