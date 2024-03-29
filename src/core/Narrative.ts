

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
        this.tags[tag].push(value)
    }
    removeTag(tag: string, value?: string): void {
        console.log("removing tag", tag, value)
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
    abstract narrativeType: string;
    abstract getNormalizedText(): string;
    // abstract clone(): Narrative;

    // Relations
    private relations: {[relationType: string]: {[relationKey: string]: string[]}} = {};
    addRelation(relationType: string, relationKey: string, targetNarrative: string): void {
        if (!(relationType in this.relations)) this.relations[relationType] = {};
        if (!(relationKey in this.relations[relationType])) this.relations[relationType][relationKey] = [];
        this.relations[relationType][relationKey].push(targetNarrative);
    }
    removeRelation(relationType: string, relationKey: string, targetNarrative: string): void {
        if (relationType in this.relations && relationKey in this.relations[relationType]) {
            this.relations[relationType][relationKey] = this.relations[relationType][relationKey].filter((id) => id !== targetNarrative);
        }
    }
    async getRelatedNarratives( store: NarrativeStore, relationType: string, relationKey?: string): Promise<Narrative[]> {
        if (relationType in this.relations) {
            if (relationKey) {
                if (relationKey in this.relations[relationType]) {
                    return await Promise.all(this.relations[relationType][relationKey]
                        .map(async (id) => await store.getNarrative(id)));
                }
            } else {
                let result: Narrative[] = [];
                for (let key in this.relations[relationType]) {
                    result = result.concat(await Promise.all(this.relations[relationType][key]
                        .map(async (id) => await store.getNarrative(id))));
                }
                return result;
            }
        }
        return [];
    }

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
    
}

export type NarrativeDict = { [narrativeType: string]: { [narrativeId: string]: Narrative } }

export interface NarrativeSerializer {
    serialize(narrative: Narrative): string;
    deserialize(data: string, target: Narrative): void;
}

class DefaultSerializer implements NarrativeSerializer {
    // replacer function for JSON.stringify to exclude key serializer
    replacer(key: string, value: any): any {
        if(key == "serializers") return undefined;
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

