import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { getProfile, updateProfile } from '../api/profile';

const UtilsContext = createContext();

export const useUtils = () => {
  return useContext(UtilsContext);
};

export const UtilsProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

          useEffect(() => {
            const fetchProfileDates = async () => {
              if (user) {
                try {
                  setLoading(true);
                  const profile = await getProfile();
                  const today = new Date();
                  const todayDateString = today.toISOString().split('T')[0];
        
                  const lastLoginDate = profile.last_login ? new Date(profile.last_login.replace(/-/g, '/')) : null;
                  const lastLoginDateString = lastLoginDate ? lastLoginDate.toISOString().split('T')[0] : null;
        
                  if (lastLoginDateString !== todayDateString) {
                    // If first login or login on a new day, set default date range
                    const newEndDate = today;
                    const oneMonthAgo = new Date(today);
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                    const newStartDate = oneMonthAgo;
        
                    // Update profile on the backend
                    await updateProfile({
                      start_date: newStartDate.toISOString().split('T')[0],
                      end_date: newEndDate.toISOString().split('T')[0],
                      last_login: todayDateString,
                    });
        
                    setStartDate(newStartDate);
                    setEndDate(newEndDate);
                  } else {
                    // If same day login, use stored dates
                    if (profile.start_date) {
                      setStartDate(new Date(profile.start_date.replace(/-/g, '/')));
                    } else {
                      // Fallback if start_date is missing for some reason
                      const oneMonthAgo = new Date();
                      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                      setStartDate(oneMonthAgo);
                    }
                    if (profile.end_date) {
                      setEndDate(new Date(profile.end_date.replace(/-/g, '/')));
                    } else {
                      // Fallback if end_date is missing
                      setEndDate(new Date());
                    }
                  }
                } catch (err) {
                  setError(err);
                  console.error('Error fetching user profile dates:', err);
                } finally {
                  setLoading(false);
                }
              }
            };
        
            fetchProfileDates();
          }, [user]);  const updateDates = async (newStartDate, newEndDate) => {
    try {
      await updateProfile({
        start_date: newStartDate ? newStartDate.toISOString().split('T')[0] : null,
        end_date: newEndDate ? newEndDate.toISOString().split('T')[0] : null,
      });
      if (newStartDate) {
        setStartDate(newStartDate);
      }
      if (newEndDate) {
        setEndDate(newEndDate);
      }
    } catch (err) {
      setError(err);
      console.error('Error updating user profile dates:', err);
      throw err;
    }
  };

  const value = {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    updateDates,
    loading,
    error,
    isSidebarOpen,
    toggleSidebar,
    notification,
    showNotification,
  };

  return <UtilsContext.Provider value={value}>{children}</UtilsContext.Provider>;
};