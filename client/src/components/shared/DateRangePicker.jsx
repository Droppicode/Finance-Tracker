import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker-dark.css';

const CustomDateInput = forwardRef(({ value, onClick, placeholder, onChange }, ref) => (
  <input
    value={value}
    onClick={onClick}
    placeholder={placeholder}
    onChange={onChange}
    ref={ref}
    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white w-32"
  />
));
CustomDateInput.displayName = 'CustomDateInput';

export default function DateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <DatePicker
        selected={startDate}
        onChange={onStartDateChange}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        dateFormat="dd/MM/yyyy"
        customInput={<CustomDateInput />}
        placeholderText="Data de início"
      />
      <div className="flex items-center gap-2">
        <span className="text-gray-500">até</span>
        <DatePicker
          selected={endDate}
          onChange={onEndDateChange}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          dateFormat="dd/MM/yyyy"
          customInput={<CustomDateInput />}
          placeholderText="Data de fim"
        />
      </div>
    </div>
  );
}