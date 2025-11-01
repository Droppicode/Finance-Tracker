import { Menu } from 'lucide-react';
import { useUtils } from '../context/UtilsContext';

export default function Header({ title }) {
  const { toggleSidebar } = useUtils();

  return (
    <header className="mb-6 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{title}</h1>
      <button 
        className="lg:hidden p-2 rounded-md text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
        onClick={toggleSidebar}
        aria-label="Abrir menu"
      >
        <Menu className="w-6 h-6" />
      </button>
    </header>
  );
}