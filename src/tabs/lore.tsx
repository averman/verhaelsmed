import React, { useEffect, useState } from 'react';
import { useSettingsData } from '../contexts/SettingsDataContext';
import { BorderedBox, Dropdown } from '../components/Deco';
import Button from '@mui/material/Button';
import ShallowObjectArray from '../components/ShallowObjectArray';
import { Agent } from '../models/SettingsDataModel';
import AgentLogWindow, { AgentLogs } from '../components/AgentLogs';
import { useRunAgent } from '../agents/agents-utils';
import { useMiscLocalContext } from '../contexts/MixedLocalContext';
import { useNarrativeData } from '../contexts/NarrativeDataContext';
import LoreNarrative from '../core/LoreNarrative';

const LoreTab: React.FC = () => {
    const { settingsData } = useSettingsData();
    const { narrativeData, setNarrativeData } = useNarrativeData();
    const { logs, setLogs, createNewLog } = useMiscLocalContext();
    const [ lore, setLore] = useState<LoreNarrative[]>([]);
    
    useEffect(() => {
        if (narrativeData) {

        }
    }, [narrativeData]);
   
    return <>
    </>
}

export default LoreTab;