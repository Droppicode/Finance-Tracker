import React from 'react';

// Helper to get date strings in YYYY-MM-DD format
const toYYYYMMDD = (date) => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="date"
        value={toYYYYMMDD(startDate)}
        onChange={(e) => onStartDateChange(e.target.value ? new Date(e.target.value) : null)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <span className="text-gray-500">até</span>
      <input
        type="date"
        value={toYYYYMMDD(endDate)}
        onChange={(e) => onEndDateChange(e.target.value ? new Date(e.target.value) : null)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
    </div>
  );
};

export default DateRangePicker;