import React from 'react';
import { useUtils } from '../../context/UtilsContext';

const Notification = () => {
  const { notification } = useUtils();

  if (!notification.message) {
    return null;
  }

  const baseClasses = 'fixed top-5 right-5 p-4 rounded-lg text-white';
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[notification.type] || 'bg-gray-500'}`}>
      {notification.message}
    </div>
  );
};

export default Notification;
