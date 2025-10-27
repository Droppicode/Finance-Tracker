# Project: fin-track

## Project Overview

This project is a personal finance tracker application named "fin-track". It is a single-page application (SPA) built with React and Vite. The user interface is styled with Tailwind CSS and includes a dark mode feature. The application is designed to help users track their expenses and investments.

**Main Technologies:**

*   **Framework:** React
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Charting:** Recharts
*   **Icons:** Lucide-React
*   **Linting:** ESLint

**Features:**

*   **Dashboard:** Allows users to upload a bank statement (PDF) and classify transactions. The OCR part is simulated with mock data.
*   **Expense Analysis:** Provides a graphical analysis of spending by category using bar charts.
*   **Investment Portfolio:** Tracks the user's investment portfolio, showing the allocation of assets with a pie chart and allowing new investments to be added.
*   **Dark Mode:** The application supports a dark theme.
*   **Language:** The application is written in Portuguese.

## Building and Running

To get the project up and running, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, and you can view the application at `http://localhost:5173` (the port may vary).

3.  **Build for Production:**
    ```bash
    npm run build
    ```
    This command bundles the application for production into the `dist` directory.

4.  **Preview the Production Build:**
    ```bash
    npm run preview
    ```
    This command starts a local server to preview the production build.

5.  **Lint the Code:**
    ```bash
    npm run lint
    ```
    This command runs ESLint to check for any linting errors in the codebase.

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. Utility classes are used directly in the JSX.
*   **Component Structure:** The main components are defined within `src/App.jsx`. For a larger application, these could be split into individual files under a `src/components` directory.
*   **State Management:** The application uses React hooks (`useState`, `useMemo`) for state management.
*   **Coding Style:** The code is formatted according to the rules defined in the ESLint configuration (`eslint.config.js`).
