import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNarrativeData } from './NarrativeDataContext';
import ProseNarrative from '../core/ProseNarrative';
import { useSettingsData } from './SettingsDataContext';
import { filterNarratives } from '../agents/filter-utils';
import { db } from '../utils/IndexedDbUtils';

// Define the type for NativeFunctions
export type NativeFunctions = {
    [key: string]: (params: string[]) => string | Promise<string>;
};

// Create the context with a default empty object
const NativeFunctionsContext = createContext<NativeFunctions>({});


interface NativeFunctionsProviderProps {
    children: ReactNode;
}

export const NativeFunctionsProvider: React.FC<NativeFunctionsProviderProps> = ({ children }) => {
    const { narrativeData, setNarrativeData } = useNarrativeData();
    const { settingsData, saveSettingsData } = useSettingsData();

    const nativeFunctions: NativeFunctions = {
        test: (params) => `Received parameters: ${params.join(', ')}`,

        getNarrativesBeforeTimelineOfId: async (params) => {
            if(!params[0]) {
                console.error('narrativeId not provided as parameter[0]');
                return '';
            }
            let narrative = narrativeData['prose'][params[0]] as ProseNarrative;
            let maxTimeline = narrative.timeline;
            if(Number.isNaN(maxTimeline)) {
                console.error('Invalid timeline value');
                return '';
            }

            const loadingFilters = await db.settingPersistance.get(['filters', settingsData?.projectId]);
            let filters = loadingFilters?.data || [];
            
            let filteredNarratives = Object.values(narrativeData['prose']).filter(n => n.timeline < maxTimeline);
            filteredNarratives.sort((a, b) => a.timeline - b.timeline);
            filteredNarratives = filterNarratives(filteredNarratives, filters);
            return filteredNarratives.map(n => n.getNormalizedText()).join('\n\n');
        },
        

        setNarrative: (params) => {
            let targetId = settingsData?.variables['narrative_target_id'];
            if (!targetId) return 'No target id found';
            let narrative = narrativeData['prose'][targetId] as ProseNarrative;
            narrative.setNormalizedText(params[0]);
            setNarrativeData({ ...narrativeData });
            return 'narrative set successfully';
        },
    };

    return (
        <NativeFunctionsContext.Provider value={nativeFunctions}>
            {children}
        </NativeFunctionsContext.Provider>
    );
};



export const useNativeFunctionsContext = () => {
    const context = useContext(NativeFunctionsContext);
    if (context === undefined) {
        throw new Error('useSettingsData must be used within a SettingsDataProvider');
    }
    return context;
};

