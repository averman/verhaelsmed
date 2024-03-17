import { draftjsToMarkdown, markdownToDraftjs } from "../utils/ConversionUtils";
import Narrative from "./Narrative";

export default class ProseNarrative extends Narrative  {
    private text: string = "";
    getNormalizedText(): string { return this.text }
    private blockType: string = "unstyled";
    
    constructor(id: string, timestamp: number, text: string) {
        super();
        this.id = id;
        this.timestamp = timestamp;
        this.text = text;
        this.type = "prose";

        this.addSerializer("draftjs", {
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
                let blockData = JSON.parse(data);
                narrative.text = draftjsToMarkdown(blockData);
                narrative.id = blockData.key;
                narrative.blockType = blockData.type;
            }
        });
    }
}