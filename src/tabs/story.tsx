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
    const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; visible: boolean }>({ mouseX: 0, mouseY: 0, visible: false });
    const [selectedText, setSelectedText] = useState("");
    const [contextMenuItems, setContextMenuItems] = useState<ContextMenuItem[]>([]);
    const [tagModalOpen, setTagModalOpen] = useState(false);
    const [currentTags, setCurrentTags] = useState<{ [key: string]: string[] }>({});
    const [knownTags, setKnownTags] = useState<string[]>([]);
    const [narrativeId, setNarrativeId] = useState<string[] | string>("");


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
        ];
        return items.map(x=>defaultItems.filter(y=>y.title==x)[0]).filter(x=>x)
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
            // set new tag Object that is a key value pair that exist on all selected editors
            let newTags: {[key: string]: string[]} = {};
            // get all distinct keys from all selected editors
            let keys = selectedEditors.map(x=>Object.keys(narrativeData['prose'][x].tags)).reduce((acc, val) => acc.filter(x => val.includes(x)));
            // filter only keys that exist in all selected editors
            keys = keys.filter(x=>selectedEditors.map(y=>narrativeData['prose'][y].tags[x]).reduce((acc, val) => acc && val.length>0, true));
            for(let key of keys){
                // get all distinct values from all selected editors
                let values = selectedEditors.map(x=>narrativeData['prose'][x].tags[key]).reduce((acc, val) => acc.filter(x => val.includes(x)));
                // filter only values that exist in all selected editors
                values = values.filter(x=>selectedEditors.map(y=>narrativeData['prose'][y].tags[key]).reduce((acc, val) => acc && val.includes(x), true));
                for(let value of values){
                    if(newTags[key]){
                        newTags[key].push(value)
                    } else {
                        newTags[key] = [value]
                    }
                }
            }
            setCurrentTags(newTags);
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
                narrativeId={selectedEditors.length==0?narrativeId:selectedEditors}
            />
        </div>
    );
};

export default Story;
