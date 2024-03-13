import React, { useState, useEffect, FunctionComponent } from 'react';
import Form, { IChangeEvent, FormProps } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { db, FormState } from './IndexedDbUtils'; // Adjust the import path as necessary

interface WithPersistedStateProps extends FormProps<any> {}

const withPersistedState = (formId: string, jsonSchema: any, jsonSchemaUi?: any, initialData?: any): FunctionComponent<WithPersistedStateProps> => {
  return (props) => {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
      // Load the initial form state from IndexedDB using Dexie
      const loadInitialState = async () => {
        const initialState: FormState | undefined = (await db.formState.get(formId)) || initialData;
        console.log(initialState)
        if (initialState && initialState.data) setFormData(initialState.data);
      };

      loadInitialState();
    }, []);

    useEffect(() => {
        // Persist form state to IndexedDB using Dexie on change
        const saveState = async () => {
            if(!formData.lastUpdatedTime) formData.lastUpdatedTime = -1;
            await db.safePut({ id: formId, data: formData, lastUpdatedTime: formData.lastUpdatedTime });
        };

        saveState();
    }, [formData]);

    const handleChange = (e: IChangeEvent<any>) => {
        e.formData.lastUpdatedTime = Date.now();
        setFormData(e.formData);
    };

    return (
        <Form
            {...props}
            schema={jsonSchema}
            uiSchema={jsonSchemaUi}
            formData={formData}
            validator={validator}
            onChange={handleChange}
        />
    );

  };
};

export default withPersistedState;
