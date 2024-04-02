import { draftjsToMarkdown, markdownToDraftjs } from "../utils/ConversionUtils";
import { randomString } from "../utils/Random";
import Narrative, {NarrativeDict, defaultSerializer} from "./Narrative";
import narrativeFactory from "./NarrativeFactory";

export default class ProseNarrative extends Narrative  {
    narrativeType: string = "prose";
    private text: string = "";
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
    
    constructor(id: string, timeline: number, text: string, blockType?: string) {
        super();
        this.id = id;
        this.timeline = timeline;
        this.text = text;
        this.addSerializer("default", defaultSerializer);
    }

    haveSummary(): boolean {
        return typeof this.summaries[this.summaryLevel+1] !== "undefined";
    }

    groupText(narratives: Narrative[]): string {
        return narratives.map(n=>n.getNormalizedText()).join("\n\n\n");
    }
}

narrativeFactory.register(
    "prose", 
    (id: string, timeline: number, text: string, format: string='default') => {
        let res = new ProseNarrative(id, timeline, '')
        if(format == 'default') res.deserialize('default', text);
        else if (format == 'fromText') res.setNormalizedText(text);
        else throw `[ProseNarrative] ERROR: unknown Factory Format: ${format}`
        return res
    }
);

function deepCopy(target: ProseNarrative, source: ProseNarrative): void {
    Object.assign(target, source);
    // deep copy tags
    target.tags = {};
    for (let key in source.tags) {
        target.tags[key] = Array.from(source.tags[key]);
    }
    // delete summaries
    target.summaries = [];
    target.summaryLevel = -1;
}

narrativeFactory.registerOnChange(
    "prose",
    (narrative: Narrative, dict: NarrativeDict) => {
        if(!(narrative.narrativeType === "prose")) return;
        if(narrative.isAGroup) return; //do not split a group
        if(narrative.getNormalizedText().indexOf("\n\n\n")==-1) return;
        let parts = narrative.getNormalizedText().split(/[\n]{3,}/)
        if(parts.length==0) return;
        delete dict["prose"][narrative.id];
        let a = Math.max(...Object.values(dict["prose"]).map(x=>x.timeline).filter(x=>x<narrative.timeline))
        let b = Math.min(...Object.values(dict["prose"]).map(x=>x.timeline).filter(x=>x>narrative.timeline))
        for(let i=0; i<parts.length; i++){
            let newId: string = narrative.id;
            let newTimeline: number = narrative.timeline;
            if(i!=0)
                do{
                    newId = "prose-" + randomString(6);
                } while (dict["prose"][newId]);
            if(b == Number.POSITIVE_INFINITY) {
                newTimeline = newTimeline + i;
            } else if (a == Number.NEGATIVE_INFINITY) {
                newTimeline = newTimeline - parts.length + i + 1;
            } else {
                newTimeline = a + (i+1)*((b - a)/(parts.length+2))
            }
            let newNarrative = new ProseNarrative(newId, newTimeline, '');
            deepCopy(newNarrative, narrative as ProseNarrative);

            newNarrative.timeline = newTimeline;
            newNarrative.id = newId;
            newNarrative.setNormalizedText(parts[i]);
            dict["prose"][newId] = newNarrative;
        }
    }
)