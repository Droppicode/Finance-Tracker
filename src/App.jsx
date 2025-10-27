import { useState, useEffect } from 'react';
import DashboardPage from './pages/Dashboard';
import GastosPage from './pages/Gastos';
import InvestimentosPage from './pages/Investimentos';
import Sidebar from './components/Sidebar'

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'gastos':
        return <GastosPage />;
      case 'investimentos':
        return <InvestimentosPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
      
      <main className="flex-1 overflow-y-auto p-8 bg-gray-100 dark:bg-gray-900">
        {renderPage()}
      </main>
    </div>
  );
}

