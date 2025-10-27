import React, { createContext, useContext, useState, useEffect } from 'react';

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [currentDashboard, setCurrentDashboard] = useState('store');
  
  // Load dashboard from localStorage on mount
  useEffect(() => {
    const savedDashboard = localStorage.getItem('selectedDashboard');
    if (savedDashboard && (savedDashboard === 'factory' || savedDashboard === 'store')) {
      setCurrentDashboard(savedDashboard);
    }
  }, []);
  
  const setDashboard = (dashboard) => {
    if (dashboard === 'factory' || dashboard === 'store') {
      setCurrentDashboard(dashboard);
      localStorage.setItem('selectedDashboard', dashboard);
    }
  };
  
  const value = {
    currentDashboard,
    setDashboard,
    isFactory: currentDashboard === 'factory',
    isStore: currentDashboard === 'store'
  };
  
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
