

export default abstract class Narrative {
    public timeline: number = 0;
    public id: string = "";

    // Tags
    tags: {[key: string]: string[]} = {};
    hasTag(tag: string, value?: string): boolean {
        if(!this.tags[tag]) return false;
        if(typeof value == "undefined") return true;
        return this.tags[tag].includes(value)
    }
    addTag(tag: string, value: string): void {
        if(!this.tags[tag]) this.tags[tag] = [];
        if(this.tags[tag].includes(value)) return;
        this.tags[tag].push(value)
    }
    removeTag(tag: string, value?: string): void {
        if(typeof value == "undefined") {
            delete this.tags[tag];
            return;
        }
        this.tags[tag] = this.tags[tag].filter(x=>x!=value);
    }
    setTags(tags: {[key: string]: string[]}): void {
        for (const key in tags) {
            if (tags.hasOwnProperty(key)) {
                const value = tags[key];
                if (Array.isArray(value) && Array.isArray(this.tags[key])) {
                    this.tags[key] = [...this.tags[key], ...value];
                } else if (Array.isArray(value) && !Array.isArray(this.tags[key])) {
                    this.tags[key] = Array.from(value);
                }
            }
        }
    }

    // Story
    summaryLevel: number = -1;
    abstract haveSummary(): boolean;
    abstract narrativeType: string;
    abstract getNormalizedText(targetTokenCount?: number): string;

    // Serde
    private serializers: {[format: string]: NarrativeSerializer} = {};
    addSerializer(format: string, serializer: NarrativeSerializer): void {
        this.serializers[format] = serializer;
    }
    serialize(format: string): string{
        if (format in this.serializers) return this.serializers[format].serialize(this);
        throw new Error("No serializer for format " + format);
    }
    deserialize(format: string, data: string): void {
        if (format in this.serializers) this.serializers[format].deserialize(data, this);
        else throw new Error("No serializer for format " + format);
    }

    // Grouping
    group: string = "";
    isAGroup: boolean = false;
    groupVisibility: boolean = false;

    abstract groupText(narratives: Narrative[]): string;
    
}

export type NarrativeDict = { [narrativeType: string]: { [narrativeId: string]: Narrative } }

export interface NarrativeSerializer {
    serialize(narrative: Narrative): string;
    deserialize(data: string, target: Narrative): void;
}

class DefaultSerializer implements NarrativeSerializer {
    // replacer function for JSON.stringify to exclude key serializer
    replacer(key: string, value: any): any {
        if(key == "serializers" || key == "relations") return undefined;
        return value;
    }
    serialize(narrative: Narrative): string {
        return JSON.stringify(narrative,this.replacer)
    }
    deserialize(data: string, target: Narrative): void {
        target = Object.assign(target, JSON.parse(data));
    }
}

export const defaultSerializer = new DefaultSerializer();

export interface NarrativeStore {
    getNarrative(id: string): Promise<Narrative>;
    saveNarrative(narrative: Narrative): Promise<void>;
    deleteNarrative(id: string): Promise<void>;
}

