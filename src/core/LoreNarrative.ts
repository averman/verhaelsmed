import { validateScript } from "../agents/script-utils";
import Narrative from "./Narrative";
import narrativeFactory from "./NarrativeFactory";

class LoreNarrative extends Narrative {
    narrativeType: string = "lore";
    private text: string = "";
    loreType: string = "story";
    loreId: string = "";
    rawCondition: string = "true";
    condition: (inputs: any) => boolean = (inputs: any) => true;
    setNormalizedText(text: string): void {
        if(this.summaryLevel == -1) this.text = text;
        else this.summaries[this.summaryLevel] = text;
    }
    getNormalizedText(): string { 
        while((typeof this.summaries[this.summaryLevel] == 'undefined') && this.summaryLevel >= 0){
            this.summaryLevel--;
        }
        if(this.summaryLevel >= 0) return this.summaries[this.summaryLevel];
        return this.text 
    }
    summaries: string[] = [];
    
    constructor(id: string, timeline: number, text: string) {
        super();
        this.id = id;
        this.timeline = timeline;
        this.text = text;
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
            res.condition = new Function('inputs', res.rawCondition) as (inputs: any) => boolean;
        }
    }
    else throw `[LoreNarrative] ERROR: unknown Factory Format: ${format}`
    return res
})

export default LoreNarrative;