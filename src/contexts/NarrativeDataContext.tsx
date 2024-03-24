import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import Narrative from '../core/Narrative';
import { db, NarrativeRaw } from '../utils/IndexedDbUtils'; // Ensure the correct path
import { useSettingsData } from './SettingsDataContext';
import narrativeFactory from '../core/NarrativeFactory';

type NarrativeDict = { [narrativeType: string]: { [narrativeId: string]: Narrative } }

interface NarrativeDataState {
  narrativeData: NarrativeDict;
  setNarrativeData: (data: NarrativeDict) => void;
}

const NarrativeDataContext = createContext<NarrativeDataState | undefined>(undefined);

interface SettingsDataProviderProps {
  children: ReactNode;
}

export const NarrativeDataProvider: React.FC<SettingsDataProviderProps> = ({ children }) => {
  
  const { saveSettingsData, settingsData, items, loadSettingsData } = useSettingsData();
  const [narrativeData, setNarrativeData] = useState<{ [narrativeType: string]: { [narrativeId: string]: Narrative } }>({});

  const handleSetNarrativeData = useCallback(async (data: NarrativeDict) => {

    setNarrativeData(data);
    const narrativeRaws: NarrativeRaw[] = [];

    // Save to IndexedDB
    Object.values(data).forEach(async (narratives) => {
      Object.values(narratives).forEach(async (narrative) => {
        const narrativeRaw: NarrativeRaw = {
          id: narrative.id,
          projectId: settingsData.projectId,
          narrativeType: narrative.narrativeType,
          timeline: narrative.timeline,
          rawData: narrative.serialize('default'),
        };
        narrativeRaws.push(narrativeRaw);
      })
    });
    

    await db.narrative.where('projectId').equals(settingsData.projectId).delete();
    await db.narrative.bulkAdd(narrativeRaws);
  }, [settingsData]);

  useEffect(() => {
    const loadData = async () => {
      let narratives: NarrativeRaw[] = [];
      try{
        narratives = await db.narrative.where('projectId').equals(settingsData.projectId).toArray();
        const loadedNarratives = narratives.map(n => narrativeFactory.create(n.narrativeType, n.id, n.timeline, n.rawData));
        const narrativeDict: NarrativeDict = {};
        loadedNarratives.forEach(narrative => {
          if (!narrativeDict[narrative.narrativeType]) {
            narrativeDict[narrative.narrativeType] = {};
          }
          narrativeDict[narrative.narrativeType][narrative.id] = narrative;
        });
        handleSetNarrativeData(narrativeDict);
      } catch (error) {
        console.error('Error loading narratives', error);
      }
    };
    
    loadData();
  }, [settingsData]);

  return (
    <NarrativeDataContext.Provider value={{ 
      narrativeData, 
      setNarrativeData: handleSetNarrativeData }}>
      {children}
    </NarrativeDataContext.Provider>
  );
};

export const useNarrativeData = () => {
  const context = useContext(NarrativeDataContext);
  if (context === undefined) {
    throw new Error('useSettingsData must be used within a SettingsDataProvider');
  }
  return context;
};
