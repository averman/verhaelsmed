import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Narrative from '../core/Narrative'

interface NarrativeDataState {
  settingsData: Narrative[];
  setSettingsData: (data: Narrative[]) => void;
}

const NarrativeDataContext = createContext<NarrativeDataState | undefined>(undefined);

interface SettingsDataProviderProps {
  children: ReactNode;
}

export const NarrativeDataProvider: React.FC<SettingsDataProviderProps> = ({ children }) => {
  const [settingsData, setSettingsData] = useState<Narrative[]>([]);

  const handleSetNarrativeData = useCallback((data: Narrative[]) => {
    setSettingsData(data);
  }, []);

  return (
    <NarrativeDataContext.Provider value={{ settingsData, setSettingsData: handleSetNarrativeData }}>
      {children}
    </NarrativeDataContext.Provider>
  );
};

export const useSettingsData = () => {
  const context = useContext(NarrativeDataContext);
  if (context === undefined) {
    throw new Error('useSettingsData must be used within a SettingsDataProvider');
  }
  return context;
};
