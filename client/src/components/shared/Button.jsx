export default function Button({ children, onClick, variant = 'primary', size, icon: Icon, className = '', disabled = false }) {
  const baseStyle = 'flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 transition-colors duration-200';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
    'danger-ghost': 'bg-transparent text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 focus:ring-red-400',
    ghost: 'bg-transparent text-gray-800 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700',
  };

  const sizes = {
    default: 'px-4 py-2',
    icon: 'p-2',
  };

  const sizeStyle = sizes[size] || sizes.default;

  return (
    <button onClick={onClick} className={`${baseStyle} ${sizeStyle} ${variants[variant]} ${className}`} disabled={disabled}>
      {Icon && <Icon className={`w-5 h-5 ${children ? 'mr-2' : ''}`} />}
      {children}
    </button>
  );
}