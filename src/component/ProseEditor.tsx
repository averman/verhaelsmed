// Filename: src/component/ProseEditor.tsx

import React, { useEffect, useRef, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { marked } from 'marked';
import { useNarrativeData } from '../contexts/NarrativeDataContext';
import ProseNarrative from '../core/ProseNarrative'
import Narrative from '../core/Narrative';

interface ProseEditorProps {
    narrativeId: string;
}

const ProseEditor: React.FC<ProseEditorProps> = ({ narrativeId }) => {
    const { narrativeData, setNarrativeData } = useNarrativeData();
    const [ narrative, setNarrative ] = useState<Narrative | undefined>(undefined);
    const [isEditing, setIsEditing] = useState(false);
    const editableContentRef = useRef<HTMLDivElement>(null);

    // Function to render markdown as HTML
    // Assuming renderMarkdown is a synchronous operation
    const renderMarkdown = (markdown: string): { __html: string } => {
        // Ensure that marked(markdown) is treated as returning a string.
        // This line directly uses marked to convert markdown to HTML string.
        const htmlString = marked(markdown, {async: false});
        if(htmlString instanceof Promise) throw "Do not enable async render"
        return { __html: htmlString };
    };

    useEffect(()=>{
        if(narrativeData && narrativeData["prose"]){
            setNarrative(narrativeData["prose"][narrativeId])
        }
    }, [narrativeData])

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    // Save changes or delete on empty content
        const handleBlur = () => {
            const newContent = editableContentRef.current?.innerText || '';
            if (newContent.trim() === '') {
                handleDelete()
            } else {
                handleEdit()
            }
            setIsEditing(false);
        };

    // Edit functionality
    const handleEdit = () => {
        // Example prompt for new content. In a real application, consider using a modal or a more sophisticated editor.
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
        }
    }

    return (
        <Card onDoubleClick={handleDoubleClick}>
            <CardContent>
                {isEditing ? (
                    <div
                        ref={editableContentRef} // Use the ref here
                        contentEditable
                        onBlur={handleBlur}
                        onInput={handleSplit}
                        dangerouslySetInnerHTML={{ __html: narrative?.getNormalizedText() || '' }}
                    ></div>
                ) : (
                    <Typography component="div">
                        <div dangerouslySetInnerHTML={renderMarkdown(narrative?.getNormalizedText() || '')}></div>
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default ProseEditor;
