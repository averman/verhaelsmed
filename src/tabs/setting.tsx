import React, { useState, useEffect } from 'react';
import { IChangeEvent } from '@rjsf/core';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import Button from '@mui/material/Button';
import { UiSchema } from '@rjsf/utils';
import { randomString } from '../utils/Random';
import { db, FormState } from '../utils/IndexedDbUtils'; // Adjust the import path as necessary
import LoadModal from '../component/LoadModal';

const jsonSchema: any = {
  title: "Project Settings",
  type: "object",
  required: ["projectName"],
  properties: {
    projectId: {
      type: "string",
      title: "Project ID",
      default: randomString(8),
    },
    projectName: {
      type: "string",
      title: "Project Name",
    },
    projectDescription: {
      type: "string",
      title: "Project Description",
    },
  },
};

const uiSchema: UiSchema = {
  projectId: {
    "ui:readonly": true
  },
  projectName: {
    "ui:autofocus": true,
    "ui:emptyValue": "",
  },
  projectDescription: {
    "ui:widget": "textarea",
  },
}

const formId = 'settings';

const Settings: React.FC = () => {
  const [formData, setFormData] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{name: string, id: string, description: string}[]>([]);

  useEffect(() => {
    // Persist form state to IndexedDB using Dexie on change
    const saveState = async () => {
      if (!formData.lastUpdatedTime) formData.lastUpdatedTime = -1;
      let key = formData.projectId || '';
      if(key !== '' && formData.projectDescription) 
        db.safePut({ id: key, data: formData, lastUpdatedTime: formData.lastUpdatedTime });
      await db.safePut({ id: formId, data: formData, lastUpdatedTime: formData.lastUpdatedTime });

      // Update the list of items
      const allIds = await db.getAllProjectIds();
      const items = await Promise.all(allIds.map(async (id) => {
        const data = await db.formState.get(id);
        return { name: data?.data.projectName || '', id: id, description: data?.data.projectDescription || '' };
      }));
      setItems(items);
      
    };

    saveState();
  }, [formData]);

  useEffect(() => {
    // Load the initial form state from IndexedDB using Dexie
    const loadInitialState = async () => {
      const initialState: FormState | undefined = await db.formState.get(formId);
      if (initialState && initialState.data) {
        setFormData(initialState.data);
        console.log(initialState);
      }
    };

    loadInitialState();
  }, []);

  const handleChange = (e: IChangeEvent<any>) => {
    e.formData.lastUpdatedTime = Date.now();
    if(e.formData.projectName) {
      setFormData(e.formData);
    }
  };

  const handleReset = () => {
    setFormData({});
  }

  const handleLoadClick = () => {
    setOpen(true);
  }

  const handleLoad = async (id: string) => {
    const data = await db.formState.get(id);
    console.log(data);
    if (data) setFormData(data.data);
  }

  return (
    <>
      <Form
        schema={jsonSchema}
        uiSchema={uiSchema}
        formData={formData}
        onChange={handleChange}
        validator={validator}
      >
        <Button type="submit" variant="contained" color="primary" style={{ margin: 10 }}>
          Save
        </Button>
        <Button variant="contained" color="secondary" onClick={handleLoadClick} style={{ margin: 10 }}>
          Load
        </Button>
        <Button variant="contained" color="error" onClick={handleReset} style={{ margin: 10 }}>
          Reset
        </Button>
      </Form>
      <LoadModal open={open} onClose={() => {setOpen(false)}} items={items} onSuccess={handleLoad} />
    </>
  );
};

export default Settings;
