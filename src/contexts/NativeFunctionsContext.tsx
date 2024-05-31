import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNarrativeData } from './NarrativeDataContext';
import ProseNarrative from '../core/ProseNarrative';
import { useSettingsData } from './SettingsDataContext';
import { filterNarratives } from '../agents/filter-utils';
import { db } from '../utils/IndexedDbUtils';
import LoreNarrative from '../core/LoreNarrative';
import { randomString } from '../utils/Random';
import LoreTypes from '../hardcoded-settings/LoreTypes';

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

        createLore: (params) => {
            let values:any = {};
            try {
                values = JSON.parse(params[0]);
            }catch(e) {
                return 'Invalid JSON string for param 0';
            }
            let loreType = params[1];
            let timeline = parseFloat(params[2]);
            if (!loreType || Number.isNaN(timeline)) return 'Invalid parameters';
            let newId = 'lore-'+randomString(8);
            if(narrativeData['lore']){
                while(newId in narrativeData['lore']) newId = 'lore-'+randomString(8);
            } else narrativeData['lore'] = {}
            let newLore = new LoreNarrative(newId, timeline, loreType);
            let loreId: string;
            if(loreType in LoreTypes && typeof LoreTypes[loreType].idFrom == 'string') {
                loreId = values[LoreTypes[loreType].idFrom as string];
            } else loreId = params[3];
            newLore.loreId = loreId;
            newLore.items = values;
            // get latest existing lore with the same loreId
            let existingLore = Object.values(narrativeData['lore']).filter(
                x=>(x as LoreNarrative).loreType == loreType && (x as LoreNarrative).loreId == loreId)
                .sort((a,b)=>b.timeline-a.timeline)[0];
            if(existingLore) {
                newLore.items = {...(existingLore as LoreNarrative).items, ...newLore.items};
                newLore.rawCondition = (existingLore as LoreNarrative).rawCondition;
                newLore.condition = new Function('inputs', newLore.rawCondition) as (inputs: any) => string[];
            }
            narrativeData['lore'][newId] = newLore;
            setNarrativeData({...narrativeData});
            return 'params created successfully';
        }
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

