import React, { ReactElement, useEffect, useState } from 'react';
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
import SidebarFilter from '../components/SidebarFilter';
import Narrative from '../core/Narrative';
import { filterNarratives } from '../agents/filter-utils';
import LoreEditor from '../components/LoreEditor';
import ContextMenu, { ContextMenuItem } from '../components/ContextMenu';
import { randomString } from '../utils/Random';
import LoadModal from '../components/LoadModal';
import LoreTypes from '../hardcoded-settings/LoreTypes';

const LoreTab: React.FC = () => {
    const { settingsData } = useSettingsData();
    const { narrativeData, setNarrativeData } = useNarrativeData();
    const { logs, setLogs, createNewLog } = useMiscLocalContext();
    const [ lore, setLore] = useState<LoreNarrative[]>([]);
    // const [ narratives, setNarratives ] = useState<Narrative[]>([]);
    const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; visible: boolean }>
        ({ mouseX: 0, mouseY: 0, visible: false });
    const [narrativeId, setNarrativeId] = useState<string>("");
    const [contextMenuItems, setContextMenuItems] = useState<ContextMenuItem[]>([]);
    const [loadModalItems, setLoadModalItems] = useState<{name: string, id: string, description: string}[]>(
        Object.keys(LoreTypes).map(x=>({name: x, id: x, description: LoreTypes[x].description}))
    );
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [currentTimeline, setCurrentTimeline] = useState<number>(0);
    
    useEffect(() => {
        if (narrativeData && narrativeData["lore"]) {
            let narratives = Object.values(narrativeData["lore"]);
            let filteredNarratives = filterNarratives(narratives, []);
            setLore(filteredNarratives as LoreNarrative[]);
        }
    }, [narrativeData]);

    useEffect(() => {
        // Only add the event listener if the context menu is visible
        if (contextMenu.visible) {
            const handleOutsideClick = (event: MouseEvent) => {
                // Convert the event target to a Node for TypeScript compatibility
                const target = event.target as Node;
                // Use a more specific selector for your context menu if needed
                const contextMenuElement = document.querySelector("#context-menu");
                if (contextMenuElement && !contextMenuElement.contains(target)) {
                    closeContextMenu();
                }
            };

            document.addEventListener('click', handleOutsideClick);
            // Clean up the event listener
            return () => {
                document.removeEventListener('click', handleOutsideClick);
            };
        }
    }, [contextMenu.visible]); // Depend on the visibility of the context menu

    const closeContextMenu = () => {
        setContextMenu({ mouseX: 0, mouseY: 0, visible: false });
    };

    const handleContextMenu = (event: React.MouseEvent, items: string[], narrativeId: string) => {
        event.preventDefault();
        setNarrativeId(narrativeId);
        setContextMenu({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            visible: true,
        });
        setContextMenuItems(getContextMenuItems(items))
        
    };

    const handleCreateNewLore = (loreType: string) => {
        let newId = randomString(8);
        while (narrativeData.lore && narrativeData.lore[newId]) {
            newId = "lore-" + randomString(8);
        }
        
        let newNarrative = new LoreNarrative(newId, 0, loreType);

        if(!narrativeData.lore) narrativeData.lore = {};
        narrativeData.lore[newId] = newNarrative;
        setNarrativeData({...narrativeData});
    }

    const rightBar = (
        <Button sx={{width: '90%', left: '5%'}} 
            variant="outlined" onClick={() => setIsModalOpen(true)}
        >
            Create New Lore
        </Button>)

    const getContextMenuItems = (items: string[]): ContextMenuItem[] => {
        const defaultItems = [
            {
                title: 'delete',
                filter: ()=>true,
                action:  (e: any, targetId: string | string[])=>{
                    if(targetId){
                        if(Array.isArray(targetId)){
                        } else {
                            let idToDelete = targetId;
                            delete narrativeData.lore[idToDelete];
                            setNarrativeData({...narrativeData});
                        }
                    }
                    closeContextMenu();
                }
            },
            {
                title: 'new snapshot',
                filter: ()=>true,
                action:  (e: any, targetId: string | string[])=>{
                    if(targetId){
                        if(Array.isArray(targetId)){
                        } else {
                            let idToDuplicate = targetId;
                            let newId = randomString(8);
                            let newLore = new LoreNarrative(newId, currentTimeline || narrativeData.lore[idToDuplicate].timeline + 1, 
                                (narrativeData.lore[idToDuplicate] as LoreNarrative).loreType);
                            newLore.items = {...(narrativeData.lore[idToDuplicate] as LoreNarrative).items};
                            newLore.rawCondition = (narrativeData.lore[idToDuplicate] as LoreNarrative).rawCondition;
                            newLore.condition = new Function('inputs', newLore.rawCondition) as (inputs: any) => [];
                            narrativeData.lore[newId] = newLore;
                            setNarrativeData({...narrativeData});
                        }
                    }
                    closeContextMenu();
                }
            },
        ]
        return items.map(x=>defaultItems.filter(y=>y.title==x)[0]).filter(x=>x).filter(x=>!x.filter || x.filter());
    }
   
    return <>
        <SidebarFilter 
            projectId={settingsData.projectId}
            narratives={lore}
            component={LoreEditor}
            handleContextMenu={handleContextMenu}
            filterId='loreFilters'
            rightBarComponent={rightBar}
            
            switchEditing={() => {}}
            editableBlockId={0}
            handleEditorSelect={() => {}}
            isSelected={() => false}
        />
        <ContextMenu
            mouseX={contextMenu.mouseX}
            mouseY={contextMenu.mouseY}
            visible={contextMenu.visible}
            menuItems={contextMenuItems}
            targetId={narrativeId}
        />
        <LoadModal 
            items={loadModalItems}
            open={isModalOpen}
            onClose={()=>setIsModalOpen(false)}
            onSuccess={(id)=>{handleCreateNewLore(id)}}
            selectionTitle='Lore Type'
        />
    </>
}

export default LoreTab;