# fin-track

A comprehensive personal finance tracker application designed to help users manage their expenses and investments efficiently. This single-page application (SPA) is built with a modern tech stack, offering a rich user experience with features like bank statement processing, expense analysis, investment portfolio tracking, and a customizable dark mode.

*This project was developed as an experiment in AI-assisted programming. A significant portion of the codebase was generated with the help of Google's Gemini, with human oversight for review, integration, and testing.*

## Features

*   **Dashboard & Transaction Management:**
    *   **PDF Statement Upload:** Easily upload bank statements in PDF format.
    *   **AI-Powered Transaction Classification:** Automatically extract and classify transactions from uploaded statements.
    *   **Manual Category Assignment:** Manually assign or re-assign categories to transactions for precise financial tracking.
    *   **Transaction CRUD:** Full control to create, read, update, and delete individual transactions.
*   **Expense Analysis:**
    *   **Categorized Spending:** Visualize spending habits by category through interactive bar charts.
    *   **Financial Insights:** Gain a clear understanding of where your money goes.
*   **Investment Portfolio:**
    *   **Asset Allocation:** Track your investment portfolio with a clear overview of asset distribution using pie charts.
    *   **Investment Tracking:** Add and manage new investments to monitor your portfolio's growth.
*   **User Experience & Customization:**
    *   **Dark Mode (Default):** Enjoy a comfortable viewing experience with a sleek dark theme enabled by default for new users.
    *   **User Authentication:** Secure login and registration with JWT and Google OAuth for seamless access.
    *   **User Profiles:** Manage personal settings and preferences.

## Technologies Used

### Frontend (Client)

*   **Framework:** React
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (with PostCSS and Autoprefixer)
*   **Charting:** Recharts
*   **Icons:** Lucide-React
*   **Routing:** React Router
*   **HTTP Client:** Axios
*   **PDF Handling:** `react-pdf`, `pdfjs-dist`, `react-dropzone`
*   **Authentication:** `@react-oauth/google` (for Google OAuth integration)
*   **Linting:** ESLint

### Backend (API)

*   **Framework:** Django
*   **API:** Django Rest Framework (DRF)
*   **Authentication:** `dj-rest_auth`, `django-allauth`, `djangorestframework_simplejwt`, `oauthlib`, `PyJWT`, `python3-openid`, `social-auth-core` (for social authentication)
*   **Database:** PostgreSQL (via Docker for development and production)
*   **CORS:** `django-cors-headers`
*   **PDF Processing:** `PyPDF2`
*   **AI/Generative AI:** `google-generativeai` (for intelligent statement processing)
*   **Environment Variables:** `python-dotenv`
*   **Containerization:** Docker

## Getting Started

To get a local copy of `fin-track` up and running, follow these simple steps.

### Prerequisites

Ensure you have the following installed on your system:

*   **Node.js** (LTS version recommended) and **npm** (or yarn/pnpm)
*   **Python 3.9+** and **pip**
*   **Docker** and **Docker Compose**

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your_username/fin-track.git
    cd fin-track
    ```

2.  **Frontend Setup:**
    ```bash
    cd client
    npm install
    ```

3.  **Backend Setup (using Docker):**
    *   **Create a `.env` file:** In the `backend` directory, create a file named `.env` and add your PostgreSQL database credentials and other environment variables. A sample `.env` file might look like this:
        ```
        DB_NAME=fintrack_db
        DB_USER=fintrack_user
        DB_PASSWORD=fintrack_password
        DB_HOST=postgres
        DB_PORT=5432
        SECRET_KEY=your_django_secret_key
        # Add any other necessary environment variables, e.g., for Google Generative AI
        ```
    *   **Build and run Docker containers:** From the `backend` directory, run:
        ```bash
        docker-compose up --build -d
        ```
    *   **Apply migrations:** Once the containers are running, apply database migrations:
        ```bash
        docker-compose exec backend python manage.py migrate
        ```
    *   **Create a superuser (optional):**
        ```bash
        docker-compose exec backend python manage.py createsuperuser
        ```

4.  **Backend Setup (without Docker - for development/testing):**
    *   **Create a virtual environment:**
        ```bash
        cd ../backend
        python3 -m venv .venv
        source .venv/bin/activate
        ```
    *   **Install dependencies:**
        ```bash
        pip install -r requirements.txt
        ```
    *   **Create a `.env` file:** In the `backend` directory, create a file named `.env` and add your database credentials (e.g., for SQLite or a local PostgreSQL instance) and other environment variables. For SQLite, you might just need `SECRET_KEY`.
    *   **Apply migrations:**
        ```bash
        python3 manage.py migrate
        ```

### Running the Application

*   **Start the Frontend Development Server:**
    ```bash
    cd client
    npm run dev
    ```
    The frontend application will be accessible at `http://localhost:5173` (the port may vary).

*   **Start the Backend Server (if not using Docker):**
    ```bash
    cd backend
    source .venv/bin/activate
    python3 manage.py runserver
    ```
    The backend API will be running at `http://127.0.0.1:8000/`.

*   **Stopping Docker Containers:**
    ```bash
    cd backend
    docker-compose down
    ```

### Frontend Scripts

*   **Production Build:**
    ```bash
    npm run build
    ```
    This command bundles the application for production into the `dist` directory.

*   **Preview Production Build:**
    ```bash
    npm run preview
    ```
    Starts a local server to preview the production build.

*   **Linting:**
    ```bash
    npm run lint
    ```
    Runs ESLint to check for code quality and style issues.

## API Endpoints

The backend API provides a comprehensive set of endpoints for managing financial data and user authentication:

*   `/admin/`: Django Administration panel.
*   `/api/process-statement/`: Endpoint for uploading and processing PDF bank statements.
*   `/api/profile/`: Retrieve and update the authenticated user's profile (e.g., theme settings).
*   `/api/transactions/`: CRUD operations for user transactions.
*   `/api/categories/`: CRUD operations for user-defined transaction categories.
*   `/auth/login/`: Authenticate users and obtain JWT tokens.
*   `/auth/logout/`: Invalidate JWT tokens.
*   `/auth/user/`: Retrieve details of the authenticated user.
*   `/auth/registration/`: Register new user accounts.
*   `/auth/google/`: Initiate Google OAuth login flow.
*   `/accounts/`: Django Allauth URLs for social account management.

## Development Conventions

*   **Styling:** Tailwind CSS is used for all styling, with utility classes applied directly in JSX.
*   **State Management:** React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`) are utilized for managing component state.
*   **Code Quality:** ESLint is configured to enforce consistent coding styles and best practices.

## Contributing

Contributions are welcome! Please feel free to fork the repository, create a new branch, and submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact

For any inquiries or feedback, please open an issue on the GitHub repository.