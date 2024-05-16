import React, { useEffect, useState } from 'react';
import { useNarrativeData } from '../contexts/NarrativeDataContext';
import ProseEditor from '../components/ProseEditor'; 
import ProseNarrative from '../core/ProseNarrative'; 
import ContextMenu, { ContextMenuItem } from '../components/ContextMenu'
import TaggingModal from '../components/TaggingModal'; 
import SidebarFilter from '../components/SidebarFilter';
import { useSettingsData } from '../contexts/SettingsDataContext';
import narrativeFactory from '../core/NarrativeFactory';
import { randomString } from '../utils/Random';
import { getCommonTags } from '../utils/CommonUtils';
import ButtonSelectModal from '../components/ButtonSelectModal';
import { useRunAgent } from '../agents/agents-utils';
import { AgentLogs } from '../components/AgentLogs';
import LoadModal from '../components/LoadModal';

const Story: React.FC = () => {
    const { narrativeData, setNarrativeData } = useNarrativeData();
    const { settingsData, saveSettingsData } = useSettingsData();
    const [editableBlockId, setEditableBlockId] = useState(-1);
    const [selectedEditors, setSelectedEditors] = useState<string[]>([]);
    const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; visible: boolean }>({ mouseX: 0, mouseY: 0, visible: false });
    const [selectedText, setSelectedText] = useState("");
    const [contextMenuItems, setContextMenuItems] = useState<ContextMenuItem[]>([]);
    const [tagModalOpen, setTagModalOpen] = useState(false);
    const [currentTags, setCurrentTags] = useState<{ [key: string]: string[] }>({});
    const [knownTags, setKnownTags] = useState<string[]>([]);
    const [narrativeId, setNarrativeId] = useState<string[] | string>("");
    const [targetNarrative, setTargetNarrative] = useState<ProseNarrative | undefined>(undefined);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [generateOpen, setGenerateOpen] = useState(false);
  
    const handleSummaryOpen = () => setSummaryOpen(true);
    const handleSummaryClose = () => setSummaryOpen(false);
    const handleGenerateOpen = () => setGenerateOpen(true);
    const handleGenerateClose = () => setGenerateOpen(false);
    const handleContextMenuClose = () => setContextMenu({ mouseX: 0, mouseY: 0, visible: false });
    const runAgent = useRunAgent();
  
    const buttons = [
      { title: 'Blank', isVisible: () => true, onClick: (e: React.MouseEvent, target: any, title: string) => {
        let targetId = target.toString();
        let narrative = narrativeData['prose'][targetId] as ProseNarrative;
        narrative.summaryLevel++;
        narrative.summaries[narrative.summaryLevel] = '';
        setNarrativeData({...narrativeData});
        handleSummaryClose();
      } },
      { title: 'Full Content', isVisible: () => true, onClick: (e: React.MouseEvent, target: any, title: string) => {
        let targetId = target.toString();
        let narrative = narrativeData['prose'][targetId] as ProseNarrative;
        let text = narrative.getNormalizedText();
        narrative.summaryLevel++;
        narrative.summaries[narrative.summaryLevel] = text;
        setNarrativeData({...narrativeData});
        handleSummaryClose();
      } },
      { title: 'Auto Generate', isVisible: () => true, onClick: async(e: React.MouseEvent, target: any, title: string) => {
        let targetId = target.toString();
        let narrative = narrativeData['prose'][targetId] as ProseNarrative;
        let text = narrative.getNormalizedText();
        narrative.summaryLevel++;
        settingsData.variables["narrative_target_id"] = targetId;
        saveSettingsData(settingsData);
        let agent = settingsData?.agents?.find(x=>['summarize', 'summarizer', 'summary'].find(y=>x.agentType==y));
        if(!agent) {
            narrative.summaries[narrative.summaryLevel] = 'error in generating summary, no summarizer agent found';
            handleSummaryClose();
            return;
        }
        narrative.summaries[narrative.summaryLevel] = 'generating summary...';
        setNarrativeData({...narrativeData});
        runAgent(agent, [{key: "body", value: text}], new AgentLogs());
        handleSummaryClose();
      } }
    ];


    useEffect(() => {
        // Automatically add a blank ProseNarrative if none exist
        if (!narrativeData['prose'] || Object.keys(narrativeData['prose']).length === 0) {
            const blankNarrative = new ProseNarrative('initial',1,'');
            setNarrativeData({
                ...narrativeData,
                'prose': { [blankNarrative.id]: blankNarrative },
            });
        }
    }, [narrativeData, setNarrativeData]);

    const switchEditing = (id: string, next: boolean = true): void => {
        const narratives = Object.values(narrativeData['prose']);
        narratives.sort((a,b)=>a.timeline - b.timeline);
        let idx = narratives.map(x=>x.id).indexOf(id);
        if(idx<narratives.length-1 && next) {
            setEditableBlockId(idx+1);
        } else if (idx>0 && !next) {
            setEditableBlockId(idx-1)
        }
    }


    const getContextMenuItems = (items: string[]): ContextMenuItem[] => {
        const defaultItems = [
            {
                title: 'test',
                action: logSelection
            },
            {
                title: 'tags',
                action: ()=>setTagModalOpen(true)
            },
            {
                title: 'group',
                action: (e: any, targetId: string | string[])=>{
                    // make new ID that is unique
                    let narrativeId = "prose-group-"+randomString(6);
                    while(narrativeData['prose'][narrativeId]){
                        narrativeId = "prose-group-"+randomString(6);
                    }
                    narrativeFactory.group(selectedEditors.map(x=>narrativeData['prose'][x]), narrativeId, narrativeData)
                    setNarrativeData({...narrativeData});
                    handleSummaryClose();
                }
            },
            {
                title: 'ungroup',
                action: (e: any, targetId: string | string[])=>{
                    if(Array.isArray(targetId)) return;
                    narrativeFactory.ungroup(narrativeData['prose'][targetId], narrativeData)
                    setNarrativeData({...narrativeData});
                    handleContextMenuClose();
                }
            },
            {
                title: 'delete',
                action: (e: any, targetId: string | string[])=>{
                    let toBeDeleted = []
                    if(Array.isArray(targetId)) toBeDeleted = targetId;
                    else toBeDeleted = [targetId];
                    toBeDeleted.forEach(x=>delete narrativeData['prose'][x]);
                    setNarrativeData({...narrativeData});
                    handleContextMenuClose();
                }
            },
            {
                title: 'remove from group',
                filter: ()=>selectedEditors.length==0,
                action: (e: any, targetId: string | string[])=>{
                    if(Array.isArray(targetId)) return;
                    narrativeFactory.removeFromGroup(narrativeData['prose'][targetId], narrativeData)
                    setNarrativeData({...narrativeData});
                    handleContextMenuClose();
                }
            },
            {
                title: 'create summary',
                filter: ()=>selectedEditors.length==0,
                action: (e: any, targetId: string | string[])=>{
                    if(Array.isArray(targetId)) return;
                    // invoke create summary window modal with parameter targetId passed
                    handleContextMenuClose()
                    handleSummaryOpen();
                }
            },
            {
                title: 'generate text',
                filter: ()=>selectedEditors.length==0,
                action: (e: any, targetId: string | string[])=>{
                    if(Array.isArray(targetId)) return;
                    handleContextMenuClose();
                    settingsData.variables["narrative_target_id"] = targetId;
                    let narrative = narrativeData['prose'][targetId] as ProseNarrative;
                    // let text = narrative.getNormalizedText();
                    // settingsData.variables["generatedInput"] = text;
                    setTargetNarrative(narrative);
                    handleGenerateOpen();
                }
            }
        ];
        return items.map(x=>defaultItems.filter(y=>y.title==x)[0]).filter(x=>x).filter(x=>!x.filter || x.filter());
    }

    const closeContextMenu = () => {
        setContextMenu({ mouseX: 0, mouseY: 0, visible: false });
    };

    const handleContextMenu = (event: React.MouseEvent, items: string[], narrativeId: string) => {
        event.preventDefault();
        const narrativeTags = narrativeData['prose'][narrativeId]?.tags || {};
        if(selectedEditors.length==0){
            setNarrativeId(narrativeId);
            setCurrentTags(narrativeTags);
        } else {
            setCurrentTags(getCommonTags(selectedEditors.map(x=>narrativeData['prose'][x].tags)));
        }

        if(selectedEditors.length==0 || selectedEditors.includes(narrativeId)){
            setContextMenu({
                mouseX: event.clientX - 2,
                mouseY: event.clientY - 4,
                visible: true,
            });
        }

        setContextMenuItems(getContextMenuItems(items))
        if(items.indexOf('test')>-1){
            const selection = window.getSelection()?.toString() || '';
            setSelectedText(selection); // Store the selection
        }
    };

    const logSelection = () => {
        console.log(selectedText);
        setContextMenu({ ...contextMenu, visible: false });
    };

    const handleEditorSelect = (id: string) => {
        setSelectedEditors(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id); // Deselect if already selected
            } else {
                return [...prev, id]; // Add to selection
            }
        });
    };

    useEffect(() => {
        if(selectedEditors.length>0){
            setNarrativeId(selectedEditors)
        } 
    }, [selectedEditors]);

    useEffect(() => {
        const handleDocumentClick = (e: MouseEvent) => {
            if (!e.ctrlKey && !e.metaKey) { // Check for Ctrl or Cmd key
                setSelectedEditors([]);
            }
        };
    
        document.addEventListener('click', handleDocumentClick);
    
        return () => document.removeEventListener('click', handleDocumentClick);
    }, []);

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


    const applyTagChanges = (narrativeId: string | string[], newTags: { [key: string]: string[] }) => {
        if (narrativeId) {
            const narratives = { ...narrativeData['prose'] }; // Create a shallow copy of narratives
    
            if (!Array.isArray(narrativeId)) {
                narrativeId = [narrativeId]; // Convert to array for unified processing
            }
    
            narrativeId.forEach(id => {
                const narrative = narratives[id]; // Assuming narrative is already of type ProseNarrative
                // Remove current tags
                Object.entries(currentTags).forEach(([key, value]) => {
                    value.forEach(v => {
                        narrative.removeTag(key, v); // Assuming removeTag method exists
                    });
                });
                // Add new tags
                Object.entries(newTags).forEach(([key, value]) => {
                    value.forEach(v => {
                        narrative.addTag(key, v); // Assuming addTag method exists
                    });
                });
                narratives[id] = narrative; // Update the narrative in the copy
            });
    
            // Update the state once with all modifications
            setNarrativeData({ ...narrativeData, 'prose': narratives });
        }
    };
    
    const handleGenerate = async (agentId: string): Promise<void> => {
        let agent = settingsData?.agents?.find(x=>x.agentName==agentId);
        if(!agent) return;
        let narrative = targetNarrative;
        runAgent(agent, [{key: "body", value: narrative?.getNormalizedText() || ""}], new AgentLogs());
        handleGenerateClose();
    }



    return (
        <div>
            <SidebarFilter 
                projectId={settingsData.projectId}
                narratives={Object.values(narrativeData['prose'] || {})} 
                switchEditing={switchEditing} 
                editableBlockId={editableBlockId}
                handleContextMenu={handleContextMenu} 
                handleEditorSelect={handleEditorSelect} 
                isSelected={(id)=>selectedEditors.includes(id)}
                component={ProseEditor}
            />
            <ContextMenu
                mouseX={contextMenu.mouseX}
                mouseY={contextMenu.mouseY}
                visible={contextMenu.visible}
                menuItems={contextMenuItems}
                targetId={narrativeId}
            />
            <TaggingModal
                open={tagModalOpen}
                handleClose={() => setTagModalOpen(false)}
                tagsProp={currentTags}
                knownTags={knownTags}
                applyChanges={applyTagChanges}
                narrativeId={selectedEditors.length==0?narrativeId:selectedEditors}
            />
            <ButtonSelectModal
                isOpen={summaryOpen}
                onClose={handleSummaryClose}
                buttons={buttons}
                target={narrativeId}
            />
            <LoadModal
                open={generateOpen}
                onClose={handleGenerateClose}
                items={
                    settingsData?.agents?.filter(x=>['generate', 'generation', 'generator'].indexOf(x.agentType) > -1)
                    .map(x=>({name: x.agentName, id: x.agentName, description: x.description}))
                    || []
                }
                onSuccess={handleGenerate}
            />
        </div>
    );
};

export default Story;
