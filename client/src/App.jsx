import { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import DashboardPage from './pages/Dashboard';
import GastosPage from './pages/Gastos';
import InvestimentosPage from './pages/Investimentos';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';

const MainLayout = ({ children, isDarkMode, setIsDarkMode }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar 
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        user={user}
        logout={logout}
      />
      <main className="flex-1 overflow-y-auto p-8 bg-gray-100 dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/google" element={<Google />} />
      <Route 
        path="/*" 
        element={
          <PrivateRoute>
            <MainLayout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/gastos" element={<GastosPage />} />
                <Route path="/investimentos" element={<InvestimentosPage />} />
              </Routes>
            </MainLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
