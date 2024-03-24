// src/db.ts
import Dexie from 'dexie';

export interface FormState {
  id: string;
  data: any;
  lastUpdatedTime: number; // Add a lastUpdatedTime field
}

export interface NarrativeRaw {
  id: string;
  projectId: string;
  narrativeType: string;
  timeline: number;
  rawData: any;
}

class FormDatabase extends Dexie {
  public formState: Dexie.Table<FormState, string>;
  public narrative: Dexie.Table<NarrativeRaw, [string, string]>;

  constructor() {
    super("FormDatabase");
    this.version(5).stores({
      formState: 'id', // Include lastUpdatedTime in the schema
      narrative: '[id+projectId], projectId, narrativeType'
    });
    this.formState = this.table("formState");
    this.narrative = this.table("narrative");
  }

  // Define the safePut function
  async safePut(item: FormState): Promise<void> {
    // Attempt to retrieve an existing item with the same ID
    const existingItem = await this.formState.get(item.id);

    // Check if the existing item is not found or if the incoming item is newer
    if (!existingItem || item.lastUpdatedTime > existingItem.lastUpdatedTime) {
      // If the incoming item is newer, update or add it to the database
      await this.formState.put(item);
    }
  }

  async getAllProjectIds() {
    const allIds = await this.formState.toCollection().primaryKeys();
    // Return all the primary keys except "settings"
    return allIds.filter((id) => id !== "settings");
  } 

  
  async dumpData() {
    const allData = await this.formState.toArray();
    console.log(allData);
  }

  async deleteNarratives(projectId: string) {
    await this.narrative.where('projectId').equals(projectId).delete();
  }
}

export const db = new FormDatabase();
