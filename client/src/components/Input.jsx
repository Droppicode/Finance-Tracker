import { forwardRef } from 'react';

const Input = forwardRef(({ type = 'text', step, placeholder, value, onChange, onBlur, onKeyDown, onFocus, ...props }, ref) => {
  return (
    <input
        type={type}
        step={step}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        ref={ref}
        {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;