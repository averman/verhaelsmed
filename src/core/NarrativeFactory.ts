import Narrative from "./Narrative";
import { NarrativeDict } from "./Narrative";

export type OnNarrativeChangeEvent = (narrative: Narrative, dict: NarrativeDict)=>void

class NarrativeFactory {
    factories: {[narrativeType: string]: (id: string, timeline: number, text: string) => Narrative} = {};
    eventHooks: {
        onChange: {[narrativeType: string]: OnNarrativeChangeEvent}
    } = {onChange: {}};
    register(narrativeType: string, factory: (id: string, timeline: number, text: string) => Narrative) {
        this.factories[narrativeType] = factory;
    }
    create(narrativeType: string, id: string, timeline: number, text: string): Narrative {
        if (this.factories[narrativeType]) {
            return this.factories[narrativeType](id, timeline, text);
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
}

const narrativeFactory = new NarrativeFactory();
export default narrativeFactory;