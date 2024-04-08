import React, { useState } from 'react';
import { IChangeEvent } from '@rjsf/core';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import Button from '@mui/material/Button';
import { FieldProps, UiSchema } from '@rjsf/utils';
import { jsonSchema } from '../models/SettingsDataModel';
import { useSettingsData } from '../contexts/SettingsDataContext';
import LoadModal from '../components/LoadModal';
import { randomString } from '../utils/Random';
import ConnectionsField from '../components/rjsf-fields/ConnectionsField';
import AgentField from '../components/rjsf-fields/AgentField';

const uiSchema: UiSchema = {
  projectId: {
    "ui:readonly": true,
  },
  projectName: {
    "ui:autofocus": true,
    "ui:emptyValue": "",
  },
  projectDescription: {
    "ui:widget": "textarea",
  },
  connections: {
    items: {
      "ui:title": "",
      "ui:field": "connections"
    },
  },
  agents: {
    items: {
      "ui:title": "",
      "ui:field": "agents"
    }
  }
};

const Settings: React.FC = () => {
  const [formData, setFormData] = useState<any>({});
  const [open, setOpen] = useState(false);
  const { saveSettingsData, settingsData, items, loadSettingsData } = useSettingsData();

  // Use settingsData from context as the initial form data
  React.useEffect(() => {
    if (settingsData) {
      setFormData(settingsData);
    }
  }, [settingsData]);

  const handleChange = (e: IChangeEvent<any>) => {
    e.formData.lastUpdatedTime = Date.now();
    if (e.formData.projectName) {
      setFormData(e.formData);
      saveSettingsData(e.formData);
    }
  };

  const handleReset = () => {
    setFormData({projectId: randomString(8)});
    // Optionally, reset to initial state or clear specific settings
  };

  const handleLoadClick = () => {
    setOpen(true);
  };

  const handleLoad = async (id: string) => {
    await loadSettingsData(id); // Assuming this method or a similar one is adapted to load by ID
    setOpen(false); // Close the modal after loading
  };

  return (
    <>
      <Form
        schema={jsonSchema}
        uiSchema={uiSchema}
        formData={formData}
        fields={{ connections: ConnectionsField, agents: AgentField }}
        onSubmit={handleChange}
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
