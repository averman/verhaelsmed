export default abstract class Narrative {
    public timestamp: number = 0;

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
    private relations: {[key: string]: Narrative[]} = {};
}

