// Filename: src/component/ProseEditor.tsx

import React, { useEffect, useRef, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { marked } from 'marked';
import { useNarrativeData } from '../contexts/NarrativeDataContext';
import ProseNarrative from '../core/ProseNarrative'
import Narrative from '../core/Narrative';
import { NarrativeItemsProps } from './SidebarFilter';

const ProseEditor: React.FC<NarrativeItemsProps> = ({ narrativeId, switchEditing, initialEditingState, 
    handleContextMenu, handleEditorSelect, isSelected }) => {
    const { narrativeData, setNarrativeData } = useNarrativeData();
    const [ narrative, setNarrative ] = useState<Narrative | undefined>(undefined);
    const [isEditing, setIsEditing] = useState(initialEditingState);
    const editableContentRef = useRef<HTMLDivElement>(null);

    const renderMarkdown = (markdown: string): { __html: string } => {
        const htmlString = marked(markdown, {async: false});
        if(htmlString instanceof Promise) throw "Do not enable async render"
        return { __html: htmlString };
    };

    useEffect(()=>{
        if(narrativeData && narrativeData["prose"]){
            setNarrative(narrativeData["prose"][narrativeId])
        }
    }, [narrativeData])

    useEffect(() => {
        if (isEditing && editableContentRef.current) {
            editableContentRef.current.focus();
            // Optionally, place the cursor at the end of the content
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(editableContentRef.current);
            range.setStart(editableContentRef.current, 0)
            range.setEnd(editableContentRef.current, 0)
            range.collapse(false);
            if(sel==null) return;
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }, [isEditing]);

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        const newContent = editableContentRef.current?.innerText || '';
        if (newContent.trim() === '') {
            handleDelete()
        } else {
            handleEdit()
        }
        setIsEditing(false);
    };

    const handleEdit = () => {
        let newContent = editableContentRef.current?.innerText || '';
        if (newContent !== null && newContent !== narrativeData['prose'][narrativeId].getNormalizedText()) {
            const narratives = narrativeData['prose'];
            const narrative = narratives[narrativeId] as ProseNarrative;
            narrative.text = newContent;
            setNarrativeData({ ...narrativeData, 'prose': {...narratives, [narrativeId]: narrative} });
        }
    };

    // Delete functionality
    const handleDelete = () => {
        const { [narrativeId]: deleted, ...remainingNarratives } = narrativeData['prose'];
        setNarrativeData({ ...narrativeData, 'prose': remainingNarratives });
    };

    const handleSplit = () => {
        let newContent = editableContentRef.current?.innerText || '';
        if (newContent !== null && newContent !== narrativeData['prose'][narrativeId].getNormalizedText()
        && newContent.indexOf('\n\n\n')>-1) {
            handleEdit();
            switchEditing(narrative?.id || '',true);
            setIsEditing(false);
        }
    }

    return (
        <Card onDoubleClick={handleDoubleClick} style={{ backgroundColor: isSelected ? '#f0f0f0' : '' }} onClick={(e) => {
            if (e.ctrlKey || e.metaKey) { // Check for Ctrl or Cmd key
                e.stopPropagation(); // Prevent event from reaching the document
                handleEditorSelect(narrativeId);
            }
        }}>
            <CardContent>
                {isEditing ? (
                    <div
                        ref={editableContentRef} // Use the ref here
                        contentEditable
                        onBlur={handleBlur}
                        onInput={handleSplit}
                        onContextMenu={e=>handleContextMenu(e,["test","tags"],narrativeId)}
                        dangerouslySetInnerHTML={{ __html: narrative?.getNormalizedText() || '' }}
                    ></div>
                ) : (
                    <Typography component="div">
                        <div dangerouslySetInnerHTML={renderMarkdown(narrative?.getNormalizedText() || '')}
                        onContextMenu={e=>handleContextMenu(e,["tags"],narrativeId)}></div>
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default ProseEditor;
