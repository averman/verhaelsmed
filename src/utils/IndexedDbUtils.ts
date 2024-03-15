// src/db.ts
import Dexie from 'dexie';

export interface FormState {
  id: string;
  data: any;
  lastUpdatedTime: number; // Add a lastUpdatedTime field
}

class FormDatabase extends Dexie {
  public formState: Dexie.Table<FormState, string>;

  constructor() {
    super("FormDatabase");
    this.version(2).stores({
      formState: 'id, &lastUpdatedTime', // Include lastUpdatedTime in the schema
    });
    this.formState = this.table("formState");
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

  
  async dumpData() {
    const allData = await this.formState.toArray();
    console.log(allData);
  }
}

export const db = new FormDatabase();