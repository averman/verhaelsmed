// Filename: src/component/ProseEditor.tsx

import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { marked } from 'marked';
import { useNarrativeData } from '../contexts/NarrativeDataContext';
import ProseNarrative from '../core/ProseNarrative'

interface ProseEditorProps {
    narrativeId: string;
}

const ProseEditor: React.FC<ProseEditorProps> = ({ narrativeId }) => {
    const { narrativeData, setNarrativeData } = useNarrativeData();

    // Function to render markdown as HTML
    // Assuming renderMarkdown is a synchronous operation
    const renderMarkdown = (markdown: string): { __html: string } => {
        // Ensure that marked(markdown) is treated as returning a string.
        // This line directly uses marked to convert markdown to HTML string.
        const htmlString = marked(markdown, {async: false});
        if(htmlString instanceof Promise) throw "Do not enable async render"
        return { __html: htmlString };
    };

    // Edit functionality
    const handleEdit = () => {
        // Example prompt for new content. In a real application, consider using a modal or a more sophisticated editor.
        const newContent = window.prompt('Edit content:', narrativeData['prose'][narrativeId].getNormalizedText());
        if (newContent !== null && newContent !== narrativeData['prose'][narrativeId].getNormalizedText()) {
            const narratives = narrativeData['prose'];
            const narrative = narratives[narrativeId] as ProseNarrative;
            narrative.text = newContent;
            setNarrativeData({ ...narrativeData, 'prose': {...narratives, [narrativeId]: narrative} });
        }
    };

    // Delete functionality
    const handleDelete = () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this narrative?');
        if (confirmDelete) {
            const { [narrativeId]: deleted, ...remainingNarratives } = narrativeData['prose'];
            setNarrativeData({ ...narrativeData, 'prose': remainingNarratives });
        }
    };

    return (
        <Card sx={{ borderRadius: '16px' }}>
            <CardContent>
                <Typography component="div" dangerouslySetInnerHTML={renderMarkdown((narrativeData['prose'][narrativeId] as ProseNarrative)?.text || '')} />
            </CardContent>
            <CardActions>
                <Button size="small" onClick={handleEdit}>Edit</Button>
                <Button size="small" onClick={handleDelete}>Delete</Button>
            </CardActions>
        </Card>
    );
};

export default ProseEditor;
