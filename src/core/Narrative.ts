export default abstract class Narrative {
    public timestamp: number = 0;
    public id: string = "";

    // Tags
    private tags: {[key: string]: string} = {};
    hasTag(tag: string, value?: string): boolean {return value ? this.tags[tag] === value : tag in this.tags;}
    setTag(tag: string, value: string): void {this.tags[tag] = value;}
    removeTag(tag: string): void {delete this.tags[tag];}
    setTags(tags: {[key: string]: string}): void {this.tags = Object.assign(this.tags, tags);}

    // Story
    public type: string = "unknown";
    abstract getNormalizedText(): string;

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

export interface NarrativeSerializer {
    serialize(narrative: Narrative): string;
    deserialize(data: string, target: Narrative): void;
}

export interface NarrativeStore {
    getNarrative(id: string): Promise<Narrative>;
    saveNarrative(narrative: Narrative): Promise<void>;
    deleteNarrative(id: string): Promise<void>;
}

