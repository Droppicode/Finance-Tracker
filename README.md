# fin-track

A personal finance tracker SPA built with React and Django. It helps users track expenses and investments through a clean, dark-mode interface. Features include PDF statement processing, transaction classification, and portfolio visualization.

*This project was developed as an experiment in AI-assisted programming. A significant portion of the codebase was generated with the help of Google's Gemini, with human oversight for review, integration, and testing.*

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
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   Run the frontend development server:
        ```bash
        npm run dev
        ```
        The frontend will be available at `http://localhost:5173`.

## License

This project is licensed under the MIT License.
