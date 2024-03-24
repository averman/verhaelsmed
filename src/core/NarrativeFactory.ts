import Narrative from "./Narrative";

class NarrativeFactory {
    factories: {[narrativeType: string]: (id: string, timeline: number, text: string) => Narrative} = {};
    register(narrativeType: string, factory: (id: string, timeline: number, text: string) => Narrative) {
        this.factories[narrativeType] = factory;
    }
    create(narrativeType: string, id: string, timeline: number, text: string): Narrative {
        if (this.factories[narrativeType]) {
            return this.factories[narrativeType](id, timeline, text);
        }
        throw new Error("Unknown narrative type: " + narrativeType);
    }
}

const narrativeFactory = new NarrativeFactory();
export default narrativeFactory;