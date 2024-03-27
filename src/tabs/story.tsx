import React, { useEffect } from 'react';
import { useNarrativeData } from '../contexts/NarrativeDataContext';
import ProseEditor from '../components/ProseEditor'; // Ensure correct import path
import ProseNarrative from '../core/ProseNarrative'; // Ensure correct import path

const Story: React.FC = () => {
    const { narrativeData, setNarrativeData } = useNarrativeData();

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

    const sortedProseNarratives = Object.values(narrativeData['prose'] || {}).sort((a, b) => a.timeline - b.timeline);

    return (
        <div>
            {sortedProseNarratives.map(narrative => (
                <ProseEditor key={narrative.id} narrativeId={narrative.id} />
            ))}
        </div>
    );
};

export default Story;
