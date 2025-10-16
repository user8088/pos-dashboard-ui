import React, { createContext, useContext, useState, useCallback } from 'react';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const updateSearch = useCallback((term) => {
    setSearchTerm(term);
    setIsSearchActive(term.length > 0);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearchActive(false);
  }, []);

  const filterData = useCallback((data, searchFields = []) => {
    if (!searchTerm || !data || !Array.isArray(data)) {
      return data;
    }

    const term = searchTerm.toLowerCase();
    
    return data.filter(item => {
      // If no specific fields provided, search all string fields
      if (searchFields.length === 0) {
        return Object.values(item).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(term);
          }
          if (typeof value === 'number') {
            return value.toString().includes(term);
          }
          return false;
        });
      }

      // Search specific fields
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term);
        }
        if (typeof value === 'number') {
          return value.toString().includes(term);
        }
        if (value && typeof value === 'object') {
          // Handle nested objects (e.g., category.name)
          const nestedValue = field.includes('.') 
            ? field.split('.').reduce((obj, key) => obj?.[key], value)
            : value;
          if (typeof nestedValue === 'string') {
            return nestedValue.toLowerCase().includes(term);
          }
          if (typeof nestedValue === 'number') {
            return nestedValue.toString().includes(term);
          }
        }
        return false;
      });
    });
  }, [searchTerm]);

  const value = {
    searchTerm,
    isSearchActive,
    updateSearch,
    clearSearch,
    filterData
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;
