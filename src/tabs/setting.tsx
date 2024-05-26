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
import { BorderedBox } from '../components/Deco';

const uiSchema: UiSchema = {
  projectId: {
    "ui:readonly": true,
  },
  projectName: {
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
  const { saveSettingsData, deleteSettingsData, settingsData, items, loadSettingsData } = useSettingsData();

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
    setFormData({ projectId: randomString(8) });
    // Optionally, reset to initial state or clear specific settings
  };

  const handleDelete = () => {
    let currentProjectId = formData.projectId;
    deleteSettingsData(currentProjectId);
    // Optionally, reset to initial state or clear specific settings
  };

  const handleLoadClick = () => {
    setOpen(true);
  };

  const handleLoad = async (id: string) => {
    await loadSettingsData(id); // Assuming this method or a similar one is adapted to load by ID
    setOpen(false); // Close the modal after loading
  };

  const handleImport = () => {

    // Define unique key mapping based on paths
    const uniqueKeyMapping: { [path: string]: string } = {
      'connections': 'connectionId',
      'agents': 'agentName',
      'agents.agentActions': 'name',
      'agents.agentActions.targets': 'targetName',
      // Add other paths and their unique keys here
    };

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json'; // Customize accepted file types if needed
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (result) {
            const importedData = JSON.parse(result as string);

            // Delete specific fields if they exist
            const fieldsToDelete = ['projectId', 'projectName', 'lastUpdatedTime', 'projectDescription'];
            fieldsToDelete.forEach(field => delete importedData[field]);

            // Recursively merge imported data into existing settingsData
            const mergeData = (existing: any, imported: any, path: string = ''): any => {
              if (Array.isArray(existing) && Array.isArray(imported)) {
                const mergedArray = [...existing];
                const uniqueKey = uniqueKeyMapping[path];
                imported.forEach(item => {
                  if (typeof item === 'object' && item !== null && uniqueKey) {
                    const existingIndex = mergedArray.findIndex(
                      existingItem =>
                        typeof existingItem === 'object' && existingItem !== null &&
                        existingItem[uniqueKey] === item[uniqueKey]
                    );
                    if (existingIndex !== -1) {
                      mergedArray[existingIndex] = mergeData(mergedArray[existingIndex], item, path);
                    } else {
                      mergedArray.push(item);
                    }
                  } else {
                    if (!mergedArray.includes(item)) {
                      mergedArray.push(item);
                    }
                  }
                });
                return mergedArray;
              } else if (typeof existing === 'object' && typeof imported === 'object') {
                const mergedObject = { ...existing };
                Object.keys(imported).forEach(key => {
                  const newPath = path ? `${path}.${key}` : key;
                  if (mergedObject.hasOwnProperty(key)) {
                    mergedObject[key] = mergeData(mergedObject[key], imported[key], newPath);
                  } else {
                    mergedObject[key] = imported[key];
                  }
                });
                return mergedObject;
              } else {
                return imported;
              }
            };

            const updatedData = mergeData(settingsData, importedData);
            setFormData(updatedData);
            saveSettingsData(updatedData);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    const exportData = JSON.stringify(settingsData, null, 2); // Convert settingsData to JSON string
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'settings.json'; // Set the filename for the downloaded file
    a.click();
    URL.revokeObjectURL(url);
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
          Create New
        </Button>
        <Button variant="contained" color="error" onClick={handleDelete} style={{ margin: 10 }}>
          Delete
        </Button>
      </Form>
      <BorderedBox title='Extra actions' collapsible>
        <Button variant='contained' color='secondary' onClick={handleImport} style={{ margin: 10 }}>
          Import
        </Button>
        <Button variant='contained' color='secondary' onClick={handleExport} style={{ margin: 10 }}>
          Export
        </Button>
      </BorderedBox>
      <LoadModal 
        open={open} 
        onClose={() => { setOpen(false) }} 
        items={items} 
        onSuccess={handleLoad} 
        selectionTitle='Select a project'
      />
    </>
  );
};

export default Settings;
