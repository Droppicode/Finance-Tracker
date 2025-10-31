export default function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label htmlFor="toggle-switch" className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          id="toggle-switch"
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div className={`block w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
          checked ? 'translate-x-6' : ''
        }`}></div>
      </div>
      <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
}