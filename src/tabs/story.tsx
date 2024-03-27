import React, { useEffect, useState } from 'react';
import { useNarrativeData } from '../contexts/NarrativeDataContext';
import ProseEditor from '../components/ProseEditor'; // Ensure correct import path
import ProseNarrative from '../core/ProseNarrative'; // Ensure correct import path

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

    const sortedProseNarratives = Object.values(narrativeData['prose'] || {}).sort((a, b) => a.timeline - b.timeline);

    return (
        <div>
            {sortedProseNarratives.map((narrative,i) => (
                <ProseEditor key={narrative.id} narrativeId={narrative.id} switchEditing={switchEditing} initialEditingState={i==editableBlockId?true:false}/>
            ))}
        </div>
    );
};

export default Story;
