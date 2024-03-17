import React, { useState, useEffect, FunctionComponent } from 'react';
import { IChangeEvent, FormProps } from '@rjsf/core';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { db, FormState } from './IndexedDbUtils'; // Adjust the import path as necessary
import { getFromKey } from './CommonUtils';
import Button from '@mui/material/Button';

interface WithPersistedStateProps extends FormProps<any> {}

export type PersistedStateOptions = {
  formId: string;
  jsonSchema: any;
  jsonSchemaUi?: any;
  initialData?: any;
  persistanceMapping?: any;
  saveAsKey?: string;
};

const withPersistedState = (options: PersistedStateOptions): FunctionComponent<WithPersistedStateProps> => {
  return (props) => {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
      // Load the initial form state from IndexedDB using Dexie
      const loadInitialState = async () => {
        const initialState: FormState | undefined = (await db.formState.get(options.formId)) || options.initialData;
        if (initialState && initialState.data) setFormData(initialState.data);
      };

      loadInitialState();
    }, []);

    useEffect(() => {
        // Persist form state to IndexedDB using Dexie on change
        const saveState = async () => {
            if(!formData.lastUpdatedTime) formData.lastUpdatedTime = -1;
            if(options.saveAsKey) {
                let key = getFromKey(formData, options.saveAsKey, '');
                if(key !== '') db.safePut({ id: key, data: formData, lastUpdatedTime: formData.lastUpdatedTime });
            }
            await db.safePut({ id: options.formId, data: formData, lastUpdatedTime: formData.lastUpdatedTime });
        };

        saveState();
    }, [formData]);

    const handleChange = (e: IChangeEvent<any>) => {
        e.formData.lastUpdatedTime = Date.now();
        setFormData(e.formData);
    };

    function handleReset(): void {
        setFormData(options.initialData || {});
    }

    return (
        <Form
            {...props}
            schema={options.jsonSchema}
            uiSchema={options.jsonSchemaUi}
            formData={formData}
            validator={validator}
            onSubmit={handleChange}
        >
            <Button type="submit" variant="contained" color="primary">
                Save  
            </Button>
            <Button type="reset" variant="contained" color="secondary" onClick={handleReset}>
                Reset
            </Button>
        </Form>

    );

  };
};

export default withPersistedState;
