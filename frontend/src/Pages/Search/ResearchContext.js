import React, { createContext, useContext, useState } from 'react';

const ResearchContext = createContext();

export const useResearchContext = () => useContext(ResearchContext);

export const ResearchProvider = ({ children }) => {
  const [selectedResearchId, setSelectedResearchId] = useState(null);

  return (
    <ResearchContext.Provider value={{ selectedResearchId, setSelectedResearchId }}>
      {children}
    </ResearchContext.Provider>
  );
};
