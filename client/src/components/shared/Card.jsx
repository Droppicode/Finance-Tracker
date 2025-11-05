export default function Card({ children, className = '' }) {
  // Se uma classe de padding (p-*, px-*, py-*, pt-*, pr-*, pb-*, pl-*) for passada, não aplica o p-6 padrão.
  const hasPaddingClass = /(^|\s)p[xytrbl]?-\d+/.test(className);
  const paddingClass = hasPaddingClass ? '' : 'p-6';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${paddingClass} ${className}`}>
        {children}
    </div>
  );
}