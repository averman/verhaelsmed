import { draftjsToMarkdown, markdownToDraftjs } from "../utils/ConversionUtils";
import Narrative from "./Narrative";
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

const defaultSerializer = {
    serialize: (narrative: ProseNarrative) => {
        return narrative.text;
    },
    deserialize: (data: string, narrative: ProseNarrative) => {
        narrative.text = data;
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

        this.addSerializer("draftjs", proseToDraftjsSerializer);
        this.addSerializer("default", defaultSerializer);
        // if(blockType) text = JSON.stringify({text, blockType});
        // this.deserialize("default", text);
    }
}

narrativeFactory.register(
    "prose", 
    (id: string, timeline: number, text: string) => new ProseNarrative(id, timeline, text)
);