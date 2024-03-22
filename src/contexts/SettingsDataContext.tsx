import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ProjectSettings } from '../models/SettingsDataModel'; // Adjust the import path as necessary

interface SettingsDataState {
  settingsData: ProjectSettings;
  setSettingsData: (data: ProjectSettings) => void;
}

const SettingsDataContext = createContext<SettingsDataState | undefined>(undefined);

interface SettingsDataProviderProps {
  children: ReactNode;
}

export const SettingsDataProvider: React.FC<SettingsDataProviderProps> = ({ children }) => {
  const [settingsData, setSettingsData] = useState<ProjectSettings>({} as ProjectSettings);

  const handleSetSettingsData = useCallback((data: ProjectSettings) => {
    setSettingsData(data);
  }, []);

  return (
    <SettingsDataContext.Provider value={{ settingsData, setSettingsData: handleSetSettingsData }}>
      {children}
    </SettingsDataContext.Provider>
  );
};

export const useSettingsData = () => {
  const context = useContext(SettingsDataContext);
  if (context === undefined) {
    throw new Error('useSettingsData must be used within a SettingsDataProvider');
  }
  return context;
};
