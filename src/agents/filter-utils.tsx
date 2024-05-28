import LoreNarrative from "../core/LoreNarrative";
import Narrative from "../core/Narrative";

export interface FilterCriteria {
    id: string; // Unique identifier for each filter
    type: 'show' | 'hide';
    criteria: 'all' | 'has tag' | 'not have tag' | 'has tag value';
    tag: string;
    value: string;
}

export function filterNarratives(narratives: Narrative[], filters: FilterCriteria[]): Narrative[] {
    const sortedNarratives = narratives.sort((a, b) => a.timeline - b.timeline);
    let filteredNarratives = sortedNarratives.filter(narrative => {
        for(let i = filters.length - 1; i >= 0; i--) {
            const filter = filters[i];
            if (filter.criteria === 'all') return filter.type === 'show';
            if (filter.criteria === 'has tag') {
                if (narrative.tags[filter.tag]) return filter.type === 'show';
            }
            if (filter.criteria === 'has tag value') {
                if (narrative.tags[filter.tag] && narrative.tags[filter.tag].includes(filter.value)) 
                    return filter.type === 'show';
            }
        }
        return true;
    });
    // filter out all the group that is not visible
    filteredNarratives = filteredNarratives.filter(narrative => !(narrative.isAGroup) || narrative.groupVisibility);
    // find all groups that is visible
    const visibleGroups = filteredNarratives.filter(narrative => narrative.isAGroup && narrative.groupVisibility);
    // filter out all the group child recursively
    filteredNarratives = filteredNarratives.filter(narrative => {
        for(let group of visibleGroups) {
            if(narrative.hasTag("group",group.id) && narrative.id != group.id) return false;
        }
        return true;
    });

    return filteredNarratives;
}

export function filterLore(narratives: LoreNarrative[], asOfTimeline: number): LoreNarrative[] {
    let tempNarratives = narratives.filter(x=>x.timeline <= asOfTimeline);
    let narrativeGroups: {[key: string]: LoreNarrative[]} = {};
    tempNarratives.forEach(x=>{
        let ln: LoreNarrative = x as LoreNarrative;
        let id = `${ln.loreType}-${ln.loreId}`;
        if(!narrativeGroups[id]) narrativeGroups[id] = [];
        narrativeGroups[id].push(ln);
    });
    tempNarratives = Object.values(narrativeGroups).map(x=>x.sort((a,b)=>b.timeline-a.timeline)[0]);
    return tempNarratives;
}