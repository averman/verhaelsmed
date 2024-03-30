import { getCommonTags } from "../utils/CommonUtils";
import Narrative from "./Narrative";
import { NarrativeDict } from "./Narrative";

export type OnNarrativeChangeEvent = (narrative: Narrative, dict: NarrativeDict)=>void

function setTagRecursively(n: Narrative, narrativeDict: NarrativeDict, tag: string, value: string){
    n.addTag(tag, value);
    if(n.isAGroup){
        Object.values(narrativeDict[n.narrativeType]).filter(x=>x.group == n.id).forEach(x=>setTagRecursively(x, narrativeDict, tag, value));
    }
}
function removeTagsRecursively(n: Narrative, narrativeDict: NarrativeDict, tag: string, value: string){
    n.removeTag(tag, value);
    if(n.isAGroup){
        Object.values(narrativeDict[n.narrativeType]).filter(x=>x.group == n.id).forEach(x=>removeTagsRecursively(x, narrativeDict, tag, value));
    }
}

class NarrativeFactory {
    factories: {[narrativeType: string]: (id: string, timeline: number, text: string, format?: string) => Narrative} = {};
    eventHooks: {
        onChange: {[narrativeType: string]: OnNarrativeChangeEvent}
    } = {onChange: {}};
    register(narrativeType: string, factory: (id: string, timeline: number, text: string) => Narrative) {
        this.factories[narrativeType] = factory;
    }
    create(narrativeType: string, id: string, timeline: number, text: string, format: string = 'default'): Narrative {
        if (this.factories[narrativeType]) {
            return this.factories[narrativeType](id, timeline, text, format);
        }
        throw new Error("Unknown narrative type: " + narrativeType);
    }
    registerOnChange(narrativeType: string, event: OnNarrativeChangeEvent){
        this.eventHooks.onChange[narrativeType] = event;
    }
    onChange(narrative: Narrative, narrativeDict: NarrativeDict):void {
        if(this.eventHooks.onChange[narrative.narrativeType]) {
            this.eventHooks.onChange[narrative.narrativeType](narrative, narrativeDict);
        }
    }
    group(narratives: Narrative[], groupId: string, narrativeDict: NarrativeDict): void {
        // check all input narratives are of the same type
        if(narratives.length == 0) throw new Error("Cannot group zero narratives");
        const narrativeType = narratives[0].narrativeType;
        if(narrativeDict[narrativeType][groupId]) throw new Error("GroupId already exists");
        if(narratives.some(n=>n.narrativeType != narrativeType)) throw new Error("Cannot group narratives of different types");
        // check all input narratives are ungrouped
        if(narratives.some(n=>n.group && n.group.length>0)) throw new Error("Cannot group a grouped narrative");
        // create a new narrative for the group container
        narratives.sort((a,b)=>a.timeline-b.timeline);
        const group = this.create(narrativeType, groupId, Math.min(...narratives.map(x=>x.timeline)), narratives[0].groupText(narratives), "fromText");
        group.isAGroup = true;
        narratives.forEach(n=>{
            n.group = groupId;
        });
        group.setTags(getCommonTags(narratives.map(n=>n.tags)));
        setTagRecursively(group, narrativeDict, "group", groupId);
        narrativeDict[narrativeType][groupId] = group;
    }
    ungroup(narrative: Narrative, narrativeDict: NarrativeDict): void {
        if(!narrative.isAGroup) throw new Error("Cannot ungroup a non-grouped narrative");
        const groupId = narrative.id;
        const narratives = Object.values(narrativeDict[narrative.narrativeType]).filter(n=>n.group == groupId);
        removeTagsRecursively(narrative, narrativeDict, "group", groupId);
        narratives.forEach(n=>{
            n.group = "";
        });
        delete narrativeDict[narrative.narrativeType][groupId];
    }
    addToGroup(narrative: Narrative, groupId: string, narrativeDict: NarrativeDict): void {
        if(narrative.group && narrative.group.length>0) throw new Error("Cannot add a grouped narrative to a group");
        if(!narrativeDict[narrative.narrativeType][groupId]) throw new Error("Group does not exist");
        narrative.group = groupId;
        setTagRecursively(narrative, narrativeDict, "group", groupId);
    }
    removeFromGroup(narrative: Narrative, narrativeDict: NarrativeDict): void {
        if(!narrative.group || narrative.group.length==0) throw new Error("Cannot remove a non-grouped narrative from a group");
        const groupId = narrative.group;
        removeTagsRecursively(narrative, narrativeDict, "group", groupId);
        narrative.group = "";
        // if the group is empty, delete it
        if(Object.values(narrativeDict[narrative.narrativeType]).filter(n=>n.group == groupId).length == 0){
            delete narrativeDict[narrative.narrativeType][groupId];
        }
    }
}

const narrativeFactory = new NarrativeFactory();
export default narrativeFactory;