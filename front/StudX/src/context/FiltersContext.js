import React, { createContext, useState, useContext } from "react";

// Creamos el contexto de filtros
const FiltersContext = createContext();

export const useFilters = () => {
  return useContext(FiltersContext);
};

export const FiltersProvider = ({ children }) => {
  const [filters, setFilters] = useState({});

  return (
    <FiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </FiltersContext.Provider>
  );
};
