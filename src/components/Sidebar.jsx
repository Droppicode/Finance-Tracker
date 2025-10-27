import {
  LayoutDashboard,
  TrendingUp,
  PieChart as PieIcon,
  Banknote,
  Moon,
  Sun
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, isDarkMode, setIsDarkMode }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'gastos', label: 'Gastos', icon: PieIcon },
    { id: 'investimentos', label: 'Investimentos', icon: TrendingUp },
  ];

  return (
    <nav className="w-64 h-full bg-white dark:bg-gray-800 shadow-lg flex-shrink-0 flex flex-col">
      <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700">
        <Banknote className="w-8 h-8 text-blue-600" />
        <span className="ml-3 text-2xl font-bold text-gray-800 dark:text-gray-100">Fin<span className="text-blue-600">Track</span></span>
      </div>
      <ul className="py-6 px-4 flex-grow">
        {navItems.map(item => (
          <li key={item.id}>
            <button
              onClick={() => setCurrentPage(item.id)}
              className={`flex items-center w-full px-4 py-3 my-1 rounded-lg transition-colors duration-200 
                ${currentPage === item.id 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 font-semibold' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
            >
              <item.icon className="w-6 h-6 mr-3" />
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      
      {/* NOVO: Botão de Tema */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex items-center justify-center w-full px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-200"
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
      </div>
    </nav>
  );
};