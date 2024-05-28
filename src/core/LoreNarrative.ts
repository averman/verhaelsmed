import { validateScript } from "../agents/script-utils";
import Narrative, { defaultSerializer } from "./Narrative";
import narrativeFactory from "./NarrativeFactory";
import LoreTypes from "../hardcoded-settings/LoreTypes";

class LoreNarrative extends Narrative {
    narrativeType: string = "lore";
    loreType: string = "story";
    loreId: string = "";
    rawCondition: string = 'return ["*"]';
    items: {[key: string]: string} = {};
    condition: (inputs: any) => string[] = (inputs: any) => [];
    getNormalizedText(input: any): string { 
        let conditionResult = this.condition(input);
        if(!conditionResult) conditionResult = [];
        let resolvedConditionResult: string[] = [];
        for(let key of conditionResult) {
            if(key.includes('*')) {
                Object.keys(this.items).forEach(x=>{
                    let regexMatch = new RegExp(key.replace('*', '.*')).test(x);
                    if(regexMatch) resolvedConditionResult.push(x);
                })
            } else resolvedConditionResult.push(key)
        }
        let sortedKeys = this.loreType in LoreTypes?LoreTypes[this.loreType].keys:[];
        let unsortedKeys = Object.keys(this.items).filter(x=>!sortedKeys.includes(x));
        let keys = [...sortedKeys, ...unsortedKeys];
        return keys.filter(x=>this.items[x] && this.items[x]!='' && resolvedConditionResult.includes(x))
            .map(key => `${key}: ${this.items[key]}`).join("\n");
    }
    summaries: string[] = [];
    
    constructor(id: string, timeline: number, loreType: string) {
        super();
        this.id = id;
        this.timeline = timeline;
        this.loreType = loreType;

        if(loreType in LoreTypes) {
            let keys: string[] = LoreTypes[loreType].keys;
            for(let key of keys) {
                this.items[key] = "";
            }
        }

        this.addSerializer("default", defaultSerializer);
    }

    haveSummary(): boolean {
        return typeof this.summaries[this.summaryLevel+1] !== "undefined";
    }

    groupText(narratives: Narrative[]): string {
        return narratives.map(n=>n.getNormalizedText()).join("\n\n");
    }
}

narrativeFactory.register("lore", (id: string, timeline: number, text: string, format: string='default') => {
    let res = new LoreNarrative(id, timeline, '')
    if(format == 'default') {
        res.deserialize('default', text);
        if(res.rawCondition){
            validateScript(res.rawCondition);
            res.condition = new Function('inputs', res.rawCondition) as (inputs: any) => [];
        }
    }
    else throw `[LoreNarrative] ERROR: unknown Factory Format: ${format}`
    return res
})

export default LoreNarrative;