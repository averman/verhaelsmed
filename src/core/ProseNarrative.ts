import { draftjsToMarkdown, markdownToDraftjs } from "../utils/ConversionUtils";
import { randomString } from "../utils/Random";
import Narrative, {NarrativeDict, defaultSerializer} from "./Narrative";
import narrativeFactory from "./NarrativeFactory";

const proseToDraftjsSerializer = {
    serialize: (narrative: ProseNarrative) => {
        let {cleanText, styleRanges} = markdownToDraftjs(narrative.text);
        let entityRanges: any[] = [];
        let entityData:any = {};
        for(let style of styleRanges) {
            if (style.style === "LINK") {
                entityData[entityRanges.length] = style.entity;
                entityRanges.push({
                    offset: style.offset,
                    length: style.length,
                    key: entityRanges.length
                });
            }
        }
        let blockData = {
            key: narrative.id,
            text: cleanText,
            type: narrative.blockType,
            depth: 0,
            inlineStyleRanges: styleRanges,
            entityRanges: entityRanges,
            data: entityData
        }
        return JSON.stringify(blockData);
    },
    deserialize: (data: string, narrative: ProseNarrative) => {
        console.log(data);
        let blockData = JSON.parse(data);
        console.log(blockData);
        narrative.text = draftjsToMarkdown(blockData);
        narrative.id = blockData.key;
        narrative.blockType = blockData.type;
    }
}

export default class ProseNarrative extends Narrative  {
    narrativeType: string = "prose";
    text: string = "";
    getNormalizedText(): string { return this.text }
    blockType: string = "unstyled";
    
    constructor(id: string, timeline: number, text: string, blockType?: string) {
        super();
        this.id = id;
        this.timeline = timeline;
        this.text = text;

        // this.addSerializer("draftjs", proseToDraftjsSerializer);
        this.addSerializer("default", defaultSerializer);
        // if(blockType) text = JSON.stringify({text, blockType});
        // this.deserialize("default", text);
    }
}

narrativeFactory.register(
    "prose", 
    (id: string, timeline: number, text: string) => {
        let res = new ProseNarrative(id, timeline, '')
        res.deserialize('default', text);
        return res
    }
);

narrativeFactory.registerOnChange(
    "prose",
    (narrative: Narrative, dict: NarrativeDict) => {
        if(!(narrative instanceof ProseNarrative)) return;
        if(narrative.getNormalizedText().indexOf("\n\n\n")==-1) return;
        let parts = narrative.getNormalizedText().split(/[\n]{3,}/)
        if(parts.length==0) return;
        delete dict["prose"][narrative.id];
        let a = Math.max(...Object.values(dict["prose"]).map(x=>x.timeline).filter(x=>x<narrative.timeline))
        let b = Math.min(...Object.values(dict["prose"]).map(x=>x.timeline).filter(x=>x>narrative.timeline))
        for(let i=0; i<parts.length; i++){
            let newId: string = "";
            let newTimeline: number = narrative.timeline;
            do{
                newId = "prose-" + randomString(6);
            } while (dict["prose"][newId]);
            if(b == Number.NEGATIVE_INFINITY) {
                newTimeline = newTimeline + i;
            } else if (a == Number.NEGATIVE_INFINITY) {
                newTimeline = newTimeline - i;
            } else {
                newTimeline = a + (b - a)/parts.length
            }
            let newNarrative = new ProseNarrative(newId, newTimeline, '');
            newNarrative = Object.assign(newNarrative, narrative);
            newNarrative.timeline = newTimeline;
            newNarrative.id = newId;
            newNarrative.text = parts[i];
            dict["prose"][newId] = newNarrative;
        }
    }
)