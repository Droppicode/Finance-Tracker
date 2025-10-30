
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

  useEffect(() => {
    const fetchProfileDates = async () => {
      if (user) {
        try {
          setLoading(true);
          const profile = await getProfile();
          if (profile.data.start_date) {
            setStartDate(new Date(profile.data.start_date));
          }
          if (profile.data.end_date) {
            setEndDate(new Date(profile.data.end_date));
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
  }, [user]);

  const updateDates = async (newStartDate, newEndDate) => {
    try {
      const updatedProfile = await updateProfile({
        start_date: newStartDate ? newStartDate.toISOString().split('T')[0] : null,
        end_date: newEndDate ? newEndDate.toISOString().split('T')[0] : null,
      });
      if (updatedProfile.data.start_date) {
        setStartDate(new Date(updatedProfile.data.start_date));
      }
      if (updatedProfile.data.end_date) {
        setEndDate(new Date(updatedProfile.data.end_date));
      }
      return updatedProfile;
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
  };

  return <UtilsContext.Provider value={value}>{children}</UtilsContext.Provider>;
};

