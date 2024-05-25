import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { ProjectSettings } from '../models/SettingsDataModel';
import { db, FormState } from '../utils/IndexedDbUtils';
import { randomString } from '../utils/Random';

interface ProjectItem {
  name: string;
  id: string;
  description: string;
}

interface SettingsDataState {
  settingsData: ProjectSettings;
  setSettingsData: (data: ProjectSettings) => void;
  loadSettingsData: (id: string) => Promise<void>;
  saveSettingsData: (data: ProjectSettings) => Promise<void>;
  deleteSettingsData: (id: string) => Promise<void>;
  items: ProjectItem[];
  loadItems: () => Promise<void>;
}

const SettingsDataContext = createContext<SettingsDataState | undefined>(undefined);

export const SettingsDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settingsData, setSettingsData] = useState<ProjectSettings>({} as ProjectSettings);
  const [items, setItems] = useState<ProjectItem[]>([]);

  const loadSettingsData = useCallback(async (id: string) => {
    const initialState: FormState | undefined = await db.formState.get(id);
    if (initialState && initialState.data) {
      setSettingsData(initialState.data);
    }
  }, []);

  const saveSettingsData = useCallback(async (data: ProjectSettings) => {
    await db.safePut({ id: data.projectId, data, lastUpdatedTime: Date.now() });
    setSettingsData(data);
    await loadItems(); // Reload items after saving data
  }, []);

  const deleteSettingsData = useCallback(async (id: string) => {
    await db.formState.delete(id);
    setSettingsData({ projectId: randomString(8) } as ProjectSettings);
    loadItems(); // Reload items after deleting data
  }, []);

  useEffect(() => {
     db.safePut({ id: 'settings', data: settingsData, lastUpdatedTime: Date.now() });
  }, [settingsData]);

  const loadItems = useCallback(async () => {
    const allIds = await db.getAllProjectIds();
    const newItems = await Promise.all(allIds.map(async (id) => {
      const data = await db.formState.get(id);
      return { name: data?.data.projectName || '', id: id, description: data?.data.projectDescription || '' };
    }));
    setItems(newItems);
  }, []);

  useEffect(() => {
    loadSettingsData("settings");
    loadItems();
  }, [loadSettingsData, loadItems]);

  return (
    <SettingsDataContext.Provider value={{ settingsData, setSettingsData, loadSettingsData, saveSettingsData, deleteSettingsData, items, loadItems }}>
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
