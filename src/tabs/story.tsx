import React, { useEffect, useState } from 'react';
import { useNarrativeData } from '../contexts/NarrativeDataContext';
import ProseEditor from '../components/ProseEditor'; 
import ProseNarrative from '../core/ProseNarrative'; 
import ContextMenu, { ContextMenuItem } from '../components/ContextMenu'
import TaggingModal from '../components/TaggingModal'; 

const Story: React.FC = () => {
    const { narrativeData, setNarrativeData } = useNarrativeData();
    const [editableBlockId, setEditableBlockId] = useState(-1);
    const [selectedEditors, setSelectedEditors] = useState<string[]>([]);

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

    const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; visible: boolean }>({ mouseX: 0, mouseY: 0, visible: false });
    const [selectedText, setSelectedText] = useState("");
    const [contextMenuItems, setContextMenuItems] = useState<ContextMenuItem[]>([]);
    const [tagModalOpen, setTagModalOpen] = useState(false);
    const [currentTags, setCurrentTags] = useState<{ [key: string]: string[] }>({});
    const [knownTags, setKnownTags] = useState<string[]>([]);
    const [narrativeId, setNarrativeId] = useState("");



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
        ];

        return items.map(x=>defaultItems.filter(y=>y.title==x)[0]).filter(x=>x)
    }

    const closeContextMenu = () => {
        setContextMenu({ mouseX: 0, mouseY: 0, visible: false });
    };

    const handleContextMenu = (event: React.MouseEvent, items: string[], narrativeId: string) => {
        event.preventDefault();
        const narrativeTags = narrativeData['prose'][narrativeId]?.tags || {};
        setCurrentTags(narrativeTags);
        setNarrativeId(narrativeId);
        setContextMenu({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            visible: true,
        });
        if(items.indexOf('test')>-1){
            const selection = window.getSelection()?.toString() || '';
            setSelectedText(selection); // Store the selection
        }
        setContextMenuItems(getContextMenuItems(items))
    };

    const logSelection = () => {
        console.log(selectedText);
        setContextMenu({ ...contextMenu, visible: false });
    };

    const sortedProseNarratives = Object.values(narrativeData['prose'] || {}).sort((a, b) => a.timeline - b.timeline);

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


    const applyTagChanges = (narrativeId: string, newTags: { [key: string]: string[] }) => {
        if (narrativeId) {
            const narratives = narrativeData['prose'];
            const narrative = narratives[narrativeId] as ProseNarrative;
            narrative.tags = newTags;
            setNarrativeData({ ...narrativeData, 'prose': {...narratives, [narrativeId]: narrative} });
        }
    };
    



    return (
        <div>
            {sortedProseNarratives.map((narrative,i) => (
                <ProseEditor key={narrative.id} 
                    narrativeId={narrative.id} 
                    switchEditing={switchEditing} 
                    initialEditingState={i==editableBlockId?true:false}
                    handleContextMenu = {handleContextMenu}
                    handleEditorSelect={handleEditorSelect}
                    isSelected={selectedEditors.includes(narrative.id)}
                />
            ))}
            <ContextMenu
                mouseX={contextMenu.mouseX}
                mouseY={contextMenu.mouseY}
                visible={contextMenu.visible}
                menuItems={contextMenuItems}
            />
            <TaggingModal
                open={tagModalOpen}
                handleClose={() => setTagModalOpen(false)}
                tagsProp={currentTags}
                knownTags={knownTags}
                applyChanges={applyTagChanges}
                narrativeId={narrativeId}
            />
        </div>
    );
};

export default Story;
