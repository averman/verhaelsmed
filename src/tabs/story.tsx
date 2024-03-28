import React, { useEffect, useState } from 'react';
import { useNarrativeData } from '../contexts/NarrativeDataContext';
import ProseEditor from '../components/ProseEditor'; // Ensure correct import path
import ProseNarrative from '../core/ProseNarrative'; // Ensure correct import path
import ContextMenu, { ContextMenuItem } from '../components/ContextMenu'
import { title } from 'process';

const Story: React.FC = () => {
    const { narrativeData, setNarrativeData } = useNarrativeData();
    const [editableBlockId, setEditableBlockId] = useState(-1);

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

    const getContextMenuItems = (items: string[]): ContextMenuItem[] => {
        const defaultItems = [
            {
                title: 'test',
                action: logSelection
            },
            {
                title: 'hello',
                action: ()=>console.log('hello', setContextMenu({...contextMenu, visible: false}))
            },
        ];

        return items.map(x=>defaultItems.filter(y=>y.title==x)[0]).filter(x=>x)
    }

    const handleContextMenu = (event: React.MouseEvent, items: string[]) => {
        event.preventDefault();
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

    return (
        <div>
            {sortedProseNarratives.map((narrative,i) => (
                <ProseEditor key={narrative.id} narrativeId={narrative.id} switchEditing={switchEditing} initialEditingState={i==editableBlockId?true:false}
                    handleContextMenu = {handleContextMenu}
                />
            ))}
            <ContextMenu
                mouseX={contextMenu.mouseX}
                mouseY={contextMenu.mouseY}
                visible={contextMenu.visible}
                menuItems={contextMenuItems}
            />

        </div>
    );
};

export default Story;
