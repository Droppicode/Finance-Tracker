import { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { getProfile, updateProfile } from './api/profile';
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
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const localTheme = localStorage.getItem('theme');
    if (localTheme) {
      setIsDarkMode(localTheme === 'dark');
    }

    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        const theme = response.data.theme;
        setIsDarkMode(theme === 'dark');
        localStorage.setItem('theme', theme);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSetIsDarkMode = async (newIsDarkMode) => {
    setIsDarkMode(newIsDarkMode);
    const newTheme = newIsDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    try {
      await updateProfile({ theme: newTheme });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/*" 
        element={
          <PrivateRoute>
            <MainLayout isDarkMode={isDarkMode} setIsDarkMode={handleSetIsDarkMode}>
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
        <TransactionProvider>
          <AppRoutes />
        </TransactionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}