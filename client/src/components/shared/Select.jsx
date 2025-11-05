export default function Select({ name, options, value, onChange, placeholder }) {
  return (
    <select
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
    </select>
  );
}