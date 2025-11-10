import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  PieChart as PieIcon,
  Banknote,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import { useUtils } from '../context/UtilsContext';

export default function Sidebar({ isDarkMode, setIsDarkMode, user, logout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isSidebarOpen } = useUtils();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'gastos', label: 'Gastos', icon: PieIcon, path: '/gastos' },
    { id: 'investimentos', label: 'Investimentos', icon: TrendingUp, path: '/investimentos' },
  ];

  return (
    <nav className={`w-64 h-full bg-white dark:bg-gray-800 shadow-lg flex-shrink-0 flex flex-col fixed lg:relative z-20 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700">
        <Banknote className="w-8 h-8 text-blue-600" />
        <span className="ml-3 text-2xl font-bold text-gray-800 dark:text-gray-100">Fin<span className="text-blue-600">Track</span></span>
      </div>
      <ul className="py-6 px-4 flex-grow">
        {navItems.map(item => (
          <li key={item.id}>
            <Link
              to={item.path}
              className={`flex items-center w-full px-4 py-3 my-1 rounded-lg transition-colors duration-200 
                ${location.pathname === item.path 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 font-semibold' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
            >
              <item.icon className="w-6 h-6 mr-3" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex items-center justify-center w-full px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-200 mb-2"
        >
          {isDarkMode ? (
            <>
              <Sun className="w-6 h-6 mr-3" />
              <span>Tema Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-6 h-6 mr-3" />
              <span>Tema Escuro</span>
            </>
          )}
        </button>

        <div className="relative">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            {user && (
              <img src={user.photoURL} alt="User profile" className="w-10 h-10 rounded-full" />
            )}
            <span className="ml-3 text-gray-800 dark:text-gray-100">{user ? user.displayName : 'User'}</span>
          </button>
          {isDropdownOpen && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
              <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-left text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};